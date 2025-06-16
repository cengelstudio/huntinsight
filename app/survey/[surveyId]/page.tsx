'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Survey, Question, Answer } from '@/app/types';

export default function SurveyPage({ params }: { params: { surveyId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/');
      return;
    }
    fetchSurvey();
  }, [userId]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${params.surveyId}`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data);
      } else {
        setError('Anket bulunamadı.');
      }
    } catch (error) {
      setError('Anket yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!survey) return;

    const currentQuestion = survey.questions[currentQuestionIndex];
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer,
      userId: userId!,
      surveyId: params.surveyId,
    };

    setAnswers([...answers, newAnswer]);

    // Eğer branching logic varsa ve cevaba göre bir sonraki soru belirtilmişse
    const nextQuestionId = currentQuestion.branching?.[answer];
    if (nextQuestionId) {
      const nextIndex = survey.questions.findIndex(q => q.id === nextQuestionId);
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
        return;
      }
    }

    // Normal akış - bir sonraki soruya geç
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId: params.surveyId,
          userId,
          answers,
        }),
      });

      if (response.ok) {
        router.push('/thank-you');
      } else {
        setError('Cevaplar kaydedilirken bir hata oluştu.');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata</h2>
          <p className="text-gray-600">{error || 'Anket bulunamadı.'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            <span className="text-sm text-gray-500">
              Soru {currentQuestionIndex + 1} / {survey.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={submitting}
                className="w-full text-left px-6 py-4 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
