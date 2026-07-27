import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  X,
  Plus,
  Minus,
  Sparkles,
  Check,
  Shield,
  Users,
  Timer,
  ChevronRight,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Eye,
  Clock,
  Crown,
} from 'lucide-react';
import { SurveyQuestion, Team, CurrentPlayer } from '../types';
import { soundManager } from '../utils/soundEffects';
import { FamilyIcon } from './FamilyIcon';
import { ScoreCard } from './ScoreCard';
import { FamilyMembersModal } from './FamilyMembersModal';
import { ButterflyIcon } from './ButterflyIcon';

interface FeudBoardProps {
  question: SurveyQuestion;
  roundBankedPoints: number;
  strikes: number;
  team1: Team;
  team2: Team;
  controlTeamId: 'team1' | 'team2' | null;
  stage: string;
  currentPlayer: CurrentPlayer;
  team1TurnIdx: number;
  team2TurnIdx: number;
  team1RoundPoints?: number;
  team2RoundPoints?: number;
  lastRoundWinnerTeamId?: 'team1' | 'team2' | null;
  lastAwardedPoints?: number;
  onRevealAnswer: (answerId: string) => void;
  onAddStrike: () => void;
  onSubmitGuess?: (guessText: string, playerName?: string, teamId?: 'team1' | 'team2') => void;
  onAwardPointsToTeam: (teamId: 'team1' | 'team2') => void;
  multiplier: number;
  countdownSeconds?: number;
  isHostVerified?: boolean;
  isPaused?: boolean;
  isStealAcknowledged?: boolean;
  onAcknowledgeSteal?: () => void;
  onHostAddPoints?: (teamId: 'team1' | 'team2' | 'bank', points: number, target?: 'total' | 'round') => void;
  onHostSetControl?: (teamId: 'team1' | 'team2') => void;
  onHostSetMemberTurn?: (teamId: 'team1' | 'team2', memberIdx: number) => void;
  onHostSubtractStrike?: () => void;
  onHostClearStrikes?: () => void;
  onProceedToRoundEndSummary?: () => void;
  currentRoundIndex?: number;
  totalRounds?: number;
  onKickMember?: (teamId: 'team1' | 'team2', memberId: string) => void;
}

