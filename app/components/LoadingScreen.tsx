import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="relative p-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center min-w-[400px]">
        {/* Logo Container with Glow Effect */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full"></div>
          <div className="relative w-40 h-40">
            <Image
              src="/logo-long.png"
              alt="Hunt Insight Logo"
              fill
              style={{objectFit: "contain"}}
              priority
              className="drop-shadow-xl"
            />
          </div>
        </div>

        {/* Modern Wave Animation */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-8">
          {/* Animated Waves */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
            <div className="absolute inset-0 bg-blue-300/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_2s]"></div>
          </div>

          {/* Center Pulse */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Animated Lines */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-4 bg-white/80"
                  style={{
                    '--rotation': `${i * 45}deg`,
                    animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`
                  } as React.CSSProperties}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
