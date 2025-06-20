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
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
    setLoginError("");

    // Basic validation
    if (!password.trim()) {
      setLoginError("Lütfen şifrenizi giriniz.");
      setLoading(false);
      return;
    }

    try {
      // In a real application, this should be handled securely on the server
      if (password === "admin123") {
        setIsAuthenticated(true);
        localStorage.setItem("adminAuth", "true");
        await loadData();
      } else {
        setLoginError("Geçersiz şifre. Lütfen tekrar deneyiniz.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz.");
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
      // Check if we're editing an existing survey
      const isEditing = editingSurvey && editingSurvey.id;

      const response = await fetch(
        isEditing ? `/api/surveys/${survey.id}` : "/api/surveys",
        {
          method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(survey),
        }
      );

      const result = await response.json();

      if (response.ok) {
        await loadData();
        setShowSurveyForm(false);
        setEditingSurvey(null);
        alert(isEditing ? "Anket başarıyla güncellendi!" : "Anket başarıyla kaydedildi!");
      } else {
        // Handle specific error cases
        if (result.hasResponses) {
          alert("Bu anket düzenlenemez çünkü zaten yanıtlar alınmış.");
        } else {
          throw new Error(result.error || "Failed to save survey");
        }
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

  // Helper functions for enhanced functionality
  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSafeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('tr-TR');
    } catch {
      return null;
    }
  };

  const getTotalResponses = () => {
    return responses.length;
  };

  const getTodayResponses = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return responses.filter(response => {
      const responseDate = new Date(response.completedAt).toISOString().split('T')[0];
      return responseDate === todayStr;
    }).length;
  };

  const getAverageResponsesPerSurvey = () => {
    if (surveys.length === 0) return 0;
    return Math.round(responses.length / surveys.length);
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>

        <div className="relative max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 min-h-screen flex flex-col justify-center">
          {/* Logo and Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="w-56 h-20 relative mx-auto mb-8 transform hover:scale-105 transition-all duration-500 cursor-pointer group" onClick={() => window.location.href = '/'}>
            <Image
                src="/logo-long.png"
                alt="AvGörüş Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
                className="drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
            />
          </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 select-none">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
            Admin Paneli
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed select-none opacity-80">
              Yönetici paneline güvenli erişim
            </p>
        </div>

          {/* Login Form Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50 hover:shadow-3xl transition-all duration-500 animate-fade-in-up delay-200 relative overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-3xl"></div>

            <div className="relative z-10">
              <form onSubmit={handleLogin} className="space-y-8">
                {/* Password Field */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 select-none flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Yönetici Şifresi
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (loginError) setLoginError("");
                      }}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-5 border-2 border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white/70 backdrop-blur-sm group-hover:shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-3.122-3.122l4.243 4.243M12 12l1.414 1.414m0 0l1.414 1.414M12 12l-1.414-1.414m0 0l-1.414-1.414m4.242 4.243L15.536 15.536m0 0l1.414 1.414" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-200 p-4 animate-shake">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800 select-none">{loginError}</p>
                  </div>
                </div>
              </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-5 px-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg relative overflow-hidden group"
              >
                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <svg className="animate-spin h-6 w-6 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <span className="select-none">Giriş Yapılıyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span className="select-none">Güvenli Giriş</span>
                        </div>
                      )}
                    </div>
              </button>
                </div>
            </form>

              {/* Security Badge */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="select-none font-medium">Güvenli Bağlantı</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center animate-fade-in-up delay-500">
            <p className="text-sm text-gray-500 select-none">
              © 2024 AvGörüş. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-indigo-600/3"></div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      <div className="relative">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 relative">
              <Image
                src="/logo.png"
                    alt="AvGörüş Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
                    className="drop-shadow-sm"
              />
            </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Admin Paneli
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-600 mt-0.5">Yönetim Konsolu</p>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  onClick={() => setShowSurveyForm(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Anket
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSurveyForm(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Anket Oluştur
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {!showSurveyForm ? (
            <div className="space-y-6 lg:space-y-8">
              {/* Dashboard Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                      </div>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-sm lg:text-base font-medium text-gray-900">{surveys.length}</p>
                      <p className="text-xs lg:text-sm text-gray-600">Toplam Anket</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-sm lg:text-base font-medium text-gray-900">{getTotalResponses()}</p>
                      <p className="text-xs lg:text-sm text-gray-600">Toplam Yanıt</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-sm lg:text-base font-medium text-gray-900">{getTodayResponses()}</p>
                      <p className="text-xs lg:text-sm text-gray-600">Bugünkü Yanıtlar</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-sm lg:text-base font-medium text-gray-900">{getAverageResponsesPerSurvey()}</p>
                      <p className="text-xs lg:text-sm text-gray-600">Ort. Yanıt</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Controls */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1 max-w-lg">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Anket ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'grid'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'list'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surveys Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                      Anketler ({filteredSurveys.length})
                    </h2>
                    <p className="text-sm lg:text-base text-gray-600 mt-1">
                      {searchTerm ? `"${searchTerm}" için sonuçlar` : 'Tüm anketlerinizi yönetin'}
                    </p>
                  </div>
                </div>

                {filteredSurveys.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 lg:p-12 text-center border border-white/50">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'Sonuç Bulunamadı' : 'Henüz Anket Yok'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchTerm
                        ? 'Arama kriterlerinize uygun anket bulunamadı. Farklı terimler deneyin.'
                        : 'İlk anketinizi oluşturmak için aşağıdaki butona tıklayın.'
                      }
                    </p>
                    {!searchTerm && (
                  <button
                    onClick={() => setShowSurveyForm(true)}
                        className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                        İlk Anketimi Oluştur
                  </button>
                    )}
                </div>
                ) : viewMode === 'grid' ? (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                    {filteredSurveys.map((survey) => (
                      <div key={survey.id} className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/50 group">
                      <div className="p-6">
                        <div className="flex-1 min-w-0 mb-6">
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                            {survey.title}
                          </h3>
                            <p className="text-gray-600 text-sm lg:text-base line-clamp-2">{survey.description}</p>
                        </div>

                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                                <div>
                                  <p className="text-xs text-blue-600 font-medium">Sorular</p>
                                  <p className="text-sm font-bold text-blue-900">{survey.questions.length}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                              </svg>
                                <div>
                                  <p className="text-xs text-green-600 font-medium">Yanıtlar</p>
                                  <p className="text-sm font-bold text-green-900">{getSurveyResponses(survey.id).length}</p>
                                </div>
                              </div>
                          </div>
                        </div>

                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                          <button
                            onClick={() => handleShowStats(survey)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 tooltip"
                            title="İstatistikleri Görüntüle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditSurvey(survey)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                                title="Düzenle"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSurvey(survey.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                title="Sil"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatSafeDate(survey.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Masonry>
                ) : (
                  <div className="space-y-4">
                    {filteredSurveys.map((survey) => (
                      <div key={survey.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/50">
                        <div className="p-4 lg:p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{survey.title}</h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-1">{survey.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{survey.questions.length} soru</span>
                                <span>{getSurveyResponses(survey.id).length} yanıt</span>
                                <span>{formatSafeDate(survey.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleShowStats(survey)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                                title="İstatistikler"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEditSurvey(survey)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                            title="Düzenle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSurvey(survey.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                            title="Sil"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
              )}
            </div>
          </div>
        ) : (
            <div className="animate-fade-in-up">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                  {editingSurvey ? 'Anketi Düzenle' : 'Yeni Anket Oluştur'}
                </h2>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  {editingSurvey ? 'Mevcut anketi düzenleyin' : 'Yeni bir anket oluşturun'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSurveyForm(false);
                  setEditingSurvey(null);
                }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri Dön
              </button>
            </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                <div className="p-6 lg:p-8">
                <SurveyCreator
                  onSave={handleSaveSurvey}
                  initialSurvey={editingSurvey}
                    responses={responses}
                />
                </div>
            </div>
          </div>
        )}
        </main>

        {/* Modals */}
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


