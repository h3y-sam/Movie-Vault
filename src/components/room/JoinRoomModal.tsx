'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ChevronRight, Shuffle } from 'lucide-react';

const AVATARS = ['🎬', '🦊', '🐼', '🦁', '🐯', '🐸', '🦋', '🐙', '🦄', '🎃', '👽', '🤖',
  '🧙', '🧛', '🧜', '🧝', '🦸', '🕵️', '🥷', '🎅', '👾', '🎭', '🍿', '🌙'];

const COLORS = ['#e11d48', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7', '#ec4899'];

interface JoinRoomModalProps {
  roomCode?: string;
  movieTitle?: string;
  onJoin: (name: string, avatar: string, color: string) => void;
  onClose: () => void;
}

export default function JoinRoomModal({ roomCode, movieTitle, onJoin, onClose }: JoinRoomModalProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  const pickRandom = () => {
    setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Please enter a display name');
      return;
    }
    if (name.trim().length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }
    onJoin(name.trim(), avatar, color);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(145deg, #0d111d 0%, #161c2e 100%)', border: '1px solid rgba(225,29,72,0.2)' }}
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Top gradient bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e11d48, #f43f5e, #e11d48)' }} />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {roomCode ? 'Join Watch Party' : 'Start Watch Party'}
                </h2>
                {movieTitle && (
                  <p className="text-sm text-gray-400 mt-1">Watching: <span className="text-white">{movieTitle}</span></p>
                )}
                {roomCode && (
                  <p className="text-sm text-gray-400 mt-1">
                    Room: <span className="font-mono font-bold text-[#e11d48]">{roomCode}</span>
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar picker */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Choose your avatar</label>
                <button
                  onClick={pickRandom}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Random
                </button>
              </div>

              {/* Selected preview */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                  style={{ background: `${color}22`, border: `2px solid ${color}` }}
                >
                  {avatar}
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-8 gap-1.5">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAvatar(a)}
                        className={`text-xl w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          avatar === a ? 'bg-white/20 scale-110' : 'hover:bg-white/10'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full transition-transform"
                    style={{
                      background: c,
                      transform: color === c ? 'scale(1.3)' : 'scale(1)',
                      outline: color === c ? `2px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Name input */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                <User className="w-4 h-4 inline mr-1.5" />
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: error ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.1)',
                }}
              />
              {error && <p className="text-xs text-[#e11d48] mt-1.5">{error}</p>}
            </div>

            {/* CTA */}
            <button
              onClick={handleJoin}
              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            >
              {roomCode ? 'Join Party' : 'Create Party'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
