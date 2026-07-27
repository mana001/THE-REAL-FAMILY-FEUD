import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ButterflyIcon } from './ButterflyIcon';

interface HostBanterBannerProps {
  banter: string | null;
}

export const HostBanterBanner: React.FC<HostBanterBannerProps> = ({ banter }) => {
  if (!banter) return null;

  // Clean banter text if prefixed with legacy "BUTTERFLY:" or "Steve Harvey"
  const cleanText = banter.replace(/^BUTTERFLY\s*(\(Host Action\))?:\s*/i, '').replace(/^Steve Harvey\s*\(Host Commentary\)?:\s*/i, '');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        className="w-full max-w-3xl mx-auto my-2 px-3"
      >
        <div className="relative bg-slate-950/90 backdrop-blur-2xl border border-amber-400/50 hover:border-amber-400/80 p-3 sm:p-3.5 rounded-2xl shadow-[0_8px_30px_rgba(245,158,11,0.2)] flex items-center gap-3 overflow-hidden text-left transition-all">
          {/* Decorative Subtle Ambient Glow */}
          <div className="absolute -left-10 -top-10 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Cuter Modern Host Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-rose-400 p-0.5 shrink-0 shadow-lg relative">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ButterflyIcon className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-300 tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>BUTTERFLY (HOST COMMENTARY)</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-amber-50 leading-snug break-words">
              "{cleanText}"
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
