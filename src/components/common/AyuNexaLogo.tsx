import React from 'react';

export interface AyuNexaLogoProps {
  /**
   * 'full': Vertical stacked emblem + wordmark + tagline
   * 'horizontal': Emblem left + wordmark and tagline right
   * 'icon': Emblem symbol only (for header compact, favicon, avatar)
   * 'wordmark': Wordmark + tagline only
   */
  variant?: 'full' | 'horizontal' | 'icon' | 'wordmark';
  /** Height or sizing class (e.g. h-10, h-12, w-10, etc.) */
  className?: string;
  /** Size in pixels (if provided, sets width/height attributes) */
  size?: number;
  /** Whether to show the official tagline */
  showTagline?: boolean;
}

/**
 * Official AyuNexa Logo Component.
 * Faithfully renders the official AyuNexa brand identity:
 * - 3D Ribbon 'A' in Deep Plum to Magenta gradient
 * - Connected Patient & Caregiver figures forming a heart
 * - Golden healthcare cross & Ayurvedic wellness leaves
 * - Dual-tone "AyuNexa" typography (Deep Plum "Ayu" + Vibrant Magenta "Nexa")
 * - Official Tagline: "Connected Care. Smarter Health."
 */
export const AyuNexaLogo: React.FC<AyuNexaLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size,
  showTagline = true,
}) => {
  // Shared Gradient & Filter Definitions
  const SvgDefs = () => (
    <defs>
      {/* Primary Plum-to-Magenta Ribbon Gradient */}
      <linearGradient id="an-ribbon-primary" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a044e" />
        <stop offset="30%" stopColor="#701a75" />
        <stop offset="65%" stopColor="#a21caf" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>

      {/* Top Fold Ribbon Highlight */}
      <linearGradient id="an-ribbon-fold" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#831843" />
        <stop offset="45%" stopColor="#be185d" />
        <stop offset="80%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>

      {/* Inner Loop Shadow/Depth */}
      <linearGradient id="an-ribbon-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b0764" />
        <stop offset="50%" stopColor="#581c87" />
        <stop offset="100%" stopColor="#701a75" />
      </linearGradient>

      {/* Golden Metallic Cross & Leaf Gradient */}
      <linearGradient id="an-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="35%" stopColor="#eab308" />
        <stop offset="70%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>

      {/* Soft Gold Line Divider */}
      <linearGradient id="an-gold-line" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#eab308" stopOpacity="0" />
        <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
      </linearGradient>

      {/* Subtle Drop Shadow */}
      <filter id="an-soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4a044e" floodOpacity="0.15" />
      </filter>
    </defs>
  );

  // Emblem Symbol Paths (A-ribbon, 2 heart figures, gold cross, leaves)
  const EmblemPaths = ({ transform = '' }: { transform?: string }) => (
    <g transform={transform} filter="url(#an-soft-shadow)">
      {/* 1. OUTER / BACK RIBBON SWOOP (Left leg extending up & over loop) */}
      <path
        d="M 52 145 C 50 115, 68 70, 95 40 C 112 20, 130 10, 148 10 C 168 10, 185 24, 195 48 C 205 70, 208 95, 206 120 C 204 140, 192 165, 175 180 C 158 195, 135 198, 115 198 C 88 198, 62 185, 48 170 C 35 156, 28 140, 28 132 C 28 128, 38 122, 45 125 C 52 128, 55 142, 68 152 C 78 160, 95 168, 115 168 C 135 168, 150 162, 160 150 C 172 135, 175 110, 170 85 C 165 60, 152 40, 142 32 C 134 26, 122 26, 112 38 C 92 62, 75 102, 72 138 Z"
        fill="url(#an-ribbon-primary)"
      />

      {/* 2. FOREGROUND RIBBON FOLD (Graceful 3D apex curve of the 'A') */}
      <path
        d="M 125 12 C 140 10, 155 14, 165 24 C 180 38, 190 62, 195 90 C 182 82, 170 76, 158 72 C 154 52, 146 36, 136 26 C 132 22, 128 16, 125 12 Z"
        fill="url(#an-ribbon-fold)"
      />

      {/* 3. LOWER FLOWING RIBBON SWEEP (Swooping crossbar of the 'A') */}
      <path
        d="M 28 132 C 45 120, 75 95, 112 80 C 145 66, 180 62, 215 72 C 235 78, 252 88, 260 100 C 255 112, 238 118, 218 116 C 188 113, 158 120, 130 132 C 100 145, 68 165, 48 170 C 35 156, 28 140, 28 132 Z"
        fill="url(#an-ribbon-primary)"
      />

      {/* 4. RIBBON TAIL FLOURISH (Extending elegantly to bottom right) */}
      <path
        d="M 130 132 C 160 120, 192 118, 222 122 C 242 125, 260 135, 272 148 C 265 156, 248 160, 228 158 C 198 155, 165 165, 138 178 C 122 186, 102 195, 88 198 C 105 180, 118 155, 130 132 Z"
        fill="url(#an-ribbon-fold)"
      />

      {/* 5. PATIENT & CAREGIVER FIGURES (Silhouettes forming the central Heart) */}
      {/* Caregiver Head (Left) */}
      <circle cx="120" cy="85" r="11" fill="#4a044e" />
      {/* Patient Head (Right) */}
      <circle cx="148" cy="98" r="8.5" fill="#a21caf" />

      {/* Connected Bodies / Embracing curves forming Heart negative space */}
      <path
        d="M 112 100 C 104 108, 98 122, 102 138 C 106 150, 116 160, 128 168 C 128 168, 126 152, 120 142 C 114 132, 114 122, 122 114 C 125 110, 130 108, 135 110 C 142 112, 145 120, 142 130 C 138 140, 132 152, 128 168 C 136 160, 150 145, 156 130 C 162 116, 158 106, 148 108 C 140 110, 135 115, 130 118 C 124 108, 118 102, 112 100 Z"
        fill="#581c87"
      />
      {/* Patient Torso / Heart right arc */}
      <path
        d="M 148 110 C 158 114, 164 125, 162 138 C 160 148, 152 158, 142 165 C 144 154, 148 142, 146 132 C 144 124, 138 118, 134 116 C 138 112, 144 110, 148 110 Z"
        fill="#a21caf"
      />

      {/* 6. GOLDEN HEALTHCARE CROSS */}
      <g transform="translate(172, 70)">
        {/* Horizontal cross bar */}
        <rect x="0" y="8" width="28" height="12" rx="4" fill="url(#an-gold-grad)" />
        {/* Vertical cross bar */}
        <rect x="8" y="0" width="12" height="28" rx="4" fill="url(#an-gold-grad)" />
      </g>

      {/* 7. GOLDEN WELLNESS LEAF ACCENTS */}
      {/* Upper Leaf */}
      <path
        d="M 198 88 C 218 80, 235 90, 245 110 C 230 115, 212 110, 198 88 Z"
        fill="url(#an-gold-grad)"
      />
      {/* Central Leaf Vein */}
      <path
        d="M 198 88 Q 220 98 245 110"
        stroke="#78350f"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Lower Leaf */}
      <path
        d="M 188 108 C 205 106, 222 118, 228 135 C 212 138, 198 130, 188 108 Z"
        fill="url(#an-gold-grad)"
      />

      {/* Magenta Accent Petal */}
      <path
        d="M 182 128 C 196 128, 208 140, 210 152 C 198 154, 186 146, 182 128 Z"
        fill="#be185d"
      />
    </g>
  );

  // Variant: ICON ONLY (Square 1:1, suitable for header mark, app icon, favicon)
  if (variant === 'icon') {
    const iconSize = size || 40;
    return (
      <svg
        viewBox="0 0 280 210"
        width={iconSize}
        height={(iconSize * 210) / 280}
        className={`inline-block shrink-0 select-none ${className}`}
        aria-label="AyuNexa Official Logo Mark"
        role="img"
      >
        <SvgDefs />
        <EmblemPaths />
      </svg>
    );
  }

  // Variant: WORDMARK ONLY
  if (variant === 'wordmark') {
    return (
      <div className={`flex flex-col select-none ${className}`}>
        <div className="flex items-baseline font-black tracking-tight leading-none">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a044e] to-[#701a75]">
            Ayu
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#be185d] to-[#d946ef]">
            Nexa
          </span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-[1px] w-4 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-700 uppercase whitespace-nowrap">
              Connected Care. Smarter Health.
            </span>
            <span className="h-[1px] w-4 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        )}
      </div>
    );
  }

  // Variant: HORIZONTAL (Emblem on Left, Wordmark & Tagline on Right - Ideal for Header)
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
        {/* Emblem SVG */}
        <svg
          viewBox="0 0 280 210"
          className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 drop-shadow-xs"
          aria-hidden="true"
        >
          <SvgDefs />
          <EmblemPaths />
        </svg>

        {/* Wordmark + Tagline */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline font-black tracking-tight leading-none text-xl sm:text-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a044e] to-[#701a75]">
              Ayu
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#be185d] to-[#d946ef]">
              Nexa
            </span>
          </div>
          {showTagline && (
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-slate-500 leading-tight mt-0.5">
              Connected Care. Smarter Health.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Variant: FULL (Centered Stacked Layout - Ideal for Splash, Login, About, Onboarding)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Full Emblem */}
      <svg
        viewBox="0 0 280 210"
        className="w-36 h-28 sm:w-44 sm:h-34 shrink-0 drop-shadow-md transition-transform"
        aria-label="AyuNexa — Connected Care. Smarter Health."
        role="img"
      >
        <SvgDefs />
        <EmblemPaths />
      </svg>

      {/* Big Wordmark */}
      <div className="flex items-baseline justify-center font-black tracking-tight text-3xl sm:text-4xl mt-1 leading-none">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a044e] via-[#6b1d5c] to-[#701a75]">
          Ayu
        </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a21caf] via-[#be185d] to-[#d946ef]">
          Nexa
        </span>
      </div>

      {/* Official Tagline flanked by Thin Golden Lines */}
      {showTagline && (
        <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-xs">
          <span className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-amber-600 rounded-full" />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-700 whitespace-nowrap">
            Connected Care. Smarter Health.
          </span>
          <span className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent via-amber-400 to-amber-600 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default AyuNexaLogo;
