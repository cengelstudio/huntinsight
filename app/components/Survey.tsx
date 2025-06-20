'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, Option, Survey } from '../types/index';
import LoadingScreen from './LoadingScreen';

export default function Survey() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

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

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (!selectedOption || !currentQuestion || !survey) return;

    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption.id,
    }));

    // Get the next question ID based on the selected option
    const nextQuestionId = currentQuestion.nextQuestionMap[selectedOption.id];

    if (nextQuestionId) {
      // Find the next question
      const nextQuestion = survey.questions.find(q => q.id === nextQuestionId);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setSelectedOption(null);
        // Update progress
        const answeredCount = Object.keys(answers).length + 1;
        setProgress((answeredCount / survey.questions.length) * 100);
      } else {
        // No more questions, submit the survey
        submitSurvey();
      }
    } else {
      // No next question defined, show confirmation modal
      setShowFinishModal(true);
    }
  };

  // Check if the selected option will end the survey
  const willSurveyEnd = () => {
    if (!selectedOption || !currentQuestion) return false;
    const nextQuestionId = currentQuestion.nextQuestionMap[selectedOption.id];
    return !nextQuestionId;
  };

  // Get current question number
  const getCurrentQuestionNumber = () => {
    if (!survey || !currentQuestion) return 0;
    return survey.questions.findIndex(q => q.id === currentQuestion.id) + 1;
  };

  // Check if this is the last question in the survey
  const isLastQuestion = () => {
    if (!survey || !currentQuestion) return false;
    return getCurrentQuestionNumber() === survey.questions.length;
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

  const handleFinishSurvey = () => {
    setShowFinishModal(false);
    submitSurvey();
  };

  const handleContinueSurvey = () => {
    setShowFinishModal(false);
    setSelectedOption(null);
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
    return <LoadingScreen message="Anket yükleniyor..." />;
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
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 ${
                    selectedOption?.id === option.id
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-4 transition-all duration-200 ${
                      selectedOption?.id === option.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOption?.id === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  {option.text}
                  </div>
                </button>
              ))}
            </div>

            {/* Next Question Button */}
            <div className="flex flex-col items-end space-y-3">
              {/* Warning message if survey will end early */}
              {selectedOption && willSurveyEnd() && !isLastQuestion() && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Dikkat!</p>
                      <p className="text-amber-700">
                        Bu cevap anketi bitirecek ({getCurrentQuestionNumber()}/{survey?.questions.length} soru tamamlandı)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleNextQuestion}
                disabled={!selectedOption}
                className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  selectedOption
                    ? willSurveyEnd()
                      ? 'text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                {willSurveyEnd() ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Anketi Bitir
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Sıradaki Soru
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Finish Survey Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Anketi Bitir</h3>
                  <p className="text-sm text-gray-600">Bu cevap için sıradaki soru yok</p>
                </div>
              </div>

                             <p className="text-gray-700 mb-6">
                 Seçtiğiniz cevap için tanımlanmış bir sonraki soru bulunmuyor.
                 <br />
                 <strong>({getCurrentQuestionNumber()}/{survey?.questions.length} soru tamamlandı)</strong>
                 <br /><br />
                 Anketi şimdi bitirmek istiyor musunuz?
               </p>

              <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleContinueSurvey}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                >
                  Geri Dön
                </button>
                <button
                  onClick={handleFinishSurvey}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Anketi Bitir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
