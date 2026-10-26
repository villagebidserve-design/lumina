import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'light',
  showTagline = true,
}) => {
  const sizeClasses = {
    sm: 'text-lg sm:text-xl tracking-tight',
    md: 'text-xl sm:text-2xl md:text-3xl tracking-tight',
    lg: 'text-2xl sm:text-3xl md:text-4xl tracking-tight',
    xl: 'text-3xl sm:text-4xl md:text-5xl tracking-tight',
  };

  const ultraBadgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.2 mr-1',
    md: 'text-[10px] sm:text-[11px] px-2 py-0.5 mr-1.5',
    lg: 'text-xs px-2.5 py-0.5 mr-2',
    xl: 'text-sm px-3 py-1 mr-2',
  };

  const thunderSizes = {
    sm: 'w-3.5 h-5 -mx-0.5',
    md: 'w-4 h-7 sm:w-5 sm:h-8 -mx-0.5',
    lg: 'w-6 h-9 sm:w-7 sm:h-11 -mx-1',
    xl: 'w-8 h-12 sm:w-10 sm:h-14 -mx-1',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className={`flex items-center font-black ${sizeClasses[size]} font-sans font-extrabold uppercase leading-none`}>
        {/* ULTRA Badge */}
        <span className={`inline-flex items-center font-black tracking-wider bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white rounded-md shadow-md uppercase ${ultraBadgeSizes[size]}`}>
          ULTRA
        </span>

        {/* LUM */}
        <span className={`${textColor} tracking-tight`}>LUM</span>

        {/* THUNDER SHAPED "i" */}
        <div className={`relative inline-flex items-center justify-center ${thunderSizes[size]} mx-0.5 transform -skew-x-6`}>
          {/* Glowing back filter */}
          <div className="absolute inset-0 bg-yellow-400 opacity-50 blur-sm rounded-full"></div>
          
          <svg
            viewBox="0 0 24 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_2px_6px_rgba(255,184,0,0.8)]"
          >
            {/* Top Dot of 'i' styled as electric spark */}
            <circle cx="15" cy="5" r="3.2" fill="#FFB800" />
            
            {/* Thunder bolt stem for 'i' */}
            <path
              d="M17 10L6 22H13.5L10 34L22 18.5H14L17 10Z"
              fill="url(#thunderGradientUltra)"
              stroke="#E69500"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            
            <defs>
              <linearGradient id="thunderGradientUltra" x1="6" y1="10" x2="22" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF275" />
                <stop offset="0.5" stopColor="#FFB800" />
                <stop offset="1" stopColor="#FF5722" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* NEXS */}
        <span className={`${textColor} tracking-tight`}>NEXS</span>

        {/* Electric Spark Icon */}
        <span className="text-yellow-400 ml-0.5 text-base sm:text-xl">⚡</span>
      </div>

      {showTagline && (
        <div className="flex items-center gap-1.5 mt-0.5 pl-0.5">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase text-yellow-400 bg-luminexs-navy/90 px-1.5 py-0.2 rounded">
            BATTERIES & POWER SYSTEMS
          </span>
          <span className="text-[8px] sm:text-[9px] font-semibold text-emerald-400 hidden xs:inline">
            • 100% GENUINE
          </span>
        </div>
      )}
    </div>
  );
};
