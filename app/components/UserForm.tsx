'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UserForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    trncId: '',
    huntingLicenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          trnc_id: formData.trncId,
          hunting_license: formData.huntingLicenseNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi sırasında bir hata oluştu.');
      }

      // Save user information to localStorage
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userSurname', formData.surname);

      router.push(`/survey/${data.surveyId}`);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-48 h-16 relative mx-auto mb-8">
            <Image src="/logo-long.png" alt="AvGörüş Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Kayıt Formu</h2>
          <p className="mt-2 text-sm text-gray-600">
            Lütfen anket için gerekli bilgileri doldurunuz.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ad
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                  placeholder="Adınızı giriniz"
                />
              </div>

              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                  Soyad
                </label>
                <input
                  id="surname"
                  type="text"
                  name="surname"
                  required
                  value={formData.surname}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                  placeholder="Soyadınızı giriniz"
                />
              </div>

              <div>
                <label htmlFor="trncId" className="block text-sm font-medium text-gray-700 mb-1">
                  K.K.T.C. Kimlik Numarası
                </label>
                <input
                  id="trncId"
                  type="text"
                  name="trncId"
                  required
                  value={formData.trncId}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                  placeholder="Kimlik numaranızı giriniz"
                />
              </div>

              <div>
                <label htmlFor="huntingLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Av Ruhsat Seri Numarası
                </label>
                <input
                  id="huntingLicenseNumber"
                  type="text"
                  name="huntingLicenseNumber"
                  required
                  value={formData.huntingLicenseNumber}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                  placeholder="Ruhsat numaranızı giriniz"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  'Ankete Başla'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
