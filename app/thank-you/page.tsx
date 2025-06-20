'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Logo */}
        <div className="text-center mb-16">
          <div className="w-56 h-20 relative mx-auto mb-8 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo-long.png" alt="AvGörüş Logo" fill style={{objectFit: "contain"}} priority />
          </div>
        </div>

        {/* Thank You Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-white/50">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 select-none">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Teşekkür Ederiz!
            </span>
          </h2>

          <div className="space-y-4 mb-10">
            <p className="text-xl md:text-2xl text-gray-700 font-semibold select-none">
              Anketi tamamladığınız için teşekkür ederiz.
            </p>
            <p className="text-lg text-gray-600 select-none">
              Cevaplarınız başarıyla kaydedildi.
            </p>
            <p className="text-lg text-gray-600 select-none">
              Katkılarınız bizim için çok değerli.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-sm text-blue-700 font-medium select-none">Tamamlandı</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div className="text-sm text-green-700 font-medium select-none">Kaydedildi</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-sm text-purple-700 font-medium select-none">Analiz Edilecek</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="select-none">Ana Sayfaya Dön</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 select-none">
              Sonuçlar Hakkında
            </h3>
            <p className="text-gray-600 leading-relaxed select-none">
              Anket sonuçları K.K.T.C. Avcılık Federasyonu tarafından analiz edilecek ve
              avcılık politikalarının geliştirilmesinde kullanılacaktır.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
