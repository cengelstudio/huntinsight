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
          <div className="w-48 h-16 relative mx-auto mb-8 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight select-none">
            Avcı Anket Platformu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto select-none">
            K.K.T.C. avcılarının görüşlerini değerlendirmek için hazırlanmış modern anket platformuna hoş geldiniz.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 select-none">Kolay Kullanım</h3>
            <p className="text-gray-600 select-none">Basit ve kullanıcı dostu arayüz ile anketleri hızlıca tamamlayın.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 select-none">Hızlı Yanıt</h3>
            <p className="text-gray-600 select-none">Anketleri ortalama 5 dakika içinde tamamlayabilirsiniz.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 select-none">Detaylı Analiz</h3>
            <p className="text-gray-600 select-none">Yanıtlarınız federasyon tarafından detaylıca analiz edilir.</p>
          </div>
        </div>

        {/* Active Surveys Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 select-none">Aktif Anketler</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 select-none">
            Aşağıdaki anketlere katılarak görüşlerinizi bizimle paylaşabilirsiniz.
          </p>
        </div>

        {/* Surveys Grid */}
        <div className={`grid gap-8 ${
          surveys.length === 1 ? 'md:grid-cols-1 max-w-xl' :
          surveys.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
          'md:grid-cols-2 lg:grid-cols-3'
        } mx-auto mb-16`}>
          {surveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => router.push(`/register/${survey.id}`)}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 select-none">
                    {survey.title}
                  </h2>
                  <div className="bg-blue-100 rounded-full p-2 group-hover:bg-blue-200 transition-colors duration-300">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 line-clamp-3 select-none">
                  {survey.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 select-none">
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
            <h3 className="text-xl font-medium text-gray-900 mb-2 select-none">
              Aktif Anket Bulunmuyor
            </h3>
            <p className="text-gray-600 select-none">
              Şu anda katılabileceğiniz aktif bir anket bulunmamaktadır. Lütfen daha sonra tekrar kontrol ediniz.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="flex justify-center space-x-6 mb-4">
              <a href="https://www.facebook.com/kktcavcilik" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="http://avfed.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Web Sitesi</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} K.K.T.C. Avcılık Federasyonu. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
