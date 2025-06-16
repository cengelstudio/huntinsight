'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingScreen from '../../components/LoadingScreen';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-48 h-16 relative mx-auto mb-8">
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Av Formu</h1>
          <p className="text-lg text-gray-600">
            Ankete başlamadan önce lütfen bilgilerinizi giriniz
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ad
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Adınızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Surname Field */}
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2">
                Soyad
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  required
                  value={formData.surname}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Soyadınızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TRNC ID Field */}
            <div>
              <label htmlFor="trnc_id" className="block text-sm font-medium text-gray-700 mb-2">
                KKTC Kimlik No
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="trnc_id"
                  name="trnc_id"
                  required
                  value={formData.trnc_id}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Kimlik numaranızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Hunting License Field */}
            <div>
              <label htmlFor="hunting_license" className="block text-sm font-medium text-gray-700 mb-2">
                Av Ruhsat No
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="hunting_license"
                  name="hunting_license"
                  required
                  value={formData.hunting_license}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Ruhsat numaranızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 animate-shake">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <div className="relative w-5 h-5 mr-3">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-[spin_0.6s_linear_infinite]"></div>
                  </div>
                  Kaydediliyor...
                </>
              ) : (
                'Ankete Başla'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
