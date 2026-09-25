import React from 'react';

interface NainLogoProps {
  className?: string;
  size?: number;
}

export const NainLogo: React.FC<NainLogoProps> = ({ 
  className = "w-10 h-10",
  size
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={style}
      aria-label="Nain Music Logo"
    >
      <defs>
        {/* Rich multi-stop metallic gold gradient */}
        <linearGradient id="nainGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5DF9E" />
          <stop offset="20%" stopColor="#C99B3B" />
          <stop offset="45%" stopColor="#8C6218" />
          <stop offset="65%" stopColor="#FDEAB4" />
          <stop offset="85%" stopColor="#B58327" />
          <stop offset="100%" stopColor="#E2BD6D" />
        </linearGradient>

        <linearGradient id="nainGoldText" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="35%" stopColor="#E5BE6C" />
          <stop offset="70%" stopColor="#9C6F1E" />
          <stop offset="100%" stopColor="#5E3F0A" />
        </linearGradient>

        <linearGradient id="nainEyeTexture" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#8F6522" />
          <stop offset="25%" stopColor="#DAAE53" />
          <stop offset="50%" stopColor="#54360D" />
          <stop offset="75%" stopColor="#E2BC67" />
          <stop offset="100%" stopColor="#301A03" />
        </linearGradient>

        {/* Deep rich crimson burgundy medallion background */}
        <radialGradient id="nainCrimsonBg" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#6C0B16" />
          <stop offset="35%" stopColor="#4F050E" />
          <stop offset="70%" stopColor="#320106" />
          <stop offset="95%" stopColor="#1B0003" />
          <stop offset="100%" stopColor="#0F0001" />
        </radialGradient>

        {/* Radiant star center flare */}
        <radialGradient id="nainCenterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="25%" stopColor="#FFF3BD" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#E6A831" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#B37714" stopOpacity="0" />
        </radialGradient>

        {/* Filter for bevel & glow */}
        <filter id="nainDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
        </filter>

        {/* Arc path for the bottom motto */}
        <path
          id="nainMottoPath"
          d="M 95,415 A 190,190 0 0,0 405,415"
          fill="none"
        />
      </defs>

      {/* Outer shadow boundary */}
      <circle cx="250" cy="250" r="244" fill="#140002" opacity="0.6" />

      {/* Main Crimson Medallion with Gold Rim */}
      <circle 
        cx="250" 
        cy="250" 
        r="236" 
        fill="url(#nainCrimsonBg)" 
        stroke="url(#nainGoldRim)" 
        strokeWidth="11" 
      />

      {/* Inner concentric fine golden circle */}
      <circle 
        cx="250" 
        cy="250" 
        r="222" 
        fill="none" 
        stroke="url(#nainGoldRim)" 
        strokeWidth="2.5" 
        opacity="0.85" 
      />

      {/* Circular fine dotted track */}
      <circle 
        cx="250" 
        cy="250" 
        r="215" 
        fill="none" 
        stroke="url(#nainGoldRim)" 
        strokeWidth="1" 
        strokeDasharray="2, 4" 
        opacity="0.4" 
      />

      {/* ================= CENTRAL EYE (NAIN) ================= */}
      <g filter="url(#nainDropShadow)">
        {/* Eye outer silhouette (vertical almond / leaf) */}
        <path
          d="M 250,52 C 305,115 320,185 250,265 C 180,185 195,115 250,52 Z"
          fill="url(#nainEyeTexture)"
          stroke="url(#nainGoldRim)"
          strokeWidth="3.5"
        />

        {/* Eye lid / inner shell right curve */}
        <path
          d="M 250,52 C 285,110 295,175 250,265"
          fill="none"
          stroke="url(#nainGoldRim)"
          strokeWidth="2.5"
          opacity="0.75"
        />

        {/* Eye eyelid crease left curve */}
        <path
          d="M 250,52 C 220,110 215,175 250,265"
          fill="none"
          stroke="#422505"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Radiating eyelid texture lines from center */}
        <g stroke="url(#nainGoldRim)" strokeWidth="1.2" opacity="0.5">
          <line x1="250" y1="172" x2="222" y2="135" />
          <line x1="250" y1="172" x2="214" y2="165" />
          <line x1="250" y1="172" x2="218" y2="198" />
          <line x1="250" y1="172" x2="232" y2="230" />
          <line x1="250" y1="172" x2="278" y2="135" />
          <line x1="250" y1="172" x2="286" y2="165" />
          <line x1="250" y1="172" x2="282" y2="198" />
          <line x1="250" y1="172" x2="268" y2="230" />
        </g>

        {/* Eyelashes / fine radiating spikes on the right curve */}
        <g stroke="url(#nainGoldRim)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
          <line x1="285" y1="110" x2="310" y2="102" />
          <line x1="295" y1="125" x2="324" y2="120" />
          <line x1="302" y1="145" x2="335" y2="142" />
          <line x1="305" y1="168" x2="340" y2="168" />
          <line x1="302" y1="190" x2="336" y2="194" />
          <line x1="295" y1="210" x2="325" y2="218" />
          <line x1="284" y1="230" x2="308" y2="242" />
        </g>

        {/* Center Iris Core */}
        <circle cx="250" cy="172" r="32" fill="#1C0902" stroke="url(#nainGoldRim)" strokeWidth="2.5" />
        <circle cx="250" cy="172" r="22" fill="#4A2505" />

        {/* Radiant Starburst Flare */}
        <circle cx="250" cy="172" r="55" fill="url(#nainCenterGlow)" />

        {/* 8-pointed golden radiant star beams */}
        {/* Horizontal major ray */}
        <polygon 
          points="90,172 250,167 410,172 250,177" 
          fill="url(#nainGoldRim)" 
          opacity="0.95" 
        />
        {/* Vertical major ray */}
        <polygon 
          points="250,85 255,172 250,258 245,172" 
          fill="url(#nainGoldRim)" 
          opacity="0.95" 
        />
        {/* Diagonal ray 1 */}
        <polygon 
          points="138,102 252,170 362,242 248,174" 
          fill="url(#nainGoldRim)" 
          opacity="0.8" 
        />
        {/* Diagonal ray 2 */}
        <polygon 
          points="362,102 252,174 138,242 248,170" 
          fill="url(#nainGoldRim)" 
          opacity="0.8" 
        />

        {/* Pure brilliant white star center */}
        <polygon 
          points="215,172 250,169 285,172 250,175" 
          fill="#FFFFFF" 
        />
        <polygon 
          points="250,137 253,172 250,207 247,172" 
          fill="#FFFFFF" 
        />
        <circle cx="250" cy="172" r="7" fill="#FFFFFF" />
      </g>

      {/* ================= TYPOGRAPHY ================= */}
      {/* "NAIN" text */}
      <text
        x="250"
        y="324"
        textAnchor="middle"
        fill="url(#nainGoldText)"
        fontFamily="'Times New Roman', 'Cinzel', 'Playfair Display', Georgia, serif"
        fontSize="62"
        fontWeight="bold"
        letterSpacing="8"
        filter="url(#nainDropShadow)"
      >
        NAIN
      </text>

      {/* Divider line left - right under NAIN */}
      <line 
        x1="110" 
        y1="339" 
        x2="175" 
        y2="339" 
        stroke="url(#nainGoldRim)" 
        strokeWidth="2" 
      />

      {/* "MUSIC" text - directly right underneath NAIN with minimal gap */}
      <text
        x="250"
        y="345"
        textAnchor="middle"
        fill="url(#nainGoldText)"
        fontFamily="'Times New Roman', 'Cinzel', 'Playfair Display', Georgia, serif"
        fontSize="22"
        fontWeight="bold"
        letterSpacing="9"
        filter="url(#nainDropShadow)"
      >
        MUSIC
      </text>

      {/* Divider line right - right under NAIN */}
      <line 
        x1="325" 
        y1="339" 
        x2="390" 
        y2="339" 
        stroke="url(#nainGoldRim)" 
        strokeWidth="2" 
      />

      {/* Curved Motto: CREATE • LEARN • SHARE • GROW */}
      <text
        fill="url(#nainGoldRim)"
        fontFamily="'Times New Roman', 'Cinzel', sans-serif"
        fontSize="12.5"
        fontWeight="bold"
        letterSpacing="4"
        opacity="0.9"
      >
        <textPath href="#nainMottoPath" startOffset="50%" textAnchor="middle">
          CREATE  •  LEARN  •  SHARE  •  GROW
        </textPath>
      </text>
    </svg>
  );
};
