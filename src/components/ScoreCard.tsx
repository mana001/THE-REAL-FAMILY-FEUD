import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Team } from '../types';
import { FamilyIcon } from './FamilyIcon';
import { Trophy, Users, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export interface ScoreCardProps {
  team1?: Team;
  team2?: Team;
  team?: Team; // Fallback if single team prop is passed
  isControl?: boolean;
  activeTurnIdx?: number;
  onViewMembers?: () => void;
  onSelectTeam?: (team: Team) => void;
  bankedPoints?: number;
  team1RoundPoints?: number;
  team2RoundPoints?: number;
  lastRoundWinnerTeamId?: 'team1' | 'team2' | null;
  lastAwardedPoints?: number;
  controlTeamId?: 'team1' | 'team2' | null;
  team1ActiveMemberName?: string;
  team2ActiveMemberName?: string;
  currentRoundIndex?: number;
  totalRounds?: number;
  stage?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  team1: propTeam1,
  team2: propTeam2,
  team,
  onSelectTeam,
  bankedPoints,
  team1RoundPoints = 0,
  team2RoundPoints = 0,
  lastRoundWinnerTeamId,
  lastAwardedPoints = 0,
  controlTeamId,
  team1ActiveMemberName,
  team2ActiveMemberName,
  currentRoundIndex = 0,
  totalRounds = 3,
  stage,
}) => {
  const team1: Team = propTeam1 || team || {
    id: 'team1',
    name: 'Family 1',
    score: 0,
    avatar: '👨‍👩‍👧‍👦',
    members: [],
  };

  const team2: Team = propTeam2 || {
    id: 'team2',
    name: 'Family 2',
    score: 0,
    avatar: '🚀',
    members: [],
  };

  const isRoundEnd = stage === 'round_end';

  return (
    <div className="w-full max-w-5xl mx-auto mb-3">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-blue-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
        <div className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 border-2 border-amber-400/80 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl flex flex-col gap-2">
          
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Team 1 Score Side */}
            <button
              type="button"
              onClick={() => onSelectTeam?.(team1)}
              className={`flex-1 flex items-center justify-start gap-2 sm:gap-3 bg-gradient-to-r from-amber-950/80 to-slate-900/90 border p-2 sm:p-2.5 rounded-xl transition cursor-pointer group/t1 relative overflow-hidden ${
                controlTeamId === 'team1'
                  ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : lastRoundWinnerTeamId === 'team1' && isRoundEnd
                  ? 'border-amber-300 ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                  : 'border-amber-500/30 hover:border-amber-400/70'
              }`}
              title={`Click to view ${team1?.name || 'Family 1'} roster`}
            >
              <div className="p-1.5 bg-amber-500/20 rounded-xl border border-amber-400/30 group-hover/t1:scale-110 transition shrink-0 relative">
                <FamilyIcon iconKey={team1?.avatar} size="md" />
                {controlTeamId === 'team1' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
                )}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider truncate flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {team1?.name || 'Family 1'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-500/40">
                    +{team1RoundPoints} pts
                  </span>
                </div>
              </div>
              <div className="ml-auto bg-slate-950 border-2 border-amber-400 px-2.5 py-1 sm:px-3.5 sm:py-1 rounded-xl text-amber-300 font-mono font-black text-base sm:text-xl md:text-2xl shadow-inner shrink-0">
                {team1?.score ?? 0}
              </div>
            </button>

            {/* VS & Banked Badge & Round Indicator */}
            <div className="flex flex-col items-center justify-center shrink-0 px-1 gap-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider bg-slate-950 border border-amber-500/40 px-2 py-0.5 rounded-full shadow-inner">
                ROUND {currentRoundIndex + 1} / {totalRounds}
              </span>
              <div className="relative bg-gradient-to-b from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-2.5 sm:px-3 py-1 rounded-full shadow-lg border border-amber-200 uppercase tracking-widest flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>VS</span>
              </div>
              {typeof bankedPoints === 'number' && bankedPoints > 0 && (
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/90 border border-amber-500/50 px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">
                  Bank: +{bankedPoints}
                </span>
              )}
            </div>

            {/* Team 2 Score Side */}
            <button
              type="button"
              onClick={() => onSelectTeam?.(team2)}
              className={`flex-1 flex items-center justify-end gap-2 sm:gap-3 bg-gradient-to-l from-blue-950/80 to-slate-900/90 border p-2 sm:p-2.5 rounded-xl transition cursor-pointer group/t2 text-right relative overflow-hidden ${
                controlTeamId === 'team2'
                  ? 'border-blue-400 ring-2 ring-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : lastRoundWinnerTeamId === 'team2' && isRoundEnd
                  ? 'border-blue-300 ring-4 ring-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.8)]'
                  : 'border-blue-500/30 hover:border-blue-400/70'
              }`}
              title={`Click to view ${team2?.name || 'Family 2'} roster`}
            >
              <div className="mr-auto bg-slate-950 border-2 border-blue-400 px-2.5 py-1 sm:px-3.5 sm:py-1 rounded-xl text-blue-300 font-mono font-black text-base sm:text-xl md:text-2xl shadow-inner shrink-0">
                {team2?.score ?? 0}
              </div>
              <div className="flex flex-col text-right min-w-0">
                <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider truncate flex items-center justify-end gap-1">
                  {team2?.name || 'Family 2'}
                  <Users className="w-3 h-3" />
                </span>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[10px] font-extrabold text-blue-300 bg-blue-950/90 px-2 py-0.5 rounded border border-blue-500/40">
                    +{team2RoundPoints} pts
                  </span>
                </div>
              </div>
              <div className="p-1.5 bg-blue-500/20 rounded-xl border border-blue-400/30 group-hover/t2:scale-110 transition shrink-0 relative">
                <FamilyIcon iconKey={team2?.avatar} size="md" />
                {controlTeamId === 'team2' && (
                  <span className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
                )}
              </div>
            </button>
          </div>

          {/* ANIMATED ROUND WINNER & SCORE TRANSFER BANNER */}
          <AnimatePresence>
            {isRoundEnd && lastRoundWinnerTeamId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className={`w-full py-2 px-4 rounded-xl border-2 flex items-center justify-center gap-3 shadow-xl relative overflow-hidden ${
                  lastRoundWinnerTeamId === 'team1'
                    ? 'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-amber-400 text-amber-200'
                    : 'bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 border-blue-400 text-blue-200'
                }`}
              >
                {/* Floating Particle Flow Effect */}
                <motion.div
                  initial={{ x: lastRoundWinnerTeamId === 'team1' ? '100%' : '-100%', opacity: 0.8 }}
                  animate={{ x: lastRoundWinnerTeamId === 'team1' ? '-100%' : '100%', opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                />

                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-center">
                  🎉 {lastRoundWinnerTeamId === 'team1' ? team1.name : team2.name} WINS THE ROUND!
                  <strong className="ml-2 underline">
                    +{lastAwardedPoints || (team1RoundPoints + team2RoundPoints)} PTS TRANSFERRED
                  </strong>
                </span>
                {lastRoundWinnerTeamId === 'team1' ? (
                  <ArrowLeft className="w-5 h-5 text-amber-300 animate-bounce" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-blue-300 animate-bounce" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
