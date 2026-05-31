'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';

interface HistoryItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season?: number;
  episode?: number;
  watchedAt: string;
  progress?: {
    currentTime: number;
    duration: number;
    percent: number;
  };
}

export default function ContinueWatchingRow() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      const historyStr = localStorage.getItem('streamvault-watch-history') || '[]';
      try {
        setHistory(JSON.parse(historyStr));
      } catch (e) {
        console.error(e);
      }
    };
    loadHistory();

    // Listen for storage changes
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const removeItem = (e: React.MouseEvent, id: number, type: 'movie' | 'tv') => {
    e.preventDefault();
    e.stopPropagation();
    const updated = history.filter((h) => !(h.id === id && h.type === type));
    setHistory(updated);
    localStorage.setItem('streamvault-watch-history', JSON.stringify(updated));
  };

  if (history.length === 0) return null;

  return (
    <section className="mb-8 md:mb-10 px-4 md:px-8 lg:px-12 animate-fade-in">
      <h2 className="text-lg md:text-xl font-bold text-sv-text mb-4">🍿 Continue Watching</h2>
      
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x">
        {history.map((item) => {
          const watchUrl = item.type === 'movie' 
            ? `/watch/movie/${item.id}`
            : `/watch/tv/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`;

          const displaySubtitle = item.type === 'movie' 
            ? 'Movie' 
            : `S${item.season} E${item.episode}`;

          return (
            <div 
              key={`${item.type}-${item.id}`}
              className="flex-shrink-0 w-[200px] md:w-[240px] bg-sv-card rounded-lg overflow-hidden border border-sv-border hover:border-sv-border-hover group relative transition-all snap-start"
            >
              {/* Thumbnail / Backdrop */}
              <div className="relative aspect-video bg-sv-surface overflow-hidden">
                <img 
                  src={getImageUrl(item.backdropPath || item.posterPath, 'w300')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Play Button Overlay */}
                <Link 
                  href={watchUrl}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-10"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={(e) => removeItem(e, item.id, item.type)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600/80 text-white/80 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Decorative Premium Progress Bar */}
                {item.progress && item.progress.percent > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div 
                      className="h-full bg-sv-red transition-all duration-300" 
                      style={{ width: `${item.progress.percent}%` }} 
                    />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="p-3">
                <Link href={watchUrl} className="block hover:text-sv-red transition-colors">
                  <h3 className="text-sm font-semibold truncate text-white">{item.title}</h3>
                </Link>
                <p className="text-xs text-sv-text-muted mt-0.5 font-medium">{displaySubtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
