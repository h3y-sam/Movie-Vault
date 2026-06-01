'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/content/MovieCard';
import { MediaItem } from '@/types/tmdb.types';
import { tmdb } from '@/lib/tmdb';

export default function BollywoodPage() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await tmdb.getBollywood();
        setMovies(res.results);
      } catch (error) {
        console.error('Failed to fetch bollywood:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen" style={{ paddingTop: '112px' }}>
      <div className="sv-container mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Bollywood</h1>
        <p className="text-sv-text-secondary text-sm">
          The best of Indian cinema — from romance to action thrillers.
        </p>
      </div>

      <div className="sv-container">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-sv-red rounded-full"></div>
              <div className="w-3 h-3 bg-sv-red rounded-full"></div>
              <div className="w-3 h-3 bg-sv-red rounded-full"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((item, index) => (
              <MovieCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
