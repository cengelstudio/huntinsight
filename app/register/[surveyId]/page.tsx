'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingScreen from '../../components/LoadingScreen';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-48 h-16 relative mx-auto mb-8 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 select-none">Av Formu</h1>
          <p className="text-lg text-gray-600 select-none">
            Ankete başlamadan önce lütfen bilgilerinizi giriniz
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 select-none">
                Ad
              </label>
              <div className="mt-1">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 select-none">
                Soyad
              </label>
              <div className="mt-1">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="trnc_id" className="block text-sm font-medium text-gray-700 select-none">
                KKTC Kimlik No
              </label>
              <div className="mt-1">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="hunting_license" className="block text-sm font-medium text-gray-700 select-none">
                Av Ruhsat No
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="hunting_license"
                  id="hunting_license"
                  required
                  autoComplete="off"
                  value={formData.hunting_license}
                  onChange={handleChange}
                  placeholder="Av ruhsat numaranızı giriniz"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 select-none">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="select-none">Ankete Başla</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="flex justify-center space-x-6 mb-4">
              <a href="https://www.facebook.com/kktcavcilik" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="http://avfed.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
                <span className="sr-only">Web Sitesi</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            </div>
            <p className="text-gray-600">
              © {new Date().getFullYear()} K.K.T.C. Avcılık Federasyonu. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
