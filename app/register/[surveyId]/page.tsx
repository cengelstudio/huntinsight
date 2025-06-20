'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingScreen from '../../components/LoadingScreen';
import Footer from '../../components/Footer';
import { formatName } from '../../utils/nameFormatter';

interface FormData {
  name: string;
  surname: string;
  trnc_id: string;
  hunting_license: string;
}

export default function RegisterPage({ params }: { params: { surveyId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    trnc_id: '',
    hunting_license: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Apply name formatting when user leaves the input field
    if (name === 'name' || name === 'surname') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatName(value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Ensure names are properly formatted before submission
    const formattedFormData = {
      ...formData,
      name: formatName(formData.name),
      surname: formatName(formData.surname),
    };

    // Client-side validation for name and surname
    if (formattedFormData.name.trim().length < 2) {
      setError("İsim en az 2 harf olmalıdır.");
      return;
    }
    if (formattedFormData.surname.trim().length < 2) {
      setError("Soyisim en az 2 harf olmalıdır.");
      return;
    }
    // Client-side validation for trnc_id
    if (!/^\d{10,11}$/.test(formattedFormData.trnc_id)) {
      setError("Kimlik numarası en az 10, en fazla 11 haneli ve sadece rakamlardan oluşmalıdır.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formattedFormData,
          surveyId: params.surveyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kayıt işlemi başarısız oldu.');
      }

      const data = await response.json();
      if (data.id) {
        router.push(`/survey/${params.surveyId}?userId=${data.id}`);
      } else {
        throw new Error('Kullanıcı ID alınamadı.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Bilgileriniz kaydediliyor..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-56 h-20 relative mx-auto mb-8 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo-long.png" alt="AvGörüş Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 select-none">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Av Formu
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed select-none">
            Ankete başlamadan önce lütfen bilgilerinizi giriniz
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 select-none">
                  Ad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    autoComplete="off"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Adınızı giriniz"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Surname Field */}
              <div className="space-y-2">
                <label htmlFor="surname" className="block text-sm font-semibold text-gray-700 select-none">
                  Soyad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="surname"
                    id="surname"
                    required
                    autoComplete="off"
                    value={formData.surname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Soyadınızı giriniz"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* TRNC ID Field */}
            <div className="space-y-2">
              <label htmlFor="trnc_id" className="block text-sm font-semibold text-gray-700 select-none">
                KKTC Kimlik No
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="trnc_id"
                  id="trnc_id"
                  required
                  autoComplete="off"
                  value={formData.trnc_id}
                  onChange={e => {
                    // Only allow digits and max 11 characters
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 11) value = value.slice(0, 11);
                    setFormData(prev => ({ ...prev, trnc_id: value }));
                  }}
                  placeholder="KKTC kimlik numaranızı giriniz"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Hunting License Field */}
            <div className="space-y-2">
              <label htmlFor="hunting_license" className="block text-sm font-semibold text-gray-700 select-none">
                Av Ruhsat No
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="hunting_license"
                  id="hunting_license"
                  required
                  autoComplete="off"
                  value={formData.hunting_license}
                  onChange={handleChange}
                  placeholder="Av ruhsat numaranızı giriniz"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-6 animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-red-800 select-none">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="select-none">Kaydediliyor...</span>
                  </div>
                ) : (
                  <span className="select-none">Ankete Başla</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
