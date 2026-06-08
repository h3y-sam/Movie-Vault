'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Play, Plus, Check } from 'lucide-react';
import { TMDBMovie, TMDBTVShow, MediaItem } from '@/types/tmdb.types';
import { getImageUrl } from '@/lib/tmdb';
import { getYear } from '@/lib/mockData';
import { useWatchlistStore } from '@/store/watchlistStore';

interface MovieCardProps {
  item: MediaItem;
  index?: number;
}

export default function MovieCard({ item, index = 0 }: MovieCardProps) {
  const isMovie = 'title' in item;
  const title = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
  const mediaType = isMovie ? 'movie' : 'tv';
  const releaseDate = isMovie
    ? (item as TMDBMovie).release_date
    : (item as TMDBTVShow).first_air_date;

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inList = isInWatchlist(item.id, mediaType);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  useEffect(() => {
    const handleProgressCheck = () => {
      try {
        const historyStr = localStorage.getItem('streamvault-watch-history');
        if (historyStr) {
          const history = JSON.parse(historyStr);
          const historyItem = history.find(
            (h: any) => h.id === item.id && h.type === mediaType
          );
          if (historyItem?.progress?.percent) {
            setProgressPercent(historyItem.progress.percent);
          } else {
            setProgressPercent(0);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    handleProgressCheck();

    window.addEventListener('storage', handleProgressCheck);
    return () => window.removeEventListener('storage', handleProgressCheck);
  }, [item.id, mediaType]);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) {
      removeItem(item.id, mediaType);
      setToastMessage('Removed from My List ✗');
      setTimeout(() => setToastMessage(null), 2500);
    } else {
      addItem({
        tmdbId: item.id,
        mediaType,
        title,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        voteAverage: item.vote_average,
        addedAt: new Date().toISOString(),
      });
      setToastMessage('Added to My List ✓');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const isHindiAvailable = (mediaItem: MediaItem) => {
    if (mediaItem.original_language === 'hi') return true;
    if ('origin_country' in mediaItem && mediaItem.origin_country?.includes('IN')) return true;
    
    const genres = mediaItem.genre_ids || [];
    const hasActionOrSciFiOrAnimation = genres.some((id) => [28, 12, 878, 16].includes(id));
    if (hasActionOrSciFiOrAnimation && mediaItem.popularity > 25) return true;

    return false;
  };

  const hasHindi = isHindiAvailable(item);

  return (
    <div
      className="movie-card group relative flex-shrink-0 w-[148px] sm:w-[152px] md:w-[160px] lg:w-[180px] rounded-xl overflow-hidden cursor-pointer shadow-md bg-[#13131a]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link href={`/watch/${mediaType}/${item.id}?play=true`} className="absolute inset-0 z-30" aria-label={`Play ${title}`} />
      
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={getImageUrl(item.poster_path, 'w342')}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/no-image.svg';
          }}
        />

        {/* Top Badges Container (always visible) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-sv-gold">
            <Star className="w-3 h-3 text-sv-gold fill-sv-gold" />
            <span>{item.vote_average.toFixed(1)}</span>
          </div>
          {hasHindi && (
            <div className="bg-[#e11d48]/90 backdrop-blur-md text-white text-[8px] font-black px-1.5 py-0.5 rounded-md tracking-wider">
              HINDI
            </div>
          )}
        </div>

        {/* Top Right Watchlist Button (shows on card hover, or always if in watchlist) */}
        <button
          onClick={toggleWatchlist}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-300 z-40 cursor-pointer ${
            inList
              ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white opacity-100'
              : 'bg-black/40 border-white/10 text-white hover:bg-white hover:text-black hover:border-white opacity-0 group-hover:opacity-100'
          }`}
          aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Center Hover Play Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4.5 h-4.5 text-black fill-black ml-0.5" />
          </div>
        </div>

        {/* Bottom Title & Details (always visible with gradient) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent z-15 flex flex-col justify-end p-3 pointer-events-none">
          <h3 className="text-white text-xs font-bold line-clamp-1 leading-snug">{title}</h3>
          <p className="text-[#9ca3af] text-[10px] font-medium mt-0.5">{getYear(releaseDate)}</p>
        </div>

        {/* Continue Watching Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <div 
              className="h-full bg-sv-red transition-all duration-300" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        )}
      </div>

      {/* Watchlist Toast Message (fixed at window level, outside relative box overflow) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e0e12]/95 border border-[#8b5cf6]/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-in-right backdrop-blur-md text-xs font-bold">
          <span className="text-[#8b5cf6] font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
