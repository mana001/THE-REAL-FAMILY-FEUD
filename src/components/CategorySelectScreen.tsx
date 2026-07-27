import React from 'react';
import { motion } from 'motion/react';
import { Lock, MessageSquare, CheckCircle2, ShieldAlert, Vote, Trophy } from 'lucide-react';
import { SurveyQuestion, CurrentPlayer, Team } from '../types';
import { FamilyIcon } from './FamilyIcon';
import { ScoreCard } from './ScoreCard';
import { ButterflyIcon } from './ButterflyIcon';

interface CategorySelectScreenProps {
  questions: SurveyQuestion[];
  currentRoundIndex: number;
  currentPlayer: CurrentPlayer;
  team1: Team;
  team2: Team;
  onSelectCategory: (questionId: string, categoryName: string) => void;
  onOpenVote?: () => void;
  onOpenChat?: () => void;
}

export const CategorySelectScreen: React.FC<CategorySelectScreenProps> = ({
  questions,
  currentRoundIndex,
  currentPlayer,
  team1,
  team2,
  onSelectCategory,
  onOpenVote,
  onOpenChat,
}) => {
  const isHost = currentPlayer.role === 'host' || currentPlayer.teamId === 'host';

  // Get 3 category choices for this round
  const startIndex = (currentRoundIndex * 3) % Math.max(1, questions.length - 2);
  const choices = questions.slice(startIndex, startIndex + 3);

  // If questions list is short, fallback to first 3 available
  const displayChoices = choices.length >= 3 ? choices : questions.slice(0, 3);

  const categoryIcons: Record<string, string> = {
    Household: '🏠',
    Workplace: '💼',
    Outdoors: '⛺',
    Entertainment: '🎬',
    'Pop Culture': '⚡',
    Summer: '🏖️',
    Food: '🍔',
    Holidays: '🦃',
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5 px-3 py-4 text-center">
      {/* SCORE CARD DISPLAY ABOVE CATEGORY CARDS */}
      <ScoreCard team1={team1} team2={team2} />

      {/* Header Banner */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 p-6 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col items-center gap-3 relative overflow-hidden"
      >
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/50 px-4 py-1.5 rounded-full text-amber-300 font-extrabold text-xs uppercase tracking-widest">
          <span>ROUND {currentRoundIndex + 1} CATEGORY SELECTION</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 uppercase tracking-wide">
          SELECT THE SURVEY CATEGORY
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-bold flex items-center justify-center gap-1.5 flex-wrap">
          <span>DISCUSS WITH THE HOST</span>
          <ButterflyIcon className="w-4.5 h-4.5 text-amber-400 inline" />
          <span>IN STUDIO CHAT.</span>
        </p>

        {/* Action Controls for Chat */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg border border-blue-400/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>Open Studio Chat To Discuss</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Category Choices Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayChoices.map((q, idx) => {
          const categoryName = q.category || 'General Survey';
          const icon = categoryIcons[categoryName] || '💡';

          return (
            <motion.div
              key={q.id || `cat_${idx}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between text-left relative overflow-hidden ${
                isHost
                  ? 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-950/80 border-slate-800 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Option {idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-black text-amber-200 mb-1">{categoryName}</h3>
                <p className="text-xs text-slate-400 font-medium line-clamp-2 italic mb-4">
                  "{q.question}"
                </p>
              </div>

              {isHost ? (
                <button
                  type="button"
                  onClick={() => onSelectCategory(q.id, categoryName)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Choose Category</span>
                </button>
              ) : (
                <div className="w-full py-2.5 bg-slate-900/90 border border-amber-500/30 text-amber-300/80 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="flex items-center gap-1">
                    Locked • Waiting for <ButterflyIcon className="w-3.5 h-3.5 text-amber-400 inline" /> <strong className="font-mono text-amber-300">BUTTERFLY</strong>
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!isHost && (
        <div className="bg-slate-900/80 border border-amber-500/30 px-4 py-2.5 rounded-xl text-amber-200 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex items-center gap-1">
            Only <ButterflyIcon className="w-3.5 h-3.5 text-amber-400 inline" /> <strong className="font-mono text-amber-300">BUTTERFLY</strong> can click a category card. Use the chat to request your favorite option!
          </span>
        </div>
      )}
    </div>
  );
};

