import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Check, Loader2, RefreshCw, MessageSquarePlus } from 'lucide-react';
import { CATEGORY_CHIPS } from '../data/defaultQuestions';
import { SurveyQuestion } from '../types';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (newQuestions: SurveyQuestion[]) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onQuestionsGenerated,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (selectedTopic?: string) => {
    const topic = selectedTopic || topicInput.trim() || 'Fun Pop Culture';
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count: 4 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate survey questions');
      }

      onQuestionsGenerated(data.questions);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error generating questions with Gemini AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left"
        >
          {/* Header Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 animate-pulse" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-lg">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Gemini AI Survey Generator</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-4">
            Generate custom Family Feud survey questions on any topic imaginable! Gemini AI creates realistic survey questions with top answers and point values.
          </p>

          {/* Quick Category Chips */}
          <div className="mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block mb-2">
              Popular Custom Topics:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_CHIPS.map((chip) => (
                <button
                  key={chip}
                  disabled={loading}
                  onClick={() => {
                    setTopicInput(chip);
                    handleGenerate(chip);
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-200 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col gap-3 my-2"
          >
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                Or Type Any Custom Topic:
              </label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g., Star Wars Fans, Camping Blunders, Remote Work..."
                disabled={loading}
                className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 text-amber-100 text-sm px-4 py-2.5 rounded-xl outline-none transition placeholder:text-slate-500"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-950/80 border border-red-500 text-red-300 text-xs p-2.5 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini AI is crafting survey questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Survey Round</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
