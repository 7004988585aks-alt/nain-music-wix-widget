import React, { useState } from 'react';
import { Play, Pause, Volume2, Music } from 'lucide-react';

interface AudioPlayerProps {
  title?: string;
  src?: string;
  audioUrl?: string;
  artist?: string;
  compact?: boolean;
  beforeUrl?: string;
  afterUrl?: string;
  hasBeforeAfter?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title = 'Audio Showcase',
  hasBeforeAfter = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'after' | 'before'>('after');
  const [progress, setProgress] = useState(38);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Waveform bars with pseudo heights
  const bars = [
    18, 32, 45, 60, 40, 75, 90, 82, 65, 45, 55, 78, 88, 92, 70, 48, 60, 78, 85,
    65, 50, 42, 68, 80, 95, 88, 70, 52, 64, 82, 90, 75, 58, 44, 60, 72, 85, 68,
    45, 30, 52, 68, 78, 55, 40, 25, 35, 50, 65, 48, 30, 20
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
            <p className="text-xs text-slate-400">
              {hasBeforeAfter ? (activeTrack === 'after' ? 'Mastered / Mixed Version' : 'Raw Unprocessed Stems') : 'Studio Preview'}
            </p>
          </div>
        </div>

        {hasBeforeAfter && (
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveTrack('before')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTrack === 'before'
                  ? 'bg-slate-700 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Before (Raw)
            </button>
            <button
              type="button"
              onClick={() => setActiveTrack('after')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTrack === 'after'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              After (Mastered)
            </button>
          </div>
        )}
      </div>

      {/* Waveform graphic */}
      <div 
        className="h-14 flex items-center gap-0.5 px-2 py-1 bg-slate-950/60 rounded-lg cursor-pointer select-none relative overflow-hidden border border-slate-800/80"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newPct = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
          setProgress(newPct);
        }}
      >
        {bars.map((height, i) => {
          const barPct = (i / bars.length) * 100;
          const isPassed = barPct <= progress;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-150"
              style={{
                height: `${height}%`,
                backgroundColor: isPassed
                  ? activeTrack === 'after' ? '#f59e0b' : '#38bdf8'
                  : '#334155',
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center justify-center transition shadow font-bold"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <span className="font-mono text-slate-300">
            {Math.floor((progress * 0.01 * 180) / 60)}:
            {String(Math.floor((progress * 0.01 * 180) % 60)).padStart(2, '0')} / 3:00
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            24-bit 48kHz WAV
          </span>
          <Volume2 className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
