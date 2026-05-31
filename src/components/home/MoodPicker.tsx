'use client';

import { useRouter } from 'next/navigation';

const MOODS = [
  { label: 'Funny', emoji: '😂', genreId: '35', color: 'from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30' },
  { label: 'Thrilling', emoji: '🚀', genreId: '28', color: 'from-red-500/10 to-rose-600/10 hover:from-red-500/20 hover:to-rose-600/20 text-red-500 dark:text-red-400 border-red-500/30' },
  { label: 'Romantic', emoji: '❤️', genreId: '10749', color: 'from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 text-pink-500 dark:text-pink-400 border-pink-500/30' },
  { label: 'Scary', emoji: '😱', genreId: '27', color: 'from-purple-500/10 to-indigo-600/10 hover:from-purple-500/20 hover:to-indigo-600/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { label: 'Mind-Bending', emoji: '🧠', genreId: '878', color: 'from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
];

export default function MoodPicker() {
  const router = useRouter();

  const handleMoodClick = (genreId: string) => {
    router.push(`/movies?genre=${genreId}`);
  };

  return (
    <section className="mb-8 md:mb-10 px-4 md:px-8 lg:px-12 animate-fade-in">
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-bold text-sv-text">🎭 What's your vibe today?</h2>
        <p className="text-xs text-sv-text-muted mt-0.5">Select a mood to discover tailored content instantly.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {MOODS.map((mood) => (
          <button
            key={mood.label}
            onClick={() => handleMoodClick(mood.genreId)}
            className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl border bg-gradient-to-br ${mood.color} hover:scale-[1.03] transition-all cursor-pointer font-bold text-xs uppercase tracking-wider shadow-sm`}
          >
            <span className="text-base">{mood.emoji}</span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
