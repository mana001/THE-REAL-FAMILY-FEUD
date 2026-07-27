import React, { useState, useEffect, useRef } from 'react';
import { GuessLog, CurrentPlayer } from '../types';
import { MessageSquare, X, Check, Search, Shield, Zap, Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ButterflyIcon } from './ButterflyIcon';

interface HostAnswerLogBubbleProps {
  currentPlayer: CurrentPlayer;
  isHostVerified: boolean;
  guessLogs?: GuessLog[];
  onHostAddPoints?: (teamId: 'team1' | 'team2', points: number) => void;
  onClearLogs?: () => void;
}

export const HostAnswerLogBubble: React.FC<HostAnswerLogBubbleProps> = ({
  currentPlayer,
  isHostVerified,
  guessLogs = [],
  onHostAddPoints,
  onClearLogs,
}) => {
  const isHost = isHostVerified || currentPlayer.role === 'host' || currentPlayer.teamId === 'host';
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const prevCountRef = useRef(guessLogs.length);

  useEffect(() => {
    if (guessLogs.length > prevCountRef.current && !isOpen) {
      setHasUnread(true);
    }
    prevCountRef.current = guessLogs.length;
  }, [guessLogs.length, isOpen]);

  if (!isHost) return null;

  const filteredLogs = guessLogs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.guessText.toLowerCase().includes(term) ||
      log.playerName.toLowerCase().includes(term) ||
      (log.teamId && log.teamId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed left-2 sm:left-4 bottom-2 z-50 flex flex-col items-start">
      {/* Floating Left Chat Bubble Toggle Button */}
      {!isOpen && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(true);
            setHasUnread(false);
          }}
          className="relative flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl border-2 transition cursor-pointer bg-slate-950/95 text-amber-300 border-amber-500/80 hover:border-amber-400 hover:bg-slate-900"
          title="Host Answer Log Feed (Host Only)"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-slate-950 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-xs font-black tracking-wide uppercase hidden sm:inline">
            Host Answer Log
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
            {guessLogs.length}
          </span>
        </motion.button>
      )}

      {/* Floating Popover Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 sm:left-4 z-50 w-full sm:w-[420px] max-h-[85vh] sm:max-h-[520px] h-[480px] bg-slate-950/95 border-t-2 sm:border-2 border-amber-500/90 rounded-t-3xl sm:rounded-3xl shadow-[0_12px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden backdrop-blur-xl text-left"
          >
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border-b border-amber-500/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 border border-amber-400/40 rounded-xl">
                  <ButterflyIcon className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Real-Time Answer Feed</span>
                    <Shield className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Host Private Log (Only visible to you)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter typed answers..."
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-amber-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Answer Feed List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[50vh] min-h-[160px] scrollbar-thin scrollbar-thumb-amber-500/30">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 text-xs font-medium space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-700" />
                  <p>No typed answers recorded yet.</p>
                  <p className="text-[10px] text-slate-600">
                    When players type guesses in Face-Off or main rounds, they appear here live!
                  </p>
                </div>
              ) : (
                [...filteredLogs].reverse().map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition ${
                      log.matched
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-amber-300 flex items-center gap-1 truncate">
                        <UserCheck className="w-3 h-3 text-amber-400" />
                        {log.playerName}
                        {log.teamId && (
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                              log.teamId === 'team1'
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                : log.teamId === 'team2'
                                ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {log.teamId === 'team1' ? 'Team 1' : log.teamId === 'team2' ? 'Team 2' : log.teamId}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[9px] font-black text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 shadow-sm">
                          ROUND {log.roundNumber || 1}
                        </span>
                        <span className="font-mono text-slate-500 text-[9px]">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm font-black text-white bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 break-words">
                      "{log.guessText}"
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      {log.matched ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/40">
                          <Check className="w-3 h-3" /> MATCHED (+{log.points} PTS)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-400 bg-red-950/80 px-2 py-0.5 rounded-md border border-red-500/30">
                          ❌ MISS / NOT ON BOARD (0 PTS)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[10px] text-amber-300/80 font-bold flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Host Inspection Active
                </span>
                {onClearLogs && guessLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearLogs}
                    className="text-[9px] text-red-400 hover:text-red-300 bg-red-950/60 border border-red-500/30 px-1.5 py-0.5 rounded cursor-pointer transition active:scale-95"
                    title="Clear all recorded answer logs"
                  >
                    Clear Feed
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white underline cursor-pointer"
              >
                Close Log
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
