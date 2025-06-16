'use client';

import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-8">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Teşekkür Ederiz!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Ankete katılımınız için teşekkür ederiz. Görüşleriniz bizim için çok değerli.
        </p>

        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
