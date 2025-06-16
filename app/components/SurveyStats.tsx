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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Anket İstatistikleri
        </h3>
        <div className="flex gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {responses.length} Yanıt
          </span>
          <button
            onClick={() => setShowUsersModal(true)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
          >
            {uniqueUsers.length} Kullanıcı
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {survey.questions.map((question) => {
          const { totalAnswers, optionCounts } = getQuestionStats(question.id);

          return (
            <div key={question.id} className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">{question.text}</h4>
              <div className="space-y-3">
                {question.options.map((option) => {
                  const count = optionCounts[option.id] || 0;
                  const percentage = totalAnswers > 0
                    ? Math.round((count / totalAnswers) * 100)
                    : 0;
                  const nextQuestionText = getNextQuestionText(question.id, option.id);

                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{option.text}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      {nextQuestionText && (
                        <div className="text-xs text-gray-500 pl-2 border-l-2 border-gray-300">
                          Bu cevap sonrası: &ldquo;{nextQuestionText}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Kullanıcı Yanıtları</h2>
              <button
                onClick={() => setShowUsersModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-2">
                {responses.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => {
                      setSelectedUserResponse(response);
                    }}
                    className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {getUserName(response.userId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(response.completedAt)}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {getUserName(selectedUserResponse.userId)} - Yanıtlar
              </h2>
              <button
                onClick={() => setSelectedUserResponse(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="text-sm text-gray-500 mb-4">
                Yanıtlanma Tarihi: {formatDate(selectedUserResponse.completedAt)}
              </div>
              <div className="space-y-4">
                {selectedUserResponse.answers.map((answer, index) => {
                  const question = survey.questions.find(q => q.id === answer.questionId);
                  const a = answer as { optionId?: string; answer?: string };
                  const selectedOptionId = a.optionId || a.answer;
                  const nextQuestionText = getNextQuestionText(answer.questionId, a.optionId || "");

                  return (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="font-medium text-gray-900 mb-2">{question?.text}</div>
                      <div className="space-y-1">
                        {question?.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={
                              "px-3 py-1 rounded " +
                              (opt.id === selectedOptionId
                                ? "bg-primary-100 text-primary-800 font-semibold"
                                : "bg-gray-100 text-gray-700")
                            }
                          >
                            {opt.text}
                            {opt.id === selectedOptionId && (
                              <span className="ml-2 text-xs text-primary-600">(Seçilen)</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {nextQuestionText && (
                        <div className="mt-2 text-sm text-gray-500 pl-2 border-l-2 border-gray-300">
                          Bu cevap sonrası: &ldquo;{nextQuestionText}&rdquo;
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
