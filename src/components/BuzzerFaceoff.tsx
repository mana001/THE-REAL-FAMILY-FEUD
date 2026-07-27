import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, ArrowRight, Sparkles, Lock, ShieldAlert, Users, Timer } from 'lucide-react';
import { SurveyQuestion, Team, CurrentPlayer } from '../types';
import { soundManager } from '../utils/soundEffects';
import { matchSurveyAnswer } from '../utils/answerMatcher';
import { FamilyIcon } from './FamilyIcon';
import { ScoreCard } from './ScoreCard';
import { FamilyMembersModal } from './FamilyMembersModal';

interface BuzzerFaceoffProps {
  question: SurveyQuestion;
  team1: Team;
  team2: Team;
  currentPlayer: CurrentPlayer;
  serverBuzzedTeamId?: 'team1' | 'team2' | null;
  onFaceoffBuzz: (teamId: 'team1' | 'team2') => void;
  onRevealAnswer: (answerId: string) => void;
  onFaceoffWinner: (winnerTeamId: 'team1' | 'team2', passOrPlay: 'play' | 'pass') => void;
  onSubmitGuess?: (guessText: string, playerName?: string, teamId?: 'team1' | 'team2') => void;
  countdownSeconds?: number;
  isHostVerified?: boolean;
  onKickMember?: (teamId: 'team1' | 'team2', memberId: string) => void;
  onSetMemberTurn?: (teamId: 'team1' | 'team2', memberIdx: number) => void;
  team1RoundPoints?: number;
  team2RoundPoints?: number;
}

