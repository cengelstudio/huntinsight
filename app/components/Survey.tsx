'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, Option, Survey } from '../types/index';

export default function Survey() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Kullanıcı bilgileri yoksa localStorage'a örnek değerler ata
  useEffect(() => {
    // Clear existing values
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('surname');

    // Set new values
    localStorage.setItem('userId', crypto.randomUUID());
    localStorage.setItem('name', 'Misafir');
    localStorage.setItem('surname', 'Kullanıcı');
  }, []);

  useEffect(() => {
    // Fetch the survey
    const surveyId = localStorage.getItem('surveyId');
    if (surveyId) {
      fetchSurvey(surveyId);
    }
  }, []);

  const fetchSurvey = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (response.ok) {
        const surveyData = await response.json();
        setSurvey(surveyData);
        setCurrentQuestion(surveyData.questions[0]);
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (option: Option) => {
    if (!currentQuestion || !survey) return;

    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option.id,
    }));

    // Get the next question ID based on the selected option
    const nextQuestionId = currentQuestion.nextQuestionMap[option.id];

    if (nextQuestionId) {
      // Find the next question
      const nextQuestion = survey.questions.find(q => q.id === nextQuestionId);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        // Update progress
        const answeredCount = Object.keys(answers).length + 1;
        setProgress((answeredCount / survey.questions.length) * 100);
      } else {
        // No more questions, submit the survey
        submitSurvey();
      }
    } else {
      // No more questions, submit the survey
      submitSurvey();
    }
  };

  const submitSurvey = async () => {
    if (!survey) return;

    const name = localStorage.getItem('name');
    const surname = localStorage.getItem('surname');
    const userId = localStorage.getItem('userId');

    if (!name || !surname || !userId) {
      alert('Lütfen önce kullanıcı bilgilerinizi giriniz.');
      return;
    }

    const requestData = {
      id: crypto.randomUUID(),
      surveyId: survey.id,
      userId: userId,
      name: name,
      surname: surname,
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      })),
      completedAt: new Date().toISOString(),
    };

    console.log('Submitting survey with data:', requestData);

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        router.push('/thank-you');
      } else {
        const error = await response.json();
        console.error('Server error response:', error);
        alert(error.error || 'Cevaplar kaydedilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Cevaplar kaydedilirken bir hata oluştu.');
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                  İlerleme
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary-600">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {currentQuestion.text}
            </h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
