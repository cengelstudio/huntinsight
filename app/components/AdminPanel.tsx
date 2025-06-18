'use client';

import { useState, useEffect } from 'react';
import { Survey, User, Question, Response } from '../types';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: [{ text: '' }],
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [surveysRes, responsesRes, usersRes] = await Promise.all([
        fetch('/api/surveys'),
        fetch('/api/responses'),
        fetch('/api/users'),
      ]);

      if (surveysRes.ok) setSurveys(await surveysRes.json());
      if (responsesRes.ok) setResponses(await responsesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleCreateSurvey = async () => {
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          title: 'Yeni Anket',
          description: '',
          questions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedSurvey || !newQuestion.text || newQuestion.options.some(opt => !opt.text)) {
      alert('Lütfen soru metnini ve tüm seçenekleri doldurun.');
      return;
    }

    const question: Question = {
      id: `q${selectedSurvey.questions.length + 1}`,
      text: newQuestion.text,
      options: newQuestion.options.map((opt, index) => ({
        id: `q${selectedSurvey.questions.length + 1}_opt${index + 1}`,
        text: opt.text,
      })),
      nextQuestionMap: {},
    };

    // Create nextQuestionMap based on the next question
    const nextQuestionId = selectedSurvey.questions.length + 2 <= selectedSurvey.questions.length
      ? `q${selectedSurvey.questions.length + 2}`
      : null;

    const nextQuestionMap: Record<string, string | null> = {};
    question.options.forEach(opt => {
      nextQuestionMap[opt.id] = nextQuestionId;
    });
    question.nextQuestionMap = nextQuestionMap;

    const updatedSurvey = {
      ...selectedSurvey,
      questions: [...selectedSurvey.questions, question],
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`/api/surveys/${selectedSurvey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSurvey),
      });

      if (response.ok) {
        setSurveys(surveys.map(s => s.id === selectedSurvey.id ? updatedSurvey : s));
        setSelectedSurvey(updatedSurvey);
        setNewQuestion({ text: '', options: [{ text: '' }] });
        alert('Soru başarıyla eklendi!');
      } else {
        alert('Soru eklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Soru eklenirken bir hata oluştu.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Yönetici Girişi</h2>
            <p className="mt-2 text-sm text-gray-600">
              Yönetici paneline erişmek için şifrenizi giriniz
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Giriş Yap
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yönetici Paneli</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Surveys Section */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Anketler</h2>
              <button
                onClick={handleCreateSurvey}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Yeni Anket
              </button>
            </div>
            <div className="space-y-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedSurvey?.id === survey.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedSurvey(survey)}
                >
                  <h3 className="font-medium text-gray-900">{survey.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {survey.questions.length} soru
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sorular</h2>
            {selectedSurvey ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  {selectedSurvey.questions.map((question) => (
                    <div key={question.id} className="p-4 border-2 border-gray-200 rounded-xl">
                      <p className="font-medium text-gray-900">{question.text}</p>
                      <div className="mt-2 space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-primary-400 rounded-full mr-2"></div>
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Question Form */}
                <div className="mt-6 p-4 border-2 border-gray-200 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-4">Yeni Soru Ekle</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Soru Metni
                      </label>
                      <input
                        type="text"
                        value={newQuestion.text}
                        onChange={(e) =>
                          setNewQuestion({ ...newQuestion, text: e.target.value })
                        }
                        className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                        placeholder="Sorunuzu yazın"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seçenekler
                      </label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="mt-2">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = { text: e.target.value };
                              setNewQuestion({ ...newQuestion, options: newOptions });
                            }}
                            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                            placeholder={`${index + 1}. seçenek`}
                          />
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          setNewQuestion({
                            ...newQuestion,
                            options: [...newQuestion.options, { text: '' }],
                          })
                        }
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
                      >
                        + Seçenek Ekle
                      </button>
                    </div>
                    <button
                      onClick={handleAddQuestion}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      Soru Ekle
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Lütfen bir anket seçin</p>
            )}
          </div>
        </div>

        {/* Responses Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Yanıtlar</h2>
          <div className="space-y-4">
            {responses.map((response) => {
              const user = users.find((u) => u.id === response.userId);
              return (
                <div key={response.id} className="p-4 border-2 border-gray-200 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user ? `${user.name} ${user.surname}` : 'Bilinmeyen Kullanıcı'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(response.completedAt).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {response.answers.map((answer, index) => {
                      const question = selectedSurvey?.questions.find(
                        (q) => q.id === answer.questionId
                      );
                      const option = question?.options.find(
                        (o) => o.id === answer.optionId
                      );
                      return (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-700">{question?.text}:</span>{' '}
                          <span className="text-gray-900">{option?.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
