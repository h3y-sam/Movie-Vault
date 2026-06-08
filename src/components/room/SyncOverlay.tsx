'use client';

import { motion } from 'framer-motion';
import { Play, RotateCcw, Volume2 } from 'lucide-react';

interface SyncOverlayProps {
  message: string;
  targetTime: number;
  onSync: () => void;
  onDismiss: () => void;
}

export default function SyncOverlay({ message, targetTime, onSync, onDismiss }: SyncOverlayProps) {
  // Format target time to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <motion.div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[40] flex items-center justify-center p-4 select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="max-w-xs w-full rounded-2xl p-5 text-center flex flex-col items-center shadow-2xl border"
        style={{
          background: 'linear-gradient(145deg, #0d111d 0%, #161c2e 100%)',
          borderColor: 'rgba(225, 29, 72, 0.3)',
        }}
      >
        <div className="w-12 h-12 rounded-full bg-sv-red/10 border border-sv-red/30 flex items-center justify-center text-sv-red mb-3 animate-pulse">
          <Play className="w-6 h-6 fill-sv-red" />
        </div>

        <h3 className="text-white font-bold text-base mb-1">Out of Sync</h3>
        <p className="text-gray-400 text-xs mb-4 leading-relaxed">
          {message} ({formatTime(targetTime)})
        </p>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onSync}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Sync Player Now
          </button>
          
          <button
            onClick={onDismiss}
            className="w-full py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}
