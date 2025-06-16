'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage({ params }: { params: { surveyId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    trnc_id: '',
    hunting_license: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Kullanıcı kaydedildi, ankete yönlendir
        router.push(`/survey/${params.surveyId}?userId=${data.id}`);
      } else {
        const error = await response.json();
        setError(error.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Ankete Katılım</h2>
          <p className="mt-2 text-gray-600">
            Ankete başlamadan önce lütfen bilgilerinizi giriniz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Ad
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
              Soyad
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              required
              value={formData.surname}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="trnc_id" className="block text-sm font-medium text-gray-700">
              KKTC Kimlik No
            </label>
            <input
              type="text"
              id="trnc_id"
              name="trnc_id"
              required
              value={formData.trnc_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="hunting_license" className="block text-sm font-medium text-gray-700">
              Avcılık Lisans No
            </label>
            <input
              type="text"
              id="hunting_license"
              name="hunting_license"
              required
              value={formData.hunting_license}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Ankete Başla'}
          </button>
        </form>
      </div>
    </div>
  );
}
