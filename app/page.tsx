'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Survey } from './types';
import Image from 'next/image';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="w-56 h-20 relative mx-auto mb-12 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo-long.png" alt="AvGörüş Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight select-none">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Avcı Anket
            </span>
            <br />
            <span className="text-gray-700">Platformu</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed select-none">
            K.K.T.C. avcılarının görüşlerini değerlendirmek için hazırlanmış
            <span className="font-semibold text-blue-600"> modern anket platformu</span>na hoş geldiniz.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:bg-white/80 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 select-none">Kolay Kullanım</h3>
            <p className="text-gray-600 leading-relaxed select-none">Sezgisel ve kullanıcı dostu arayüz ile anketleri kolayca tamamlayın.</p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:bg-white/80 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 select-none">Hızlı Yanıt</h3>
            <p className="text-gray-600 leading-relaxed select-none">Anketleri ortalama 5 dakika içinde tamamlayabilirsiniz.</p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:bg-white/80 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 select-none">Detaylı Analiz</h3>
            <p className="text-gray-600 leading-relaxed select-none">Yanıtlarınız federasyon tarafından detaylıca analiz edilir.</p>
          </div>
        </div>

        {/* Surveys Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 select-none">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Aktif Anketler
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed select-none">
            Aşağıdaki anketlere katılarak görüşlerinizi bizimle paylaşabilir ve avcılık camiasının geleceğine katkıda bulunabilirsiniz.
          </p>
        </div>

        {/* Surveys Grid */}
        <div className={`grid gap-8 ${
          surveys.length === 1 ? 'md:grid-cols-1 max-w-2xl' :
          surveys.length === 2 ? 'md:grid-cols-2 max-w-4xl' :
          'md:grid-cols-2 lg:grid-cols-3'
        } mx-auto mb-16`}>
          {surveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => router.push(`/register/${survey.id}`)}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border border-white/50 hover:bg-white transform hover:-translate-y-3 hover:scale-[1.02]"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 select-none line-clamp-2">
                    {survey.title}
                  </h3>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed select-none">
                  {survey.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 select-none">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">~{Math.ceil(survey.questions.length * 1.5)} Dakika</span>
                  </div>

                  <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold select-none">
                    Başla
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {surveys.length === 0 && (
          <div className="text-center bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl p-12 mt-8 border border-white/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-8">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 select-none">
              Aktif Anket Bulunmuyor
            </h3>
            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed select-none">
              Şu anda katılabileceğiniz aktif bir anket bulunmamaktadır. Lütfen daha sonra tekrar kontrol ediniz.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
