'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/content/MovieCard';
import { MediaItem } from '@/types/tmdb.types';
import { tmdb } from '@/lib/tmdb';

export default function BollywoodPage() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        const res = await tmdb.getBollywood(page);
        if (page === 1) {
          setMovies(res.results);
        } else {
          setMovies((prev) => [...prev, ...res.results]);
        }
      } catch (error) {
        console.error('Failed to fetch bollywood:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    
    loadData();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0b0b0f] pb-16" style={{ paddingTop: '96px' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 animate-fade-in">Bollywood</h1>
        <p className="text-[#9ca3af] text-sm max-w-xl animate-fade-in">
          The best of Indian cinema — from romance to action thrillers.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8b5cf6]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
              {movies.map((item, index) => (
                <MovieCard key={`bollywood-${item.id}-${index}`} item={item} index={index} />
              ))}
            </div>

            {movies.length > 0 && (
              <div className="flex items-center justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading || loadingMore}
                  className="px-8 py-3 rounded-xl bg-sv-red hover:bg-sv-red-hover text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2 hover:scale-[1.03] active:scale-95 shadow-lg shadow-sv-red/10"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
