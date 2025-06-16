'use client';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Teşekkür Ederiz!
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Anketi tamamladığınız için teşekkür ederiz. Cevaplarınız başarıyla kaydedildi.
          </p>
          <p className="mt-2 text-gray-500">
            Katkılarınız bizim için çok değerli.
          </p>
        </div>
      </div>
    </div>
  );
}