export const BuzzerFaceoff: React.FC<BuzzerFaceoffProps> = ({
  question,
  team1,
  team2,
  currentPlayer,
  serverBuzzedTeamId,
  onFaceoffBuzz,
  onRevealAnswer,
  onFaceoffWinner,
  onSubmitGuess,
  countdownSeconds = 30,
  isHostVerified = false,
  onKickMember,
  onSetMemberTurn,
  team1RoundPoints = 0,
  team2RoundPoints = 0,
}) => {
  const [buzzedTeamId, setBuzzedTeamId] = useState<'team1' | 'team2' | null>(serverBuzzedTeamId || null);
  const [selectedTeamModal, setSelectedTeamModal] = useState<Team | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [oppAnswerText, setOppAnswerText] = useState('');
  const [guessResult, setGuessResult] = useState<{
    answerText: string;
    points: number;
    isTopAnswer: boolean;
  } | null>(null);
  const [phase, setPhase] = useState<'waiting_buzz' | 'answering' | 'decision' | 'opp_steal'>('waiting_buzz');

  // Live Timer State
  const [timeLeft, setTimeLeft] = useState<number>(countdownSeconds);

  useEffect(() => {
    setTimeLeft(countdownSeconds);
  }, [phase, buzzedTeamId, countdownSeconds]);

  useEffect(() => {
    if (countdownSeconds <= 0 || (phase !== 'waiting_buzz' && phase !== 'answering' && phase !== 'opp_steal')) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          soundManager.playBuzzer();
          if (phase === 'answering' && buzzedTeamId) {
            setPhase('opp_steal');
          } else if (phase === 'opp_steal') {
            setPhase('decision');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, buzzedTeamId, countdownSeconds]);

  const playerTeamId = currentPlayer.teamId;

  // Sync server buzzed state for multi-device synchronization
  useEffect(() => {
    if (serverBuzzedTeamId && phase === 'waiting_buzz') {
      setBuzzedTeamId(serverBuzzedTeamId);
      setPhase('answering');
      soundManager.playFaceoffBuzzer();
    }
  }, [serverBuzzedTeamId, phase]);

  // Keyboard shortcut listener for Party Buzzers ('A' for Team 1, 'L' for Team 2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'waiting_buzz') return;

      const key = e.key.toLowerCase();
      // Lock keyboard buzzer according to chosen family
      if (key === 'a' && (!playerTeamId || playerTeamId === 'team1')) {
        triggerBuzz('team1');
      } else if (key === 'l' && (!playerTeamId || playerTeamId === 'team2')) {
        triggerBuzz('team2');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, playerTeamId]);

  const triggerBuzz = (teamId: 'team1' | 'team2') => {
    if (phase !== 'waiting_buzz') return;
    // Strict family check: players cannot buzz for the opposing team
    if (playerTeamId && playerTeamId !== teamId) return;

    soundManager.playFaceoffBuzzer();
    setBuzzedTeamId(teamId);
    setPhase('answering');
    onFaceoffBuzz(teamId);
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guessText = typedAnswer.trim();
    if (!guessText) return;

    if (onSubmitGuess) {
      onSubmitGuess(guessText, currentPlayer.name, buzzedTeamId || 'team1');
    }

    const matched = matchSurveyAnswer(question.answers, guessText);
    const topAnswer = question.answers[0];

    if (matched) {
      soundManager.playDing();
      const isTop = matched.id === topAnswer.id;
      setGuessResult({
        answerText: matched.text,
        points: matched.points,
        isTopAnswer: isTop,
      });

      if (isTop) {
        // Direct top answer! They choose pass or play
        setPhase('decision');
      } else {
        // Lower answer - opposition gets a try
        setPhase('opp_steal');
      }
    } else {
      soundManager.playBuzzer();
      setGuessResult({
        answerText: `❌ "${guessText}" (Not on Board)`,
        points: 0,
        isTopAnswer: false,
      });
      setPhase('opp_steal');
    }
  };

  const handleOpponentGuess = (oppAnswerText: string) => {
    const guessText = (oppAnswerText || '').trim();
    if (!guessText) return;

    const oppTeamId = buzzedTeamId === 'team1' ? 'team2' : 'team1';
    const oppTeamObj = oppTeamId === 'team1' ? team1 : team2;

    if (onSubmitGuess) {
      onSubmitGuess(guessText, oppTeamObj.members[0]?.name || 'Opponent', oppTeamId);
    }

    const matched = matchSurveyAnswer(question.answers, guessText);
    const buzzedPoints = guessResult?.points || 0;

    if (matched && matched.points > buzzedPoints) {
      soundManager.playDing();
      // Opponent beat them! Opponent gets decision
      setBuzzedTeamId(oppTeamId);
      setGuessResult({
        answerText: matched.text,
        points: matched.points,
        isTopAnswer: matched.id === question.answers[0].id,
      });
      setPhase('decision');
    } else {
      soundManager.playBuzzer();
      // Original buzzed team kept higher points or opp missed! Original team wins decision
      setPhase('decision');
    }
  };

  const winningTeam = buzzedTeamId === 'team1' ? team1 : team2;
  const oppTeam = buzzedTeamId === 'team1' ? team2 : team1;

  const isHostPlayer = currentPlayer.role === 'host' || currentPlayer.teamId === 'host';
  const isTeam1Locked = playerTeamId === 'team2';
  const isTeam2Locked = playerTeamId === 'team1';

  // Check if player is allowed to type the first answer in phase 'answering'
  const isMyBuzzedTurn = !playerTeamId || playerTeamId === buzzedTeamId;
  const isMyOpponentTurn = !playerTeamId || playerTeamId !== buzzedTeamId;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center my-2">
      {/* Score Card Above Faceoff Question */}
      <ScoreCard
        team1={team1}
        team2={team2}
        team1RoundPoints={team1RoundPoints}
        team2RoundPoints={team2RoundPoints}
        onSelectTeam={(t) => setSelectedTeamModal(t)}
      />

      <div className="w-full bg-slate-950 border-4 border-amber-500/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center my-2">
      {/* Background Studio Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-transparent to-amber-950/30 pointer-events-none" />

      {/* Header Banner & Live Timer */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
        <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-6 py-1.5 rounded-full font-black text-sm uppercase tracking-wider shadow-lg">
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Face-Off Showdown</span>
        </div>

        {countdownSeconds > 0 && (
          <div
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono font-black text-sm shadow-lg transition-all border ${
              timeLeft <= 5
                ? 'bg-red-950 border-red-500 text-red-400 animate-pulse scale-105 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-slate-900 border-amber-400/80 text-amber-300'
            }`}
          >
            <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-400 animate-spin' : 'text-amber-400'}`} />
            <span>{timeLeft}s</span>
          </div>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-100 max-w-2xl mx-auto mb-6">
        "{question.question}"
      </h2>

      {/* Locked Team Indicator */}
      {playerTeamId && (
        <div className="mb-4 inline-flex items-center gap-2 bg-slate-900 border border-amber-500/40 px-4 py-1.5 rounded-xl text-xs font-bold text-amber-300">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>
            You are locked in playing for:{' '}
            <strong className="uppercase text-white">{playerTeamId === 'team1' ? team1.name : team2.name}</strong>
          </span>
        </div>
      )}

      {/* PHASE 1: Waiting for Buzzers */}
      {phase === 'waiting_buzz' && (
        <div className="flex flex-col items-center gap-6">
          <p className="text-amber-300/80 font-bold text-sm tracking-wide animate-pulse">
            PRESS YOUR FAMILY'S BUZZER TO TAKE CONTROL! FIRST TO BUZZ WINS FIRST ANSWER ATTEMPT!
          </p>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            {/* Team 1 Red Buzzer */}
            <motion.button
              id="buzzer-team1"
              whileHover={!isTeam1Locked ? { scale: 1.05 } : undefined}
              whileTap={!isTeam1Locked ? { scale: 0.92 } : undefined}
              onClick={() => triggerBuzz('team1')}
              disabled={isTeam1Locked}
              className={`p-8 rounded-3xl border-4 flex flex-col items-center justify-center gap-3 transition ${
                isTeam1Locked
                  ? 'bg-slate-900/60 border-slate-800 opacity-40 cursor-not-allowed'
                  : 'bg-gradient-to-b from-red-600 via-red-700 to-red-900 border-amber-400 shadow-[0_0_30px_rgba(239,68,68,0.5)] cursor-pointer'
              }`}
            >
              <FamilyIcon iconKey={team1.avatar} size="xl" />
              <span className="font-extrabold text-white text-xl uppercase tracking-wider">{team1.name}</span>
              <span className="bg-slate-950/80 text-amber-300 font-bold text-xs px-4 py-1 rounded-full border border-amber-400/50 flex items-center gap-1">
                {isTeam1Locked ? <Lock className="w-3 h-3 text-red-400" /> : null}
                <span>{isTeam1Locked ? 'Locked - Opposing Family' : 'Press [A] to Buzz'}</span>
              </span>
            </motion.button>

            {/* Team 2 Blue Buzzer */}
            <motion.button
              id="buzzer-team2"
              whileHover={!isTeam2Locked ? { scale: 1.05 } : undefined}
              whileTap={!isTeam2Locked ? { scale: 0.92 } : undefined}
              onClick={() => triggerBuzz('team2')}
              disabled={isTeam2Locked}
              className={`p-8 rounded-3xl border-4 flex flex-col items-center justify-center gap-3 transition ${
                isTeam2Locked
                  ? 'bg-slate-900/60 border-slate-800 opacity-40 cursor-not-allowed'
                  : 'bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] cursor-pointer'
              }`}
            >
              <FamilyIcon iconKey={team2.avatar} size="xl" />
              <span className="font-extrabold text-white text-xl uppercase tracking-wider">{team2.name}</span>
              <span className="bg-slate-950/80 text-blue-300 font-bold text-xs px-4 py-1 rounded-full border border-blue-400/50 flex items-center gap-1">
                {isTeam2Locked ? <Lock className="w-3 h-3 text-red-400" /> : null}
                <span>{isTeam2Locked ? 'Locked - Opposing Family' : 'Press [L] to Buzz'}</span>
              </span>
            </motion.button>
          </div>
        </div>
      )}

      {/* PHASE 2: Buzzed Team Answer Input */}
      {phase === 'answering' && buzzedTeamId && (
        <div className="max-w-lg mx-auto bg-slate-900 border-2 border-amber-400/80 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-center gap-3 text-amber-300 font-extrabold text-lg mb-4">
            <FamilyIcon iconKey={winningTeam.avatar} size="md" />
            <span>{winningTeam.name} BUZZED IN FIRST!</span>
          </div>

          {!isMyBuzzedTurn && !isHostPlayer ? (
            <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-center">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-amber-400/50 px-3 py-1 rounded-full text-amber-200 text-xs font-extrabold shadow">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span>Waiting for {winningTeam.name} to answer....</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type first answer guess..."
                autoFocus
                className="w-full bg-slate-950 border border-amber-500/50 text-amber-100 font-bold text-base px-4 py-3 rounded-xl outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow cursor-pointer transition active:scale-95 uppercase tracking-wider"
              >
                Submit Face-Off Answer
              </button>
            </form>
          )}
        </div>
      )}

      {/* PHASE 3: Opponent Try (If first answer wasn't #1) */}
      {phase === 'opp_steal' && (
        <div className="max-w-lg mx-auto bg-slate-900 border-2 border-blue-400/80 p-6 rounded-2xl shadow-xl">
          {guessResult && guessResult.points > 0 && (
            <div className="text-xs font-extrabold mb-2 px-3 py-1.5 rounded-xl border border-emerald-500/40 inline-block bg-slate-950">
              <span className="text-emerald-400">
                First Answer Revealed: <strong className="text-amber-300">"{guessResult.answerText}"</strong> (+{guessResult.points} PTS)
              </span>
            </div>
          )}
          <div className="text-blue-300 font-black text-lg mb-4">
            {oppTeam.name}, CAN YOU GUESS A HIGHER POINT ANSWER?
          </div>

          {!isMyOpponentTurn && !isHostPlayer ? (
            <div className="bg-slate-950 border border-blue-500/30 p-3 rounded-2xl flex items-center justify-center">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-blue-400/50 px-3 py-1 rounded-full text-blue-200 text-xs font-extrabold shadow">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span>Waiting for {oppTeam.name} to answer....</span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (oppAnswerText.trim()) {
                  handleOpponentGuess(oppAnswerText.trim());
                  setOppAnswerText('');
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                value={oppAnswerText}
                onChange={(e) => setOppAnswerText(e.target.value)}
                placeholder={`${oppTeam.name} answer guess...`}
                autoFocus
                className="w-full bg-slate-950 border border-blue-500/50 text-blue-100 font-bold text-base px-4 py-3 rounded-xl outline-none focus:border-blue-400 touch-action-manipulation select-text min-h-[48px]"
              />
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg cursor-pointer active:scale-95 uppercase tracking-wider touch-action-manipulation flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>Submit Opponent Guess</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* PHASE 4: Play or Pass Decision Phase */}
      {phase === 'decision' && buzzedTeamId && (
        <div className="max-w-xl mx-auto bg-slate-900 border-2 border-amber-400 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-amber-300 font-black text-xl uppercase tracking-wider">
            <FamilyIcon iconKey={winningTeam.avatar} size="md" />
            <span>🎉 {winningTeam.name} WINS CONTROL!</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-semibold">
            Highest Score Answer Revealed: <strong className="text-amber-400">"{guessResult?.answerText}"</strong> ({guessResult?.points} pts)
          </p>

          <div className="w-full bg-blue-950/80 border border-blue-400/50 p-3 rounded-xl text-blue-200 text-xs font-bold text-center">
            💬 Chat is OPEN for both families! Game Host will ask <strong className="text-amber-300">{winningTeam.name}</strong> if they want to PLAY or PASS!
          </div>

          {isHostPlayer ? (
            <div className="w-full flex flex-col gap-2.5 mt-2">
              <button
                id="btn-play-board"
                onClick={() => onFaceoffWinner(winningTeam.id, 'play')}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-2xl cursor-pointer transition active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider border-2 border-emerald-300 min-h-[48px]"
              >
                <ArrowRight className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>PROCEED TO MAIN GAME BOARD ({winningTeam.name})</span>
              </button>

              <button
                id="btn-pass-board"
                onClick={() => onFaceoffWinner(oppTeam.id, 'play')}
                className="text-xs text-amber-300/80 hover:text-amber-200 underline font-semibold transition cursor-pointer py-1"
              >
                Pass Control to {oppTeam.name} instead
              </button>
            </div>
          ) : (
            <div className="w-full bg-slate-950/80 border border-amber-500/40 p-4 rounded-xl text-amber-300 text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 mt-1">
              <span className="text-amber-400 font-extrabold uppercase tracking-wider">
                Waiting for Game Host to proceed...
              </span>
              <p className="text-xs text-slate-300 text-center font-normal">
                {winningTeam.name} won the Face-Off! The Game Host will now start the main survey board.
              </p>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Roster Modal */}
      <FamilyMembersModal
        isOpen={!!selectedTeamModal}
        onClose={() => setSelectedTeamModal(null)}
        team={selectedTeamModal}
        isHostVerified={isHostPlayer || isHostVerified}
        onKickMember={onKickMember}
        onSetMemberTurn={onSetMemberTurn}
      />
    </div>
  );
};
