'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Link2, Users, ExternalLink } from 'lucide-react';

interface InviteModalProps {
  roomCode: string;
  movieTitle: string;
  memberCount: number;
  onClose: () => void;
}

export default function InviteModal({ roomCode, movieTitle, memberCount, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomCode}`
    : `/room/${roomCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(145deg, #0d111d 0%, #161c2e 100%)', border: '1px solid rgba(225,29,72,0.2)' }}
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e11d48, #f43f5e, #e11d48)' }} />

          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎉</span> Party Created!
                </h2>
                <p className="text-sm text-gray-400 mt-1">Share the link to invite friends</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room info card */}
            <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Room Code</span>
                <span className="font-mono font-bold text-2xl tracking-widest" style={{ color: '#e11d48' }}>
                  {roomCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 truncate max-w-[200px]">{movieTitle}</span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Users className="w-3.5 h-3.5" /> {memberCount} watching
                </span>
              </div>
            </div>

            {/* Invite link */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <Link2 className="w-4 h-4" /> Invite Link
              </label>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span className="flex-1 text-sm text-gray-300 truncate font-mono">{inviteUrl}</span>
                <motion.button
                  onClick={handleCopy}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(225,29,72,0.15)',
                    color: copied ? '#22c55e' : '#e11d48',
                  }}
                >
                  {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </motion.button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.15)' }}>
              <p className="text-sm text-gray-300 leading-relaxed">
                📋 Send this link to your friends. When they open it, they'll pick a name and join your party instantly — no account needed.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            >
              <ExternalLink className="w-4 h-4" /> Start Watching
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
