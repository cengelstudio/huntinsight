'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    trncId: '',
    huntingLicenseNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        router.push('/survey');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AvGörüş</h1>
          <p className="text-lg text-gray-600">
            Avcıların görüşlerini değerlendirmek için hazırlanmış anket platformuna hoş geldiniz.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  İsim
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
                  Soyisim
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Ankete Başla
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
