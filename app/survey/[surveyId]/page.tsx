"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Survey, Question, Answer, Option } from "../../types";
import Image from "next/image";
import ErrorPage from '@/app/components/ErrorPage';

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [questionSequence, setQuestionSequence] = useState<string[]>([]);
  const [totalExpectedQuestions, setTotalExpectedQuestions] = useState<number>(0);
  const [referencedQuestions, setReferencedQuestions] = useState<Set<string>>(new Set());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (!userId) {
      router.push("/register");
      return;
    }
    localStorage.setItem("userId", userId);

    const fetchSurvey = async () => {
      try {
        console.log("Fetching survey with ID:", params.surveyId);
        const response = await fetch(`/api/surveys/${params.surveyId}`);
        console.log("Response status:", response.status);

        const data = await response.json();
        console.log("Response data:", data);

        if (!response.ok) {
          throw new Error(data.error || "Anket yüklenirken bir hata oluştu.");
        }

        // Find all questions that are referenced by options
        const referenced = new Set<string>();
        data.questions.forEach((question: Question) => {
          question.options.forEach((option: Option) => {
            if (option.nextQuestionId) {
              referenced.add(option.nextQuestionId);
            }
          });
        });
        setReferencedQuestions(referenced);

        setSurvey(data);

        if (data.questions && data.questions.length > 0) {
          // Find the first unreferenced question to start with
          const firstQuestion = data.questions.find((q: Question) => !referenced.has(q.id));
          if (firstQuestion) {
            setQuestionSequence([firstQuestion.id]);
            const initialTotal = calculateTotalExpectedQuestions(data, firstQuestion, referenced);
            setTotalExpectedQuestions(initialTotal);
          }
        }
      } catch (error) {
        console.error("Survey fetch error:", error);
        setError(error instanceof Error ? error.message : "Anket yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [params.surveyId, searchParams, router]);

  // Function to get the next sequential unreferenced question
  const getNextSequentialQuestion = (currentQuestionId: string): string | null => {
    if (!survey) return null;

    const currentIndex = survey.questions.findIndex(q => q.id === currentQuestionId);
    if (currentIndex === -1 || currentIndex === survey.questions.length - 1) return null;

    // Look for the next unreferenced question
    for (let i = currentIndex + 1; i < survey.questions.length; i++) {
      const question = survey.questions[i];
      if (!referencedQuestions.has(question.id)) {
        return question.id;
      }
    }

    return null;
  };

  const calculateTotalExpectedQuestions = (
    survey: Survey,
    currentQuestion: Question,
    referenced: Set<string>
  ): number => {
    // Start with 1 to count the current question
    let total = 1;

    // Look at each option of the current question
    for (const option of currentQuestion.options) {
      if (option.nextQuestionId) {
        // Find the next question
        const nextQuestion = survey.questions.find(q => q.id === option.nextQuestionId);
        if (nextQuestion) {
          // For each option's path, calculate the maximum possible questions
          const pathTotal = calculateTotalExpectedQuestions(survey, nextQuestion, referenced);
          // Update total if this path has more questions
          total = Math.max(total, 1 + pathTotal);
        }
      }
    }

    // If no nextQuestionId in any option, look for the next unreferenced question
    let nextQuestionId = getNextSequentialQuestion(currentQuestion.id);
    while (nextQuestionId) {
      const nextQuestion = survey.questions.find(q => q.id === nextQuestionId);
      if (!nextQuestion || referenced.has(nextQuestion.id)) break;
      total++;
      nextQuestionId = getNextSequentialQuestion(nextQuestion.id);
    }

    return total;
  };

  const getCurrentQuestion = (): Question | null => {
    if (!survey || !questionSequence[currentQuestionIndex]) {
      return null;
    }
    return survey.questions.find(q => q.id === questionSequence[currentQuestionIndex]) || null;
  };

  const handleAnswer = async (option: Option) => {
    if (!survey) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Save the answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      optionId: option.id,
    };

    setAnswers([...answers, newAnswer]);

    // Get next question based on the selected option's nextQuestionId
    if (option.nextQuestionId) {
      const nextQuestion = survey.questions.find(q => q.id === option.nextQuestionId);
      if (nextQuestion) {
        // Update question sequence
        const newSequence = [...questionSequence.slice(0, currentQuestionIndex + 1), option.nextQuestionId];
        setQuestionSequence(newSequence);

        // Update total expected questions based on the new path
        const newTotal = calculateTotalExpectedQuestions(survey, nextQuestion, referencedQuestions);
        setTotalExpectedQuestions(currentQuestionIndex + 1 + newTotal);

        setCurrentQuestionIndex(prev => prev + 1);
        return;
      }
    }

    // If no nextQuestionId or referenced question, find next unreferenced question
    const nextSequentialQuestionId = getNextSequentialQuestion(currentQuestion.id);
    if (nextSequentialQuestionId) {
      const nextQuestion = survey.questions.find(q => q.id === nextSequentialQuestionId);
      if (nextQuestion && !referencedQuestions.has(nextQuestion.id)) {
        // Update question sequence with the next sequential question
        const newSequence = [...questionSequence.slice(0, currentQuestionIndex + 1), nextSequentialQuestionId];
        setQuestionSequence(newSequence);

        // Update total expected questions based on the sequential path
        const newTotal = calculateTotalExpectedQuestions(survey, nextQuestion, referencedQuestions);
        setTotalExpectedQuestions(currentQuestionIndex + 1 + newTotal);

        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // If next question is referenced but not selected, survey is complete
        submitSurvey([...answers, newAnswer]);
      }
    } else {
      // If no next unreferenced question exists, survey is complete
      submitSurvey([...answers, newAnswer]);
    }
  };

  const submitSurvey = async (finalAnswers: Answer[]) => {
    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      const userSurname = localStorage.getItem("userSurname");

      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          surveyId: survey!.id,
          userId,
          userName,
          userSurname,
          answers: finalAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error("Cevaplar kaydedilirken bir hata oluştu.");
      }

      router.push("/thank-you");
    } catch (error) {
      console.error("Response submission error:", error);
      setError("Cevaplarınız kaydedilirken bir hata oluştu.");
    }
  };

  const calculateProgress = (): number => {
    if (!survey || !questionSequence.length || totalExpectedQuestions === 0) return 0;
    return (currentQuestionIndex + 1) / totalExpectedQuestions * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="p-8 rounded-2xl bg-white shadow-xl flex flex-col items-center space-y-4">
          <div className="w-32 h-32 relative mb-4">
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} />
          </div>
          <div className="animate-pulse flex space-x-4">
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          </div>
          <div className="text-xl font-medium text-gray-700">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    return <ErrorPage message="Anket bulunamadı." showRetry={false} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-48 h-16 relative mx-auto">
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
        </div>

        {/* Survey Info and Progress */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{survey?.title}</h1>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-lg">Soru {currentQuestionIndex + 1} / {totalExpectedQuestions}</span>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-lg">{Math.round(calculateProgress())}% Tamamlandı</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out rounded-full"
              style={{
                width: `${calculateProgress()}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{currentQuestion.text}</h2>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option)}
                className="w-full group relative"
              >
                <div className="absolute inset-0 bg-blue-50 rounded-xl transition-all duration-200
                              transform scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100" />
                <div className="relative flex items-center w-full px-6 py-4 rounded-xl border-2
                              border-gray-200 group-hover:border-blue-500 transition-all duration-200">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300
                                group-hover:border-blue-500 flex items-center justify-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-transparent
                                  group-hover:bg-blue-500 transition-all duration-200" />
                  </div>
                  <span className="text-lg text-gray-700 group-hover:text-gray-900 font-medium">
                    {option.text}
                  </span>
                  <div className="ml-auto transform translate-x-2 opacity-0
                                group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            K.K.T.C. Avcılık Federasyonu © {new Date().getFullYear()} | Tüm Hakları Saklıdır
          </p>
        </div>
      </div>
    </div>
  );
}
