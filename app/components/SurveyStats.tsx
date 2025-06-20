import { useState } from 'react';
import { Survey, Response, User } from '../types';

interface SurveyStatsProps {
  survey: Survey;
  responses: Response[];
  users: User[];
}

export default function SurveyStats({ survey, responses, users }: SurveyStatsProps) {
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUserResponse, setSelectedUserResponse] = useState<Response | null>(null);

  const getUserName = (userId: string) => {
    if (!Array.isArray(users)) return 'Bilinmeyen Kullanıcı';
    const user = users.find(u => u.id === userId);
    if (user) return `${user.name} ${user.surname}`;
    return 'Bilinmeyen Kullanıcı';
  };

  const getQuestionStats = (questionId: string) => {
    const answers = responses.flatMap(response =>
      response.answers.filter(answer => answer.questionId === questionId)
    );
    const totalAnswers = answers.length;
    const optionCounts: Record<string, number> = {};

    answers.forEach(answer => {
      const a = answer as { optionId?: string; answer?: string };
      const optionKey = a.optionId || a.answer;
      if (optionKey) {
        optionCounts[optionKey] = (optionCounts[optionKey] || 0) + 1;
      }
    });

    return { totalAnswers, optionCounts };
  };

  const getNextQuestionText = (questionId: string, optionId: string) => {
    const question = survey.questions.find(q => q.id === questionId);
    const nextQuestionId = question?.nextQuestionMap?.[optionId];
    if (nextQuestionId) {
      const nextQuestion = survey.questions.find(q => q.id === nextQuestionId);
      return nextQuestion?.text;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Geçersiz Tarih';
      }
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Geçersiz Tarih';
    }
  };

  const uniqueUsers = Array.from(new Set(responses.map(r => r.userId)));

  // Color palette for better visualization
  const getBarColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage >= 50) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (percentage >= 25) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getStatColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 50) return 'text-blue-600 bg-blue-50';
    if (percentage >= 25) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
          Anket İstatistikleri
        </h3>
            <p className="text-gray-600 mt-2">Detaylı yanıt analizi ve kullanıcı istatistikleri</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            {responses.length} Yanıt
            </div>
          <button
            onClick={() => setShowUsersModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
          >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            {uniqueUsers.length} Kullanıcı
          </button>
          </div>
        </div>
      </div>

      {/* Questions Statistics */}
      <div className="space-y-6">
        {survey.questions.map((question, questionIndex) => {
          const { totalAnswers, optionCounts } = getQuestionStats(question.id);

          return (
            <div key={question.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="p-6 lg:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-semibold mr-3">
                        {questionIndex + 1}
                      </span>
                      <h4 className="text-lg lg:text-xl font-semibold text-gray-900">{question.text}</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      Toplam {totalAnswers} yanıt alındı
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {question.options.map((option, optionIndex) => {
                  const count = optionCounts[option.id] || 0;
                  const percentage = totalAnswers > 0
                    ? Math.round((count / totalAnswers) * 100)
                    : 0;
                  const nextQuestionText = getNextQuestionText(question.id, option.id);

                  return (
                      <div key={option.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 lg:p-5 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center flex-1 min-w-0">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-white rounded-lg text-xs font-semibold text-gray-600 mr-3 flex-shrink-0">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="text-sm lg:text-base font-medium text-gray-900 truncate">{option.text}</span>
                          </div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${getStatColor(percentage)}`}>
                            {count} ({percentage}%)
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative mb-3">
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                              className={`h-full ${getBarColor(percentage)} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                          {percentage > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-white drop-shadow-sm">
                                {percentage >= 15 ? `${percentage}%` : ''}
                              </span>
                      </div>
                          )}
                        </div>

                        {/* Next Question Info */}
                      {nextQuestionText && (
                          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <div className="text-xs lg:text-sm text-blue-700">
                              <span className="font-medium">Bu cevap sonrası:</span>
                              <br />
                              <span className="italic">"{nextQuestionText}"</span>
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full my-8 max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Kullanıcı Yanıtları
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{responses.length} toplam yanıt</p>
                </div>
              <button
                onClick={() => setShowUsersModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-3">
                {responses.map((response, index) => (
                  <button
                    key={response.id}
                    onClick={() => {
                      setSelectedUserResponse(response);
                    }}
                    className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 border border-gray-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-between group hover:shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                        {getUserName(response.userId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(response.completedAt)}
                        </div>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Response Modal */}
      {selectedUserResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                    <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {getUserName(selectedUserResponse.userId)}
              </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Yanıtlanma Tarihi: {formatDate(selectedUserResponse.completedAt)}
                  </p>
                </div>
              <button
                onClick={() => setSelectedUserResponse(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {selectedUserResponse.answers.map((answer, index) => {
                  const question = survey.questions.find(q => q.id === answer.questionId);
                  const a = answer as { optionId?: string; answer?: string };
                  const selectedOptionId = a.optionId || a.answer;
                  const nextQuestionText = getNextQuestionText(answer.questionId, a.optionId || "");

                  return (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center mb-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-semibold mr-3">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-base lg:text-lg">{question?.text}</h3>
                      </div>
                      <div className="space-y-2 ml-11">
                        {question?.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                              opt.id === selectedOptionId
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105"
                                : "bg-white text-gray-700 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{opt.text}</span>
                            {opt.id === selectedOptionId && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {nextQuestionText && (
                        <div className="mt-4 ml-11 flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <div className="text-sm text-blue-700">
                            <span className="font-medium">Bu cevap sonrası:</span>
                            <br />
                            <span className="italic">"{nextQuestionText}"</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
