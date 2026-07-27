import React from 'react';
import { X, BookOpen, Trophy, Volume2, ShieldCheck, MessageSquare, Zap, Target } from 'lucide-react';

interface GameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameTutorialModal: React.FC<GameTutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative text-left max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/30 pb-4 mb-4 shrink-0">
          <div className="p-3 bg-amber-500/20 border border-amber-400/50 rounded-2xl text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-amber-200 text-lg uppercase tracking-wider">
              Undertopia Feud • How To Play & Tutorial
            </h2>
            <p className="text-xs text-slate-400">Master the studio rules, buzzer faceoffs, and host controls</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-2">
          {/* Step 1 */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>1. Joining & Families</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Join as <strong className="text-amber-300">Family 1 (Red Podium)</strong> or <strong className="text-blue-300">Family 2 (Blue Podium)</strong> from your phone or desktop. BUTTERFLY oversees and manages the game.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>2. Category & First Players</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Discuss survey choices in the <strong className="text-blue-300">Studio Chat</strong>. Select faceoff players and step up to the podium!
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4 text-amber-400" />
              <span>3. Buzzer Face-Off & Chat Voting</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Buzz in first! If you reveal the #1 answer, your family decides whether to <strong className="text-emerald-400">PLAY</strong> or <strong className="text-red-400">PASS</strong>. Vote live when a poll opens in Studio Chat!
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>4. Survey Board, Strikes & Fast Money</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Clear the board to bank all points! 3 strikes give the opposing family 1 chance to STEAL all banked points. Fast Money unlocks at the end!
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-4 mt-2 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
          >
            Got It • Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
