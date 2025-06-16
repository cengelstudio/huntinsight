'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Survey } from './types';

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
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AvGörüş</h1>
          <p className="text-lg text-gray-600">
            K.K.T.C. avcılarının görüşlerini değerlendirmek için hazırlanmış anket platformuna hoş geldiniz.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => router.push(`/register/${survey.id}`)}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {survey.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {survey.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{survey.questions.length} Soru</span>
                <span>~{Math.ceil(survey.questions.length * 1.5)} Dakika</span>
              </div>
            </div>
          ))}
        </div>

        {surveys.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Şu anda aktif anket bulunmamaktadır.
          </div>
        )}
      </div>
    </div>
  );
}
