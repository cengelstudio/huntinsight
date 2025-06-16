'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '../types';

export default function Survey() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch the first question
    fetchQuestion('first');
  }, []);

  const fetchQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`);
      if (response.ok) {
        const question = await response.json();
        setCurrentQuestion(question);
        // Update progress (this is an example, adjust based on your needs)
        setProgress((prev) => Math.min(prev + 20, 100));
      } else {
        // If no more questions, submit the survey
        submitSurvey();
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (!currentQuestion) return;

    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));

    // Get the next question ID based on the selected option
    const nextQuestionId = currentQuestion.nextQuestionMap[optionId];

    if (nextQuestionId) {
      // Fetch the next question
      await fetchQuestion(nextQuestionId);
    } else {
      // No more questions, submit the survey
      submitSurvey();
    }
  };

  const submitSurvey = async () => {
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
          })),
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        router.push('/thank-you');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-right">{progress}% tamamlandı</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.text}</h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-4 flex-shrink-0 group-hover:border-primary-500"></div>
                    <span className="text-lg text-gray-900">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
