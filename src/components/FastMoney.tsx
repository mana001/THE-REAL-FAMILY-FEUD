import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, Sparkles, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SurveyQuestion, FastMoneyEntry } from '../types';
import { soundManager } from '../utils/soundEffects';

interface FastMoneyProps {
  questions: SurveyQuestion[];
  onCompleteFastMoney: (won: boolean, totalPoints: number) => void;
}

export const FastMoney: React.FC<FastMoneyProps> = ({ questions, onCompleteFastMoney }) => {
  // Take 5 questions for Fast Money
  const fmQuestions = questions.slice(0, 5);

  const [step, setStep] = useState<'intro' | 'p1_turn' | 'p2_turn' | 'reveal_board'>('intro');
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  const [p1Answers, setP1Answers] = useState<string[]>(Array(5).fill(''));
  const [p2Answers, setP2Answers] = useState<string[]>(Array(5).fill(''));
  const [currentInput, setCurrentInput] = useState('');

  const [revealStep, setRevealStep] = useState(0); // For sequential reveal animation
  const [totalPoints, setTotalPoints] = useState(0);

  // Timer countdown hook for Player turns
  useEffect(() => {
    if (step !== 'p1_turn' && step !== 'p2_turn') return;

    if (timeLeft <= 0) {
      soundManager.playBuzzer();
      if (step === 'p1_turn') {
        setStep('p2_turn');
        setTimeLeft(25);
        setActiveQuestionIdx(0);
        setCurrentInput('');
      } else {
        calculateAndReveal();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        soundManager.playTimerTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const handleStartP1 = () => {
    setStep('p1_turn');
    setTimeLeft(20);
    setActiveQuestionIdx(0);
    setCurrentInput('');
  };

  const handleNextAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const answer = currentInput.trim();
    setCurrentInput('');

    if (step === 'p1_turn') {
      const updated = [...p1Answers];
      updated[activeQuestionIdx] = answer;
      setP1Answers(updated);

      if (activeQuestionIdx < 4) {
        setActiveQuestionIdx((prev) => prev + 1);
      } else {
        // Player 1 finished all 5
        soundManager.playDing();
        setStep('p2_turn');
        setTimeLeft(25);
        setActiveQuestionIdx(0);
      }
    } else if (step === 'p2_turn') {
      // Check duplicate with P1
      if (answer.toLowerCase() === p1Answers[activeQuestionIdx].toLowerCase()) {
        soundManager.playBuzzer();
        alert('Duplicate answer! Please give another answer.');
        return;
      }

      const updated = [...p2Answers];
      updated[activeQuestionIdx] = answer;
      setP2Answers(updated);

      if (activeQuestionIdx < 4) {
        setActiveQuestionIdx((prev) => prev + 1);
      } else {
        // Player 2 finished all 5
        soundManager.playDing();
        calculateAndReveal();
      }
    }
  };

  const calculateAndReveal = () => {
    setStep('reveal_board');
    let ptsAcc = 0;

    fmQuestions.forEach((q, idx) => {
      const p1Text = (p1Answers[idx] || '').toLowerCase();
      const p2Text = (p2Answers[idx] || '').toLowerCase();

      const p1Match = q.answers.find((a) => a.text.toLowerCase().includes(p1Text) || p1Text.includes(a.text.toLowerCase()));
      const p2Match = q.answers.find((a) => a.text.toLowerCase().includes(p2Text) || p2Text.includes(a.text.toLowerCase()));

      ptsAcc += (p1Match?.points || 0) + (p2Match?.points || 0);
    });

    setTotalPoints(ptsAcc);
    if (ptsAcc >= 200) {
      soundManager.playWinFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-950 border-4 border-amber-500 rounded-3xl p-6 shadow-2xl relative my-4 text-center">
      {/* Fast Money Header */}
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-slate-950 px-6 py-2 rounded-full font-black text-base uppercase tracking-widest mb-6 shadow-lg">
        <Trophy className="w-5 h-5 fill-slate-950" />
        <span>FAST MONEY ROUND ($20,000)</span>
      </div>

      {/* STEP 1: Intro Screen */}
      {step === 'intro' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-100">
            20 SECONDS. 5 QUESTIONS. 200 POINTS TO WIN!
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Player 1 gets 20 seconds to answer 5 survey questions. Player 2 will be off-stage and gets 25 seconds to answer the same 5 questions without repeating any answers!
          </p>

          <button
            id="start-fast-money-p1-btn"
            onClick={handleStartP1}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>START PLAYER 1 (20 SEC)</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* STEP 2: Player Turns */}
      {(step === 'p1_turn' || step === 'p2_turn') && (
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Timer Clock Header */}
          <div className="flex items-center gap-4 bg-slate-900 border-2 border-amber-400 px-6 py-2 rounded-2xl shadow-inner">
            <Timer className="w-6 h-6 text-amber-400 animate-spin" />
            <span className="font-mono text-3xl font-black text-amber-300">
              {timeLeft}s
            </span>
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {step === 'p1_turn' ? 'PLAYER 1 TURN' : 'PLAYER 2 TURN'}
            </span>
          </div>

          {/* Current Question */}
          <div className="w-full bg-blue-950/80 border border-amber-400/50 p-6 rounded-2xl shadow-lg">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
              Question {activeQuestionIdx + 1} of 5
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-amber-100">
              "{fmQuestions[activeQuestionIdx]?.question}"
            </h3>
          </div>

          {/* Answer Form */}
          <form onSubmit={handleNextAnswer} className="w-full max-w-md flex items-center gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type fast answer & press enter..."
              autoFocus
              className="flex-1 bg-slate-900 border border-amber-500/60 text-amber-100 font-bold text-base px-4 py-3 rounded-xl outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow cursor-pointer transition active:scale-95 shrink-0"
            >
              NEXT
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: Reveal Board */}
      {step === 'reveal_board' && (
        <div className="flex flex-col items-center gap-6 py-2">
          {/* Total Score Announcement */}
          <div className="bg-slate-900 border-2 border-amber-400 p-6 rounded-2xl shadow-2xl w-full max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Total Fast Money Score</span>
            <div className="text-5xl font-mono font-black text-amber-300 my-2">
              {totalPoints} / 200 PTS
            </div>

            {totalPoints >= 200 ? (
              <div className="text-emerald-400 font-extrabold text-lg flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
                <span>GRAND PRIZE WINNERS! YOU BROKE 200 POINTS!</span>
              </div>
            ) : (
              <div className="text-amber-200/80 font-bold text-sm">
                Short of 200 points threshold. Good effort team!
              </div>
            )}
          </div>

          {/* Detailed Question Breakdown Table */}
          <div className="w-full space-y-3 my-2">
            {fmQuestions.map((q, idx) => {
              const p1Text = p1Answers[idx] || '-';
              const p2Text = p2Answers[idx] || '-';

              const p1Match = q.answers.find((a) => a.text.toLowerCase().includes(p1Text.toLowerCase()));
              const p2Match = q.answers.find((a) => a.text.toLowerCase().includes(p2Text.toLowerCase()));

              return (
                <div
                  key={q.id}
                  className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Q{idx + 1}: {q.question}</span>
                    <div className="text-xs text-slate-300 font-semibold mt-1">
                      Top Answer: <strong className="text-amber-300">{q.answers[0]?.text} ({q.answers[0]?.points} pts)</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-500/30 text-center">
                      <span className="text-slate-400 block text-[9px]">P1: {p1Text}</span>
                      <span className="text-amber-400 font-mono text-sm">{p1Match?.points || 0} pts</span>
                    </div>

                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-blue-500/30 text-center">
                      <span className="text-slate-400 block text-[9px]">P2: {p2Text}</span>
                      <span className="text-blue-400 font-mono text-sm">{p2Match?.points || 0} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onCompleteFastMoney(totalPoints >= 200, totalPoints)}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer mt-4"
          >
            FINISH GAME & VIEW FINAL SCORE
          </button>
        </div>
      )}
    </div>
  );
};
