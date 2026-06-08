'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingEmojiProps {
  id: string;
  emoji: string;
  x: number; // 0-100% horizontal position
  onDone: (id: string) => void;
}

export default function FloatingEmoji({ id, emoji, x, onDone }: FloatingEmojiProps) {
  const doneRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone(id);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [id, onDone]);

  return (
    <motion.div
      className="absolute bottom-16 select-none pointer-events-none z-30 text-3xl"
      style={{ left: `${x}%` }}
      initial={{ y: 0, opacity: 1, scale: 0.5 }}
      animate={{
        y: -200,
        opacity: [1, 1, 0.8, 0],
        scale: [0.5, 1.3, 1.1, 0.9],
        rotate: [0, -10, 10, -5, 5, 0],
      }}
      transition={{ duration: 2.6, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  );
}
