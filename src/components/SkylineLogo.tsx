import React from 'react';

interface SkylineLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  iconOnly?: boolean;
  className?: string;
}

/**
 * Custom vector recreation of the Skyline™ SOFTWARE brand mark
 * styled in deep purple & radiant lavender highlights.
 */
export const SkylineLogo: React.FC<SkylineLogoProps> = ({
  size = 'md',
  variant = 'dark',
  iconOnly = false,
  className = '',
}) => {
  const heightMap = {
    sm: 28,
    md: 38,
    lg: 50,
  };

  const iconHeight = heightMap[size];
  const isDark = variant === 'dark';

  const wordColor = isDark ? '#F5F3FF' : '#1E1038';
  const subColor = isDark ? '#C4B5FD' : '#5B21B6';
  const ruleColor = isDark ? 'rgba(196, 181, 253, 0.45)' : 'rgba(109, 40, 217, 0.35)';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {/* Cloud + Architectural Skyline + Swoosh Emblem */}
      <svg
        height={iconHeight}
        viewBox="0 0 140 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="skylineCloudGrad" x1="16" y1="16" x2="128" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#E9D5FF" />
          </linearGradient>
          <linearGradient id="skylineTowerMain" x1="70" y1="8" x2="70" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E9D5FF" />
            <stop offset="45%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>
          <linearGradient id="skylineTowerSide" x1="40" y1="24" x2="40" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="55%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#2E1065" />
          </linearGradient>
          <linearGradient id="skylineSwoosh" x1="10" y1="88" x2="132" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B0764" />
            <stop offset="45%" stopColor="#7C3AED" />
            <stop offset="80%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#F3E8FF" />
          </linearGradient>
        </defs>

        {/* Cloud outline arching over the towers */}
        <path
          d="M17 62C11.5 52 15.5 38.5 26 34.5C30 33 34.5 33.2 38.2 34.8C41.8 22.8 53 14.5 66.2 14.5C73.5 14.5 80.2 17 85.4 21.4C90.2 18.8 96 18 101.6 19.6C112 22.5 119.2 31.8 119.5 42.6C125.6 45.8 129 52.8 127 60.4"
          stroke="url(#skylineCloudGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Tower 1 (Far left small) */}
        <path d="M22 79V56L32 50V77L22 79Z" fill="url(#skylineTowerSide)" />

        {/* Tower 2 (Left mid) */}
        <path d="M35 77V42L45 36V75L35 77Z" fill="url(#skylineTowerSide)" />

        {/* Tower 3 (Left tall with horizontal window slats) */}
        <path d="M48 75V28L60 22V73L48 75Z" fill="url(#skylineTowerSide)" />
        <g stroke="#EDE9FE" strokeWidth="1.5" strokeOpacity="0.8">
          <line x1="51" y1="33" x2="57" y2="30" />
          <line x1="51" y1="38" x2="57" y2="35" />
          <line x1="51" y1="43" x2="57" y2="40" />
          <line x1="51" y1="48" x2="57" y2="45" />
          <line x1="51" y1="53" x2="57" y2="50" />
          <line x1="51" y1="58" x2="57" y2="55" />
          <line x1="51" y1="63" x2="57" y2="60" />
        </g>

        {/* Tower 4 (Center hero spire skyscraper) */}
        <path d="M64 72V20L76 14V70L64 72Z" fill="url(#skylineTowerMain)" />
        <path d="M76 70V14L82 22V69L76 70Z" fill="#4C1D95" />
        {/* Spire needle */}
        <path d="M75.5 14L76.5 3L77.5 14.5Z" fill="#F3E8FF" />

        {/* Tower 5 (Right mid) */}
        <path d="M85 68V30L93 34V66L85 68Z" fill="url(#skylineTowerSide)" />

        {/* Tower 6 (Far right with window slats) */}
        <path d="M97 64V37L108 42V61L97 64Z" fill="url(#skylineTowerSide)" />
        <g stroke="#EDE9FE" strokeWidth="1.4" strokeOpacity="0.75">
          <line x1="100" y1="44" x2="105" y2="46" />
          <line x1="100" y1="49" x2="105" y2="51" />
          <line x1="100" y1="54" x2="105" y2="56" />
        </g>

        {/* Sweeping orbital swoosh underneath */}
        <path
          d="M8 82C6 93 26 98 56 89C92 78 128 57 128 42C133 49 128 65 104 79C75 96 28 103 11 94C6 91 5.5 86 8 82Z"
          fill="url(#skylineSwoosh)"
        />
      </svg>

      {/* Wordmark: Skyline™ + — SOFTWARE — */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-start">
            <span
              className="font-sans font-extrabold tracking-tight"
              style={{
                color: wordColor,
                fontSize: size === 'lg' ? '1.65rem' : size === 'md' ? '1.25rem' : '1rem',
                lineHeight: 1,
              }}
            >
              Skyl
              <span className="relative inline-block">
                ı
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 rounded-[1px]"
                  style={{
                    top: size === 'lg' ? '1px' : '0px',
                    width: size === 'lg' ? '6px' : size === 'md' ? '4.5px' : '3.5px',
                    height: size === 'lg' ? '5px' : size === 'md' ? '4px' : '3px',
                    background: 'linear-gradient(135deg, #E9D5FF 0%, #A855F7 100%)',
                    boxShadow: '0 0 8px rgba(192, 132, 252, 0.75)',
                  }}
                />
              </span>
              ne
            </span>
            <span
              className="font-sans font-bold ml-0.5"
              style={{
                color: subColor,
                fontSize: size === 'lg' ? '0.6rem' : '0.48rem',
                lineHeight: 1,
                marginTop: '2px',
              }}
            >
              TM
            </span>
          </div>

          {/* — SOFTWARE — */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-[1px] flex-1 min-w-[12px]" style={{ backgroundColor: ruleColor }} />
            <span
              className="font-sans font-semibold uppercase"
              style={{
                color: subColor,
                fontSize: size === 'lg' ? '0.62rem' : size === 'md' ? '0.52rem' : '0.46rem',
                letterSpacing: '0.26em',
                lineHeight: 1,
              }}
            >
              Software
            </span>
            <span className="h-[1px] flex-1 min-w-[12px]" style={{ backgroundColor: ruleColor }} />
          </div>
        </div>
      )}
    </div>
  );
};
