"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Survey, Question, Answer, Option } from "../../types";
import Image from "next/image";
import ErrorPage from '@/app/components/ErrorPage';
import LoadingScreen from '../../components/LoadingScreen';

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
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (!userId) {
      router.push("/register");
      return;
    }

    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem("userId", userData.id);
          localStorage.setItem("name", userData.name);
          localStorage.setItem("surname", userData.surname);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/register");
      }
    };

    fetchUserData();

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

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (!selectedOption || !survey) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Save the answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      optionId: selectedOption.id,
    };

    setAnswers([...answers, newAnswer]);

    // Get next question based on the selected option's nextQuestionId
    if (selectedOption.nextQuestionId) {
      const nextQuestion = survey.questions.find(q => q.id === selectedOption.nextQuestionId);
      if (nextQuestion) {
        // Update question sequence
        const newSequence = [...questionSequence.slice(0, currentQuestionIndex + 1), selectedOption.nextQuestionId];
        setQuestionSequence(newSequence);

        // Update total expected questions based on the new path
        const newTotal = calculateTotalExpectedQuestions(survey, nextQuestion, referencedQuestions);
        setTotalExpectedQuestions(currentQuestionIndex + 1 + newTotal);

        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
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
        setSelectedOption(null);
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
      const name = localStorage.getItem("name");
      const surname = localStorage.getItem("surname");

      if (!userId || !name || !surname) {
        throw new Error("Kullanıcı bilgileri eksik. Lütfen tekrar giriş yapın.");
      }

      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          surveyId: survey!.id,
          userId,
          name,
          surname,
          answers: finalAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Cevaplar kaydedilirken bir hata oluştu.");
      }

      router.push("/thank-you");
    } catch (error) {
      console.error("Response submission error:", error);
      setError(error instanceof Error ? error.message : "Cevaplarınız kaydedilirken bir hata oluştu.");
    }
  };

  const calculateProgress = (): number => {
    if (!survey || !questionSequence.length || totalExpectedQuestions === 0) return 0;
    return (currentQuestionIndex + 1) / totalExpectedQuestions * 100;
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Remove the last answer when going back
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const handleCompleteQuestion = () => {
    if (!selectedOption || !survey) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Save the last answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      optionId: selectedOption.id,
    };

    // Add the last answer to the answers array and submit
    const finalAnswers = [...answers, newAnswer];
    submitSurvey(finalAnswers);
  };

  if (loading) {
    return <LoadingScreen message="Anket yükleniyor..." />;
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    return <ErrorPage message="Anket bulunamadı." showRetry={false} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-48 h-16 relative mx-auto">
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
        </div>

        {/* Survey Info and Progress */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-sm border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{survey?.title}</h1>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-lg">Soru {currentQuestionIndex + 1} / {totalExpectedQuestions}</span>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span className="text-lg">{Math.round(calculateProgress())}% Tamamlandı</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out rounded-full"
              style={{
                width: `${calculateProgress()}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-sm border border-white/20">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{currentQuestion.text}</h2>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className="w-full group relative"
              >
                <div className="absolute inset-0 bg-blue-50 rounded-xl transition-all duration-200
                              transform scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100" />
                <div className={`relative flex items-center w-full px-6 py-4 rounded-xl border-2
                              ${selectedOption?.id === option.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 group-hover:border-blue-500'}
                              transition-all duration-200`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2
                                ${selectedOption?.id === option.id
                                  ? 'border-blue-500'
                                  : 'border-gray-300 group-hover:border-blue-500'}
                                flex items-center justify-center mr-4`}>
                    <div className={`w-3 h-3 rounded-full transition-all duration-200
                                  ${selectedOption?.id === option.id
                                    ? 'bg-blue-500'
                                    : 'bg-transparent group-hover:bg-blue-500'}`} />
                  </div>
                  <span className="text-lg text-gray-700 group-hover:text-gray-900 font-medium">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center space-x-4">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 min-w-[160px]
                        ${currentQuestionIndex === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-2 border-blue-200 hover:border-blue-300'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Önceki Soru
            </button>

            {(!getNextSequentialQuestion(currentQuestion.id) && !currentQuestion.options.some(opt => opt.nextQuestionId)) ? (
              <button
                onClick={handleCompleteQuestion}
                disabled={!selectedOption}
                className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 min-w-[160px]
                          ${!selectedOption
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'}`}
              >
                <span className="mr-2">Anketi Tamamla</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedOption}
                className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 min-w-[160px]
                          ${!selectedOption
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'}`}
              >
                <span className="mr-2">Sıradaki Soru</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="flex justify-center space-x-6 mb-4">
              <a href="https://www.facebook.com/kktcavcilik" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="http://avfed.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                <span className="sr-only">Web Sitesi</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            </div>
            <p className="text-gray-600">
              © {new Date().getFullYear()} K.K.T.C. Avcılık Federasyonu. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
