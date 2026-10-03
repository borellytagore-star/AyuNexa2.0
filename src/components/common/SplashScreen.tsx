import React, { useEffect, useState } from 'react';
import { AyuNexaLogo } from './AyuNexaLogo';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Official AyuNexa Splash Screen.
 * Displays the official AyuNexa logo, name, and tagline:
 * "AyuNexa — Connected Care. Smarter Health."
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  onDismiss,
  durationMs = 1800,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 400);

    const finishTimer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-6 sm:p-10 select-none cursor-pointer transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="AyuNexa Splash Screen"
      role="banner"
    >
      {/* Top subtle badge */}
      <div className="pt-4 flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
        <Sparkles className="w-3.5 h-3.5 text-pink-600" />
        <span>Connected Healthcare Platform</span>
      </div>

      {/* Center: Official Logo, Wordmark, and Tagline */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto animate-in zoom-in-95 duration-500">
        <AyuNexaLogo variant="full" showTagline={true} />

        {/* Loading indicator bar */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6 shadow-inner">
          <div className="h-full bg-gradient-to-r from-[#4a044e] via-[#be185d] to-[#eab308] rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Loading secure local healthcare store...
        </p>
      </div>

      {/* Footer reassurance */}
      <div className="pb-4 text-center text-xs text-slate-400 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-purple-800" />
        <span className="font-semibold text-slate-600">
          Privacy-First • Hardware Encrypted • Offline Ready
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
