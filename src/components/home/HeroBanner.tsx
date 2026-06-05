'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { MediaItem } from '@/types/tmdb.types';

interface HeroBannerProps {
  items?: MediaItem[];
}

export default function HeroBanner({ items = [] }: HeroBannerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative w-full min-h-[55vh] md:min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 overflow-hidden">
      {/* Subtle radial purple glow background behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-glow-purple pointer-events-none z-0" />

      {/* Branding badge pill */}
      <div className="relative z-10 flex items-center gap-1.5 bg-sv-red/10 border border-sv-red/20 px-3.5 py-1 rounded-full text-xs font-semibold text-sv-red mb-6 tracking-wide animate-fade-in uppercase">
        <span>▶</span> StremioTV Premium
      </div>

      {/* Massive Headline */}
      <h1 className="relative z-10 text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.15] max-w-4xl mb-6">
        <span className="text-white">Discover</span>
        <br />
        <span className="text-gradient-purple">Your Next Favorite Story.</span>
      </h1>

      {/* Muted Subtitle */}
      <p className="relative z-10 text-[#9ca3af] text-sm md:text-base max-w-lg mb-8 leading-relaxed">
        Stream thousands of movies, TV series, anime, and Bollywood hits with premium audio dubs and seamless failover players.
      </p>

      {/* Centered Search Pill */}
      <form onSubmit={handleSearchSubmit} className="relative z-10 w-full max-w-md md:max-w-xl px-4 animate-fade-in-up">
        <div className="flex items-center bg-[#13131a]/90 border border-white/5 rounded-full shadow-2xl shadow-sv-red/5 p-1.5 focus-within:border-sv-red/50 focus-within:ring-2 focus-within:ring-sv-red/10 transition-all">
          <Search className="w-5 h-5 text-[#9ca3af] ml-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to watch tonight?"
            className="bg-transparent text-sm text-white px-4 py-2 w-full outline-none placeholder:text-[#6b7280]"
          />
          <button
            type="submit"
            className="bg-sv-red hover:bg-sv-red-hover text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors shrink-0 shadow-lg shadow-sv-red/20 cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>
    </section>
  );
}
