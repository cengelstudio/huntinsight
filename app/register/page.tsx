"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "../types";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    surname: "",
    trnc_id: "",
    hunting_license: "",
  });

  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.surname || !formData.trnc_id || !formData.hunting_license) {
      setError("Lütfen tüm alanları doldurunuz.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Kayıt işlemi başarısız oldu.");
      }

      const data = await response.json();
      router.push(`/survey/${data.surveyId}`);
    } catch (error) {
      console.error('Registration error:', error);
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-48 h-16 relative mx-auto mb-8 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo-long.png" alt="Hunt Insight Logo" fill style={{objectFit: "contain"}} priority />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 select-none">Av Formu</h1>
          <p className="text-lg text-gray-600 select-none">
            Ankete başlamadan önce lütfen bilgilerinizi giriniz
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 select-none">
                Ad
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Adınızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Surname Field */}
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2 select-none">
                Soyad
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Soyadınızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TRNC ID Field */}
            <div>
              <label htmlFor="trnc_id" className="block text-sm font-medium text-gray-700 mb-2 select-none">
                KKTC Kimlik No
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="trnc_id"
                  value={formData.trnc_id}
                  onChange={(e) => setFormData({ ...formData, trnc_id: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Kimlik numaranızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Hunting License Field */}
            <div>
              <label htmlFor="hunting_license" className="block text-sm font-medium text-gray-700 mb-2 select-none">
                Av Ruhsat No
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="hunting_license"
                  value={formData.hunting_license}
                  onChange={(e) => setFormData({ ...formData, hunting_license: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 pr-10 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Ruhsat numaranızı giriniz"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 animate-shake">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 select-none">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="select-none">Kaydediliyor...</span>
                </>
              ) : (
                <span className="select-none">Ankete Başla</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
