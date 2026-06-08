'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowRight, Home, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleJoin = async () => {
    const upper = code.trim().toUpperCase();
    if (!upper) { setError('Please enter a room code'); return; }
    if (upper.length !== 6) { setError('Room codes are 6 characters long'); return; }

    setChecking(true);
    setError('');
    try {
      const res = await fetch(`/api/room/${upper}`);
      if (!res.ok) throw new Error('Room not found or has expired');
      router.push(`/room/${upper}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040508] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, #e11d48 0%, transparent 65%)' }}
      />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #0d111d 0%, #161c2e 100%)',
            border: '1px solid rgba(225,29,72,0.2)',
          }}
        >
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e11d48, #f43f5e, #e11d48)' }} />

          <div className="p-8">
            {/* Icon + Title */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)' }}
              >
                <Users className="w-8 h-8 text-sv-red" />
              </div>
              <h1 className="text-2xl font-black text-white mb-1">Join a Watch Party</h1>
              <p className="text-sm text-gray-400">Enter the 6-character room code to join your friends</p>
            </div>

            {/* Code input */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4" /> Room Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const val = e.target.value;
                  const roomMatch = val.match(/\/room\/([A-Za-z0-9]{6})/i);
                  if (roomMatch && roomMatch[1]) {
                    setCode(roomMatch[1].toUpperCase());
                  } else {
                    setCode(val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                  }
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="e.g. X9B3T2"
                maxLength={6}
                autoFocus
                spellCheck={false}
                className="w-full px-4 py-4 rounded-xl text-2xl font-black text-white placeholder-gray-600 outline-none text-center tracking-[0.4em] transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: error ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.1)',
                  letterSpacing: '0.4em',
                }}
              />
              {error && (
                <motion.p
                  className="text-xs text-[#e11d48] mt-2 text-center"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleJoin}
              disabled={checking || code.length !== 6}
              className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            >
              {checking ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking room...
                </span>
              ) : (
                <>Join Watch Party <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Got a party link? Just open it directly in your browser.
        </p>
      </motion.div>
    </div>
  );
}
