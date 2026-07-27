import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles, RefreshCw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team } from '../types';
import { soundManager } from '../utils/soundEffects';
import { FamilyIcon } from './FamilyIcon';

interface GameOverModalProps {
  winnerTeam: Team;
  loserTeam: Team;
  fastMoneyWon?: boolean | null;
  fastMoneyPoints?: number;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winnerTeam,
  loserTeam,
  fastMoneyWon,
  fastMoneyPoints,
  onPlayAgain,
}) => {
  useEffect(() => {
    soundManager.playWinFanfare();
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border-4 border-amber-500 rounded-3xl p-8 shadow-2xl relative text-center overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 animate-pulse" />

        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-3xl border-2 border-amber-200 shadow-xl mb-4 text-4xl">
          🏆
        </div>

        <h1 className="text-3xl font-black text-amber-100 uppercase tracking-wide">
          {winnerTeam?.name || 'Winning Team'} WINS!
        </h1>

        <p className="text-xs text-amber-400 font-extrabold uppercase tracking-widest my-2">
          Undertopia Feud 🐌 Grand Champions
        </p>

        {/* Score Comparison Box */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 my-6 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <FamilyIcon iconKey={winnerTeam?.avatar} size="md" />
            <div className="font-extrabold text-amber-300 text-sm mt-1">{winnerTeam?.name || 'Winner'}</div>
            <div className="font-mono text-2xl font-black text-amber-400">{winnerTeam?.score ?? 0} PTS</div>
          </div>

          <div className="text-slate-600 font-extrabold text-xl">VS</div>

          <div className="flex flex-col items-center">
            <FamilyIcon iconKey={loserTeam?.avatar} size="md" />
            <div className="font-bold text-slate-400 text-sm mt-1">{loserTeam?.name || 'Runner Up'}</div>
            <div className="font-mono text-xl font-bold text-slate-400">{loserTeam?.score ?? 0} PTS</div>
          </div>
        </div>

        {fastMoneyPoints !== undefined && (
          <div className="bg-blue-950/60 border border-blue-500/40 rounded-xl p-3 mb-6 text-xs font-bold text-blue-200">
            Fast Money Score: <strong className="text-amber-300 font-mono text-base">{fastMoneyPoints} PTS</strong> {fastMoneyWon ? '(WON $20,000 GRAND PRIZE!)' : ''}
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>PLAY ANOTHER GAME</span>
        </button>
      </motion.div>
    </div>
  );
};