export const FeudBoard: React.FC<FeudBoardProps> = ({
  question,
  roundBankedPoints,
  strikes,
  team1,
  team2,
  controlTeamId,
  stage,
  currentPlayer,
  team1TurnIdx,
  team2TurnIdx,
  team1RoundPoints = 0,
  team2RoundPoints = 0,
  lastRoundWinnerTeamId,
  lastAwardedPoints = 0,
  onRevealAnswer,
  onAddStrike,
  onSubmitGuess,
  onAwardPointsToTeam,
  multiplier,
  countdownSeconds = 30,
  isHostVerified = false,
  isPaused = false,
  isStealAcknowledged = false,
  onAcknowledgeSteal,
  onHostAddPoints,
  onHostSetControl,
  onHostSetMemberTurn,
  onHostSubtractStrike,
  onHostClearStrikes,
  onProceedToRoundEndSummary,
  currentRoundIndex = 0,
  totalRounds = 3,
  onKickMember,
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [customPointsInput, setCustomPointsInput] = useState<number>(50);
  const [showRosterTeam, setShowRosterTeam] = useState<Team | null>(null);
  const [isHostDeskOpen, setIsHostDeskOpen] = useState(false);
  const [timerLeft, setTimerLeft] = useState(countdownSeconds);
  const [showStrikeAnimation, setShowStrikeAnimation] = useState(false);

  const isHost = currentPlayer.role === 'host' || isHostVerified;

  // Active Team and Member Turn Calculation
  const activeTeam = controlTeamId === 'team1' ? team1 : controlTeamId === 'team2' ? team2 : null;
  const activeTurnIdx = controlTeamId === 'team1' ? team1TurnIdx : team2TurnIdx;
  const activeMember = activeTeam?.members && activeTeam.members.length > 0
    ? activeTeam.members[activeTurnIdx % activeTeam.members.length]
    : null;

  const isMyTurn = Boolean(
    !isHost &&
      activeTeam &&
      activeMember &&
      (activeMember.id === currentPlayer.id || activeMember.name.includes(currentPlayer.name))
  );

  // Sound effects on strikes update
  useEffect(() => {
    if (strikes > 0) {
      soundManager.playBuzzer();
      setShowStrikeAnimation(true);
      const timer = setTimeout(() => setShowStrikeAnimation(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [strikes]);

  // Unique Turn Key to detect actual turn changes or correct answers revealed
  const revealedCount = question.answers.filter((a) => a.revealed).length;
  const turnKey = `${stage}_${controlTeamId}_${activeTurnIdx}_${strikes}_${revealedCount}`;
  const prevTurnKeyRef = useRef(turnKey);
  const hasFiredStrikeRef = useRef(false);

  // Reset timer on actual turn change or stage change
  useEffect(() => {
    if (prevTurnKeyRef.current !== turnKey) {
      prevTurnKeyRef.current = turnKey;
      hasFiredStrikeRef.current = false;
      setTimerLeft(countdownSeconds || 30);
    }
  }, [turnKey, countdownSeconds]);

  // Countdown timer interval
  useEffect(() => {
    if (isPaused || stage === 'round_end') return;

    const interval = setInterval(() => {
      setTimerLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, stage]);

  // Auto handle timer reaching 0 (fires ONCE per turn)
  useEffect(() => {
    if (timerLeft === 0 && !isPaused && stage !== 'round_end' && !hasFiredStrikeRef.current) {
      hasFiredStrikeRef.current = true;
      soundManager.playBuzzer();
      if (isHost || isMyTurn) {
        onAddStrike();
      }
    }
  }, [timerLeft, isPaused, stage, isHost, isMyTurn, onAddStrike]);

  const handleManualSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const text = guessInput.trim();
    if (!text) return;

    if (onSubmitGuess) {
      onSubmitGuess(
        text,
        currentPlayer.name,
        (controlTeamId as 'team1' | 'team2') || currentPlayer.teamId || 'team1'
      );
    } else {
      const term = text.toLowerCase();
      const matched = question.answers.find(
        (a) => !a.revealed && (a.text.toLowerCase().includes(term) || term.includes(a.text.toLowerCase()))
      );

      if (matched) {
        soundManager.playDing();
        onRevealAnswer(matched.id);
      } else {
        onAddStrike();
      }
    }
    setGuessInput('');
  };

  const allRevealed = question.answers.every((a) => a.revealed);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 px-2 sm:px-4 py-2">
      {/* Header Score Card */}
      <ScoreCard
        team1={team1}
        team2={team2}
        bankedPoints={roundBankedPoints}
        team1RoundPoints={team1RoundPoints}
        team2RoundPoints={team2RoundPoints}
        lastRoundWinnerTeamId={lastRoundWinnerTeamId}
        lastAwardedPoints={lastAwardedPoints}
        stage={stage}
        controlTeamId={controlTeamId}
        currentRoundIndex={currentRoundIndex}
        totalRounds={totalRounds}
        team1ActiveMemberName={
          activeMember && controlTeamId === 'team1' ? activeMember.name : undefined
        }
        team2ActiveMemberName={
          activeMember && controlTeamId === 'team2' ? activeMember.name : undefined
        }
        onSelectTeam={(t) => setShowRosterTeam(t)}
      />

      {/* Question Header Card */}
      <div className="w-full bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <div className="bg-amber-500/20 border border-amber-400/70 text-amber-300 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>ROUND {currentRoundIndex + 1} OF {totalRounds}</span>
          </div>
          <div className="bg-slate-950 border border-amber-500/40 text-amber-400 text-xs font-black uppercase px-3 py-1 rounded-full shadow-inner">
            {multiplier === 1 ? 'SINGLE POINTS (1X)' : multiplier === 2 ? 'DOUBLE POINTS (2X)' : 'TRIPLE POINTS (3X)'}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
            CATEGORY: {question.category || 'WORKPLACE'}
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight drop-shadow">
          "{question.question}"
        </h2>

        {/* Countdown Bar & Timer Display */}
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold px-1">
            <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {stage === 'steal' ? 'STEAL CHANCE TIMER' : 'TURN TIMER'}
            </span>
            <span
              className={`font-mono font-black px-2.5 py-0.5 rounded-md text-xs sm:text-sm border transition-all ${
                timerLeft <= 5
                  ? 'bg-red-600 text-white border-red-400 animate-bounce'
                  : timerLeft <= 10
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'text-amber-300 bg-slate-950 border-amber-500/30'
              }`}
            >
              ⏱️ {timerLeft}s
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className={`h-full ${timerLeft <= 5 ? 'bg-red-500' : 'bg-amber-400'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timerLeft / (countdownSeconds || 30)) * 100}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* STEAL PHASE ANNOUNCEMENT MODAL OVERLAY */}
      <AnimatePresence>
        {stage === 'steal' && !isStealAcknowledged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] relative overflow-hidden"
            >
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/50 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                <ButterflyIcon className="w-4 h-4 text-amber-400" />
                <span>STEAL OPPORTUNITY</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-amber-300 uppercase tracking-tight mb-2 drop-shadow">
                NOW IS THE {activeTeam ? activeTeam.name.toUpperCase() : 'SECOND'} FAMILY CHANCE!
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 font-semibold mb-6">
                3 Strikes on the board! <strong className="text-amber-400">{activeTeam ? activeTeam.name : 'Second Family'}</strong> takes over control to reveal remaining answers and clear the board!
              </p>

              {isHost ? (
                <button
                  onClick={() => {
                    soundManager.playDing();
                    onAcknowledgeSteal?.();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-200"
                >
                  <Crown className="w-5 h-5 text-slate-950" />
                  <span>PROCEED TO STEAL CHANCE 🎤</span>
                </button>
              ) : (
                <div className="w-full py-3.5 bg-slate-950/90 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-inner">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span>Waiting for Host BUTTERFLY to start Steal...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feud Game Board Box */}
      <div className="w-full bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center gap-4">
        
        {/* Active Team Playing Badge */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-5 py-1.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{stage === 'steal' ? 'STEAL TURN:' : 'Playing:'} {activeTeam ? activeTeam.name : 'NO TEAM'}</span>
          </div>

          {/* Turn status indicator */}
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              Waiting for{' '}
              <strong className="text-amber-300">
                {activeMember ? activeMember.name : activeTeam ? activeTeam.name : 'Player'}
              </strong>{' '}
              to answer...
            </span>
          </div>
        </div>

        {/* Strikes Bar */}
        <div className="flex items-center justify-center gap-2 bg-slate-900/90 border border-slate-800/80 px-5 py-1.5 rounded-xl shadow-inner">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">
            STRIKES:
          </span>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs transition-all duration-300 ${
                num <= strikes
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 border border-red-400 scale-110'
                  : 'bg-slate-800 text-slate-600 border border-slate-700'
              }`}
            >
              X
            </div>
          ))}
        </div>

        {/* Answer Grid (2 Columns, 6 Slots) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 my-1">
          {question.answers.map((answer, index) => (
            <motion.div
              key={answer.id || index}
              onClick={() => {
                if (isHost && !answer.revealed) {
                  soundManager.playDing();
                  onRevealAnswer(answer.id);
                }
              }}
              whileHover={{ scale: answer.revealed ? 1 : 1.01 }}
              className={`relative min-h-[56px] rounded-xl border-2 flex items-center justify-between px-4 py-2.5 transition-all cursor-pointer shadow-md ${
                answer.revealed
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : isHost
                  ? 'bg-slate-900 border-amber-500/40 text-amber-200 hover:border-amber-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-amber-500/40'
              }`}
            >
              {/* Slot Number & Text */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center border shrink-0 ${
                    answer.revealed
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : isHost
                      ? 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight truncate">
                  {answer.revealed ? (
                    answer.text
                  ) : isHost ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-200 font-extrabold text-xs sm:text-sm">
                      <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="underline decoration-amber-400/60">{answer.text}</span>
                      <span className="text-[9px] bg-amber-500/30 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded uppercase font-extrabold">HOST</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      🔒 HIDDEN ANSWER
                    </span>
                  )}
                </span>
              </div>

              {/* Points Badge */}
              <div className="font-mono font-black text-sm shrink-0 ml-2">
                {answer.revealed ? (
                  <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-lg border border-amber-300 shadow">
                    {answer.points * multiplier}
                  </span>
                ) : isHost ? (
                  <span className="text-amber-300 bg-slate-950 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-mono font-black">
                    {answer.points * multiplier} PTS
                  </span>
                ) : (
                  <span className="text-slate-600 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs">
                    --
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guess Input Form inside Board */}
        {(isHost || isMyTurn) && stage !== 'round_end' && (
          <form
            onSubmit={handleManualSubmitGuess}
            className="w-full flex flex-col sm:flex-row items-center gap-2 mt-2"
          >
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder={
                isMyTurn
                  ? `Type ${activeTeam?.name || 'team'}'s survey answer guess...`
                  : "Host: Type guess or click answers on board..."
              }
              className="flex-1 w-full bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-400 font-semibold text-sm"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg hover:opacity-95 transition cursor-pointer uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>SUBMIT GUESS</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playBuzzer();
                  onAddStrike();
                }}
                className="px-3.5 py-3 bg-red-600/90 hover:bg-red-500 text-white font-black rounded-xl shadow transition cursor-pointer text-xs flex items-center justify-center gap-1 shrink-0"
                title="Add Strike"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">STRIKE</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Host Admin Quick Controls Bubble */}
      {isHost && (
        <div className="w-full flex justify-end my-1 relative z-30">
          {/* Bubble Trigger Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHostDeskOpen(!isHostDeskOpen)}
            className={`px-4 py-2 rounded-full shadow-2xl border-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
              isHostDeskOpen
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-950/90 text-amber-300 border-amber-500/80 hover:bg-slate-900 hover:border-amber-400'
            }`}
            title="Toggle Host Studio Control Desk"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Host Studio Control</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9px] font-mono px-1.5 py-0.2 rounded-md">
              {isHostDeskOpen ? '▲ Close' : '▼ Open'}
            </span>
          </motion.button>

          {/* Expanded Host Studio Desk Floating Panel */}
          <AnimatePresence>
            {isHostDeskOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 bottom-12 z-40 w-full max-w-lg bg-slate-950/95 border-2 border-amber-500/90 p-4 rounded-3xl shadow-2xl backdrop-blur-xl text-left"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/20 border border-amber-400/40 rounded-xl">
                      <Shield className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Host Studio Control Desk
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHostDeskOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {/* 1. Family Board Control */}
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Family Control
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => onHostSetControl?.('team1')}
                        className={`px-2 py-1.5 rounded-xl font-black text-[10px] border transition cursor-pointer ${
                          controlTeamId === 'team1'
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                            : 'bg-slate-950 text-amber-300 border-amber-500/30 hover:bg-slate-800'
                        }`}
                      >
                        {team1.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => onHostSetControl?.('team2')}
                        className={`px-2 py-1.5 rounded-xl font-black text-[10px] border transition cursor-pointer ${
                          controlTeamId === 'team2'
                            ? 'bg-blue-500 text-white border-blue-300 shadow-md'
                            : 'bg-slate-950 text-blue-300 border-blue-500/30 hover:bg-slate-800'
                        }`}
                      >
                        {team2.name}
                      </button>
                    </div>
                  </div>

                  {/* 2. Strike Controls */}
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Strikes ({strikes}/3)
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => onAddStrike()}
                        className="px-1 py-1.5 bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-500/50 font-bold text-[9px] rounded-xl transition cursor-pointer"
                        title="Add Strike"
                      >
                        + Strike
                      </button>
                      <button
                        type="button"
                        onClick={() => onHostSubtractStrike?.()}
                        className="px-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[9px] rounded-xl transition cursor-pointer"
                        title="Remove Strike"
                      >
                        - Strike
                      </button>
                      <button
                        type="button"
                        onClick={() => onHostClearStrikes?.()}
                        className="px-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[9px] rounded-xl transition cursor-pointer"
                        title="Clear Strikes"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* 3. Custom Points Award (Total vs Round Bank) */}
                  <div className="bg-slate-900/90 border border-amber-500/30 p-2.5 rounded-2xl flex flex-col gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                        Award Custom Points
                      </span>
                      <span className="text-amber-400 text-[9px] font-bold">Exact Control</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={customPointsInput}
                        onChange={(e) => setCustomPointsInput(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-16 bg-slate-950 border border-amber-500/50 rounded-xl px-2 py-1 text-center font-black text-amber-300 text-xs outline-none focus:border-amber-400"
                        placeholder="Points"
                      />
                      <div className="flex gap-1 flex-1">
                        {[10, 25, 50, 100].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setCustomPointsInput(val)}
                            className={`flex-1 py-1 rounded-lg text-[9px] font-extrabold border transition cursor-pointer ${
                              customPointsInput === val
                                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            +{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ROUND BANK POINTS */}
                    <div className="flex flex-col gap-1 pt-1 border-t border-slate-800">
                      <span className="text-[9px] font-extrabold text-blue-300 uppercase tracking-tight">Round Score Bank:</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => onHostAddPoints?.('team1', customPointsInput, 'round')}
                          className="px-1.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-[9px] rounded-lg transition cursor-pointer truncate"
                          title={`+${customPointsInput} to ${team1.name} Round Score`}
                        >
                          +{customPointsInput} {team1.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => onHostAddPoints?.('bank', customPointsInput, 'round')}
                          className="px-1.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-black text-[9px] rounded-lg transition cursor-pointer truncate"
                          title={`+${customPointsInput} to Round Bank`}
                        >
                          +{customPointsInput} Bank
                        </button>
                        <button
                          type="button"
                          onClick={() => onHostAddPoints?.('team2', customPointsInput, 'round')}
                          className="px-1.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-black text-[9px] rounded-lg transition cursor-pointer truncate"
                          title={`+${customPointsInput} to ${team2.name} Round Score`}
                        >
                          +{customPointsInput} {team2.name}
                        </button>
                      </div>
                    </div>

                    {/* TOTAL GAME SCORE */}
                    <div className="flex flex-col gap-1 pt-1 border-t border-slate-800">
                      <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-tight">Total Game Score:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onHostAddPoints?.('team1', customPointsInput, 'total')}
                          className="px-2 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[9px] uppercase rounded-lg transition shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>+{customPointsInput} {team1.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onHostAddPoints?.('team2', customPointsInput, 'total')}
                          className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-[9px] uppercase rounded-lg transition shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>+{customPointsInput} {team2.name}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Active Turn Selectors */}
                <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                    Select Active Member Turn
                  </span>
                  
                  {/* Team 1 Members */}
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-amber-400 uppercase">
                      {team1.name} Members:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {team1.members.map((m, idx) => {
                        const isActive = idx === (team1TurnIdx % (team1.members.length || 1));
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onHostSetMemberTurn?.('team1', idx)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                              isActive
                                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow ring-1 ring-amber-300'
                                : 'bg-slate-950 text-amber-200 border-amber-500/30 hover:bg-slate-800'
                            }`}
                          >
                            <span>{m.avatar}</span>
                            <span>{m.name}</span>
                            {isActive && <span className="text-[9px]">🎯</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team 2 Members */}
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-blue-400 uppercase">
                      {team2.name} Members:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {team2.members.map((m, idx) => {
                        const isActive = idx === (team2TurnIdx % (team2.members.length || 1));
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onHostSetMemberTurn?.('team2', idx)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                              isActive
                                ? 'bg-blue-500 text-white border-blue-300 shadow ring-1 ring-blue-300'
                                : 'bg-slate-950 text-blue-200 border-blue-500/30 hover:bg-slate-800'
                            }`}
                          >
                            <span>{m.avatar}</span>
                            <span>{m.name}</span>
                            {isActive && <span className="text-[9px]">🎯</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Proceed to Round Summary Button (if round complete or stage is round_end) */}
      {(stage === 'round_end' || allRevealed) && onProceedToRoundEndSummary && (
        isHost ? (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              soundManager.playWinFanfare();
              onProceedToRoundEndSummary();
            }}
            className="w-full max-w-md my-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-base rounded-2xl shadow-2xl hover:opacity-95 transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-emerald-300"
          >
            <Crown className="w-5 h-5 text-slate-950" />
            <span>View Round Summary (Host)</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </motion.button>
        ) : (
          <div className="w-full max-w-md my-4 py-3.5 bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg">
            <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <span>Waiting for Host BUTTERFLY to open Round Summary...</span>
          </div>
        )
      )}

      {/* Roster Modal */}
      {showRosterTeam && (
        <FamilyMembersModal
          team={showRosterTeam}
          isOpen={Boolean(showRosterTeam)}
          onClose={() => setShowRosterTeam(null)}
          isControlTeam={controlTeamId === showRosterTeam.id}
          activeTurnIdx={showRosterTeam.id === 'team1' ? team1TurnIdx : team2TurnIdx}
          isHostVerified={isHost || isHostVerified}
          onKickMember={onKickMember}
          onSetMemberTurn={onHostSetMemberTurn}
        />
      )}
    </div>
  );
};
