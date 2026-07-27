import React from 'react';
import { Volume2, Sparkles, AlertCircle, Award } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export const AudienceSoundboard: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto my-2 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
        <Volume2 className="w-4 h-4" />
        <span>Studio Audience Soundboard</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => soundManager.playDing()}
          className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-800/40 text-emerald-300 font-bold rounded-lg transition active:scale-95 cursor-pointer"
        >
          🛎️ Ding! (+Points)
        </button>

        <button
          onClick={() => soundManager.playBuzzer()}
          className="px-3 py-1 bg-red-950/80 border border-red-500/40 hover:bg-red-800/40 text-red-300 font-bold rounded-lg transition active:scale-95 cursor-pointer"
        >
          ❌ Strike Buzz!
        </button>

        <button
          onClick={() => soundManager.playWinFanfare()}
          className="px-3 py-1 bg-amber-950/80 border border-amber-500/40 hover:bg-amber-800/40 text-amber-300 font-bold rounded-lg transition active:scale-95 cursor-pointer"
        >
          🎺 Studio Applause!
        </button>
      </div>
    </div>
  );
};
