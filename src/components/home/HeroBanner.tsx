'use client';

import { useState, useEffect } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { MediaItem } from '@/types/tmdb.types';
import { getBackdropUrl } from '@/lib/tmdb';
import { GENRE_MAP, TV_GENRE_MAP } from '@/lib/constants';
import Link from 'next/link';

interface HeroBannerProps {
  items?: MediaItem[];
}

export default function HeroBanner({ items = [] }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'fade-in' | 'fade-out'>('fade-in');

  // Rotate hero items every 5 seconds if items are available
  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      // Trigger fade out
      setFadeState('fade-out');
      
      // Wait for fade out to complete before changing index and fading in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setFadeState('fade-in');
      }, 500); // match transition duration
    }, 6000);

    return () => clearInterval(interval);
  }, [items]);


  const currentItem = items[currentIndex];

  const getMediaInfo = (item: MediaItem) => {
    if (!item) return { title: '', year: '', type: 'movie', genres: [] as string[] };
    const title = 'title' in item ? item.title : item.name;
    const date = 'release_date' in item ? item.release_date : item.first_air_date;
    const year = date ? new Date(date).getFullYear().toString() : '';
    const type = 'title' in item ? 'movie' : 'tv';
    
    // Map genres
    const genreIds = item.genre_ids || [];
    const map = type === 'movie' ? GENRE_MAP : TV_GENRE_MAP;
    const genres = genreIds.slice(0, 3).map(id => map[id] || 'Action');

    return { title, year, type, genres };
  };

  const { title, year, type, genres } = currentItem ? getMediaInfo(currentItem) : { title: 'Discover Your Next Story', year: '', type: 'movie', genres: [] };

  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex flex-col justify-end px-6 md:px-16 pb-16 pt-48 overflow-hidden bg-black">
      {/* Background Image Carousel with Fades */}
      {currentItem && (
        <div className="absolute inset-0 z-0">
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out ${
              fadeState === 'fade-in' ? 'opacity-40 md:opacity-50' : 'opacity-0'
            }`}
            style={{ 
              backgroundImage: `url(${getBackdropUrl(currentItem.backdrop_path, 'original')})`,
            }}
          />
          {/* Gradients to blend banner into the website */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-[#09090b]/10" />
        </div>
      )}

      {/* Subtle radial purple glow background when no currentItem */}
      {!currentItem && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-glow-purple pointer-events-none z-0" />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-start text-left mb-6">
        {/* Branding badge pill */}
        <div className="flex items-center gap-1.5 bg-sv-red/10 border border-sv-red/20 px-3.5 py-1 rounded-full text-xs font-semibold text-sv-red mb-4 tracking-wide uppercase">
          <span>▶</span> Trending Now
        </div>

        {/* Dynamic Title */}
        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] mb-4 text-white transition-all duration-500 ${
          fadeState === 'fade-in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {title}
        </h1>

        {/* Meta details row */}
        {currentItem && (
          <div className={`flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-300 mb-4 font-medium transition-all duration-500 delay-75 ${
            fadeState === 'fade-in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <span className="flex items-center gap-1 text-[#fbbf24] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              {currentItem.vote_average ? currentItem.vote_average.toFixed(1) : '0.0'}
            </span>
            {year && <span className="bg-white/10 px-2 py-0.5 rounded">{year}</span>}
            <span className="capitalize bg-sv-red/20 text-sv-red border border-sv-red/30 px-2 py-0.5 rounded text-[11px] font-bold">
              {type === 'movie' ? 'Movie' : 'TV Show'}
            </span>
            {genres.map((g, idx) => (
              <span key={idx} className="text-gray-400">
                {idx > 0 && <span className="mr-2 text-gray-600">•</span>}
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Description/Overview */}
        {currentItem && (
          <p className={`text-gray-400 text-sm md:text-base max-w-2xl mb-8 leading-relaxed line-clamp-3 transition-all duration-500 delay-100 ${
            fadeState === 'fade-in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {currentItem.overview}
          </p>
        )}

        {/* Buttons and CTAs */}
        {currentItem && (
          <div className={`flex flex-wrap items-center gap-4 mb-10 transition-all duration-500 delay-150 ${
            fadeState === 'fade-in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Link
              href={`/watch/${type}/${currentItem.id}?play=true`}
              className="flex items-center gap-2 bg-sv-red hover:bg-sv-red-hover text-white text-sm font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-sv-red/20 hover:scale-105 cursor-pointer"
            >
              <Play className="w-4.5 h-4.5 fill-current" />
              Play Now
            </Link>
            <Link
              href={`/detail/${type}/${currentItem.id}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer backdrop-blur-sm"
            >
              <Info className="w-4.5 h-4.5" />
              More Info
            </Link>
          </div>
        )}
      </div>

      {/* Slide Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-6 md:right-16 z-10 flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setFadeState('fade-out');
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setFadeState('fade-in');
                }, 300);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-sv-red' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

