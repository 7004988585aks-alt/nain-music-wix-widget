import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIFloatingSupportWidgetProps {
  onOpen: () => void;
}

export const AIFloatingSupportWidget: React.FC<AIFloatingSupportWidgetProps> = ({ onOpen }) => {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={onOpen}
        className="relative group w-12 h-12 rounded-full bg-slate-950 hover:bg-slate-900 border-2 border-amber-500/60 hover:border-amber-400 shadow-xl shadow-amber-500/15 hover:shadow-amber-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer overflow-visible"
        title="Nain AI Assistant & Support"
        aria-label="Nain AI Assistant & Support"
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent blur-xs group-hover:blur-sm transition-all" />

        {/* Designer Stylized 'N' Emblem SVG */}
        <svg
          viewBox="0 0 48 48"
          className="w-6 h-6 z-10 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nainGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="nainSlashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>

          {/* Left Vertical Audio Pillar */}
          <path
            d="M12 36V12C12 10.3431 13.3431 9 15 9C16.6569 9 18 10.3431 18 12V36C18 37.6569 16.6569 39 15 39C13.3431 39 12 37.6569 12 36Z"
            fill="url(#nainGoldGrad)"
          />

          {/* Dynamic Diagonal Waveform Connector */}
          <path
            d="M14.5 11.5L33.5 36.5C34.6 37.9 36 36.8 36 35V13C36 11.3431 34.6569 10 33 10C31.3431 10 30 11.3431 30 13V26.5L17.5 10C16.3 8.5 14.5 9.8 14.5 11.5Z"
            fill="url(#nainSlashGrad)"
          />

          {/* Right Pillar Cap Accent */}
          <path
            d="M30 36V28L36 36V36C36 37.6569 34.6569 39 33 39C31.3431 39 30 37.6569 30 36Z"
            fill="url(#nainGoldGrad)"
          />

          {/* Micro Music Frequency Dots */}
          <circle cx="24" cy="24" r="1.5" fill="#FEF08A" className="animate-pulse" />
        </svg>

        {/* Floating Sparkle Micro-badge */}
        <div className="absolute -top-1 -right-1 z-20 flex items-center justify-center">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950 items-center justify-center">
              <span className="w-1 h-1 bg-white rounded-full" />
            </span>
          </span>
        </div>
      </button>
    </div>
  );
};
