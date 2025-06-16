'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-48 h-16 relative mx-auto mb-8">
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
        </div>

        {/* Thank You Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Teşekkür Ederiz!
          </h2>
          <p className="text-xl text-gray-600 mb-3">
            Anketi tamamladığınız için teşekkür ederiz.
          </p>
          <p className="text-lg text-gray-500 mb-3">
            Cevaplarınız başarıyla kaydedildi.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Katkılarınız bizim için çok değerli.
          </p>

          {/* Action Button */}
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
