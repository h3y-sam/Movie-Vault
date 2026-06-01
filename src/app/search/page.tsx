'use client';

import { useState, useEffect, use } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import MovieCard from '@/components/content/MovieCard';
import { tmdb } from '@/lib/tmdb';
import { MediaItem } from '@/types/tmdb.types';
import { useSettingsStore } from '@/store/settingsStore';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = use(searchParams);
  const query = resolvedParams.q || '';
  
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv'>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { kidsMode } = useSettingsStore();

  useEffect(() => {
    async function loadData() {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const res = await tmdb.search(query);
        // Filter out people or other media types if necessary
        const filtered = res.results.filter(
          (item: any) => {
            const isCorrectType = item.media_type === 'movie' || item.media_type === 'tv';
            if (!isCorrectType) return false;

            if (kidsMode) {
              return item.genre_ids?.some((id: number) => id === 16 || id === 10751 || id === 10762);
            }
            return true;
          }
        );
        setResults(filtered);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query]);

  const movies = results.filter((item: any) => item.media_type === 'movie');
  const tvShows = results.filter((item: any) => item.media_type === 'tv');

  const displayItems =
    activeTab === 'movies' ? movies : activeTab === 'tv' ? tvShows : results;

  return (
    <div className="min-h-screen" style={{ paddingTop: '112px' }}>
      <div className="sv-container mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Search</h1>

        <div className="flex gap-4 border-b border-sv-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-sv-red text-white'
                : 'border-transparent text-sv-text-muted hover:text-white'
            }`}
          >
            All Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'movies'
                ? 'border-sv-red text-white'
                : 'border-transparent text-sv-text-muted hover:text-white'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'tv'
                ? 'border-sv-red text-white'
                : 'border-transparent text-sv-text-muted hover:text-white'
            }`}
          >
            TV Shows ({tvShows.length})
          </button>
        </div>
      </div>

      <div className="sv-container">
        {!query ? (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-sv-text-muted mx-auto mb-4" />
            <p className="text-sv-text-secondary text-lg">
              Type something in the search bar to find movies and TV shows.
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-sv-red rounded-full"></div>
              <div className="w-3 h-3 bg-sv-red rounded-full"></div>
              <div className="w-3 h-3 bg-sv-red rounded-full"></div>
            </div>
          </div>
        ) : displayItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {displayItems.map((item, index) => (
              <MovieCard key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-sv-text-muted text-lg">
              No results found for "{query}".
            </p>
            <p className="text-sv-text-dim text-sm mt-2">
              Try checking your spelling or using more general terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
