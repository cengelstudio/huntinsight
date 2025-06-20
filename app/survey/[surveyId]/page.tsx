"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Survey, Question, Answer, Option } from "../../types";
import Image from "next/image";
import ErrorPage from '@/app/components/ErrorPage';
import LoadingScreen from '../../components/LoadingScreen';
import Footer from '../../components/Footer';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-56 h-20 relative mx-auto transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo-long.png" alt="AvGörüş Logo" fill style={{objectFit: "contain"}} priority />
          </div>
        </div>

        {/* Survey Info and Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 select-none">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {survey?.title}
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-600 select-none">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold">Soru {currentQuestionIndex + 1} / {totalExpectedQuestions}</span>
              </div>
              <div className="hidden sm:block w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold">{Math.round(calculateProgress())}% Tamamlandı</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out rounded-full relative"
              style={{
                width: `${calculateProgress()}%`,
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-white/50">
          {/* Question */}
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed select-none">{currentQuestion.text}</h2>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className="w-full group relative transform transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl transition-all duration-300 transform scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100" />
                <div className={`relative flex items-center w-full px-6 py-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedOption?.id === option.id
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                    : 'border-gray-200 group-hover:border-blue-400 bg-white/50 group-hover:bg-white/80'
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                    selectedOption?.id === option.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {selectedOption?.id === option.id ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        selectedOption?.id === option.id ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-100'
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-lg md:text-xl text-gray-800 group-hover:text-gray-900 font-medium leading-relaxed select-none">
                      {option.text}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <span className="text-sm font-medium select-none">{String.fromCharCode(65 + index)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 min-w-[180px] ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="select-none">Önceki Soru</span>
            </button>

            {(!getNextSequentialQuestion(currentQuestion.id) && !currentQuestion.options.some(opt => opt.nextQuestionId)) ? (
              <button
                onClick={handleCompleteQuestion}
                disabled={!selectedOption}
                className={`w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 min-w-[180px] ${
                  !selectedOption
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                <span className="mr-3 select-none">Anketi Tamamla</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedOption}
                className={`w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 min-w-[180px] ${
                  !selectedOption
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                <span className="mr-3 select-none">Sıradaki Soru</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
