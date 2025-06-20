import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative p-8 md:p-12 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-2xl flex flex-col items-center max-w-md mx-4">
        {/* Logo */}
        <div className="relative mb-12">
          <div className="w-48 h-16 relative">
            <Image
              src="/logo-long.png"
              alt="AvGörüş Logo"
              fill
              style={{objectFit: "contain"}}
              priority
              className="drop-shadow-lg"
            />
          </div>
        </div>

        {/* Modern Loading Animation */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-8">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>

          {/* Animated Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>

          {/* Inner Pulse */}
          <div className="absolute inset-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Loading Message */}
        {message && (
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-700 mb-2 select-none">{message}</p>
            <p className="text-sm text-gray-500 select-none">Lütfen bekleyiniz...</p>
          </div>
        )}

        {/* Loading Dots */}
        <div className="flex space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}
