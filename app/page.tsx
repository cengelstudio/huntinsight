'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Survey } from './types';
import Image from 'next/image';
import LoadingScreen from './components/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys');
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Anketler yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-48 h-16 relative mx-auto mb-8">
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Avcı Anket Platformu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            K.K.T.C. avcılarının görüşlerini değerlendirmek için hazırlanmış modern anket platformuna hoş geldiniz.
          </p>
        </div>

        {/* Surveys Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => router.push(`/register/${survey.id}`)}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {survey.title}
                  </h2>
                  <div className="bg-blue-100 rounded-full p-2 group-hover:bg-blue-200 transition-colors duration-300">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {survey.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ~{Math.ceil(survey.questions.length * 1.5)} Dakika
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {surveys.length === 0 && (
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aktif Anket Bulunmuyor
            </h3>
            <p className="text-gray-600">
              Şu anda katılabileceğiniz aktif bir anket bulunmamaktadır. Lütfen daha sonra tekrar kontrol ediniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
