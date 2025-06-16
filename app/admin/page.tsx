"use client";

import { useState, useEffect } from "react";
import SurveyCreator from "../components/SurveyCreator";
import { Survey, Response, User } from "../types/index";
import Image from "next/image";
import SurveyFlowModal from "../components/SurveyFlowModal";
import SurveyStatsModal from "../components/SurveyStatsModal";
import Masonry from 'react-masonry-css';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<{
    survey: Survey;
    response: Response;
  } | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedSurveyForStats, setSelectedSurveyForStats] = useState<Survey | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    };
    fetchUsers();
  }, []);

  const loadData = async () => {
    try {
      const [surveysRes, responsesRes, usersRes] = await Promise.all([
        fetch("/api/surveys"),
        fetch("/api/responses"),
        fetch("/api/users")
      ]);

      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        setSurveys(surveysData);
      }

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json();
        setResponses(responsesData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real application, this should be handled securely on the server
      if (password === "admin123") {
        setIsAuthenticated(true);
        localStorage.setItem("adminAuth", "true");
        await loadData();
      } else {
        alert("Geçersiz şifre");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
  };

  const handleSaveSurvey = async (survey: Survey) => {
    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(survey),
      });

      if (response.ok) {
        await loadData();
        setShowSurveyForm(false);
        setEditingSurvey(null);
        alert("Anket başarıyla kaydedildi!");
      } else {
        throw new Error("Failed to save survey");
      }
    } catch (error) {
      console.error("Error saving survey:", error);
      alert("Anket kaydedilirken bir hata oluştu");
    }
  };

  const handleEditSurvey = (survey: Survey) => {
    setEditingSurvey(survey);
    setShowSurveyForm(true);
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!window.confirm("Bu anketi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadData();
        alert("Anket başarıyla silindi!");
      } else {
        throw new Error("Failed to delete survey");
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      alert("Anket silinirken bir hata oluştu");
    }
  };

  const getSurveyResponses = (surveyId: string) => {
    return responses.filter(response => response.surveyId === surveyId);
  };

  const handleShowStats = (survey: Survey) => {
    setSelectedSurveyForStats(survey);
    setShowStatsModal(true);
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="w-32 h-32 relative mx-auto mb-8">
            <Image
              src="/logo.png"
              alt="Hunt Insight Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-8">
            Admin Paneli
          </h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    placeholder="••••••••"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 relative">
              <Image
                src="/logo.png"
                alt="Hunt Insight Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Çıkış Yap
          </button>
        </div>

        {!showSurveyForm ? (
          <div className="space-y-8">
            {/* Anketler Bölümü */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Anketler</h2>
                <button
                  onClick={() => setShowSurveyForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Yeni Anket
                </button>
              </div>

              {surveys.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz Anket Yok</h3>
                  <p className="mt-2 text-gray-600">İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın.</p>
                  <button
                    onClick={() => setShowSurveyForm(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni Anket Oluştur
                  </button>
                </div>
              ) : (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                  {surveys.map((survey) => (
                    <div key={survey.id} className="mb-6 bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-200">
                      <div className="p-6">
                        <div className="flex-1 min-w-0 mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {survey.title}
                          </h3>
                          <p className="text-gray-600">{survey.description}</p>
                        </div>

                        <div className="flex flex-col space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Soru Sayısı:</span>
                            <span className="font-medium text-gray-900">{survey.questions.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Yanıt Sayısı:</span>
                            <span className="font-medium text-gray-900">{getSurveyResponses(survey.id).length}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            onClick={() => handleShowStats(survey)}
                            className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                            title="İstatistikleri Görüntüle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditSurvey(survey)}
                            className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                            title="Düzenle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                            title="Sil"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </Masonry>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingSurvey ? 'Anketi Düzenle' : 'Yeni Anket Oluştur'}
              </h2>
              <button
                onClick={() => {
                  setShowSurveyForm(false);
                  setEditingSurvey(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri Dön
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl">
              <div className="p-6">
                <SurveyCreator
                  onSave={handleSaveSurvey}
                  initialSurvey={editingSurvey}
                />
              </div>
            </div>
          </div>
        )}

        {selectedResponse && (
          <SurveyFlowModal
            survey={selectedResponse.survey}
            userResponse={selectedResponse.response}
            onClose={() => setSelectedResponse(null)}
          />
        )}

        {showStatsModal && selectedSurveyForStats && (
          <SurveyStatsModal
            survey={selectedSurveyForStats}
            responses={getSurveyResponses(selectedSurveyForStats.id)}
            users={users}
            onClose={() => {
              setShowStatsModal(false);
              setSelectedSurveyForStats(null);
            }}
          />
        )}
      </div>
    </div>
  );
}


