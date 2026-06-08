'use client';

import { useState, useEffect, use } from 'react';
import { Search as SearchIcon, ArrowUpDown } from 'lucide-react';
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
  
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv' | 'anime'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'year'>('relevance');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const { kidsMode } = useSettingsStore();

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    async function loadData() {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        const res = await tmdb.search(query, page);
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

        if (page === 1) {
          setResults(filtered);
        } else {
          setResults((prev) => [...prev, ...filtered]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        if (page === 1) {
          setResults([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    loadData();
  }, [query, page, kidsMode]);

  const movies = results.filter((item: any) => item.media_type === 'movie');
  const tvShows = results.filter((item: any) => item.media_type === 'tv');
  // Anime: has animation genre (16) and is from Japan (original_language === 'ja')
  const anime = results.filter((item: any) => item.genre_ids?.includes(16) && item.original_language === 'ja');

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'movies': return movies;
      case 'tv': return tvShows;
      case 'anime': return anime;
      default: return results;
    }
  };

  const getSortedItems = (items: MediaItem[]) => {
    const itemsCopy = [...items];
    if (sortBy === 'rating') {
      return itemsCopy.sort((a, b) => b.vote_average - a.vote_average);
    }
    if (sortBy === 'year') {
      return itemsCopy.sort((a, b) => {
        const dateA = 'release_date' in a ? a.release_date : a.first_air_date;
        const dateB = 'release_date' in b ? b.release_date : b.first_air_date;
        const yearA = dateA ? new Date(dateA).getFullYear() : 0;
        const yearB = dateB ? new Date(dateB).getFullYear() : 0;
        return yearB - yearA;
      });
    }
    return itemsCopy; // relevance / default
  };

  const displayItems = getSortedItems(getFilteredItems());

  return (
    <div className="min-h-screen" style={{ paddingTop: '112px' }}>
      <div className="sv-container mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Search</h1>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sv-border pb-1">
          {/* Tabs */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'border-sv-red text-white'
                  : 'border-transparent text-sv-text-muted hover:text-white'
              }`}
            >
              All Results ({results.length})
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'movies'
                  ? 'border-sv-red text-white'
                  : 'border-transparent text-sv-text-muted hover:text-white'
              }`}
            >
              Movies ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'tv'
                  ? 'border-sv-red text-white'
                  : 'border-transparent text-sv-text-muted hover:text-white'
              }`}
            >
              TV Shows ({tvShows.length})
            </button>
            <button
              onClick={() => setActiveTab('anime')}
              className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === 'anime'
                  ? 'border-sv-red text-white'
                  : 'border-transparent text-sv-text-muted hover:text-white'
              }`}
            >
              Anime ({anime.length})
            </button>
          </div>

          {/* Sort Dropdown */}
          {results.length > 0 && (
            <div className="flex items-center gap-2 mb-3 md:mb-0">
              <ArrowUpDown className="w-4 h-4 text-sv-text-muted" />
              <span className="text-xs text-sv-text-muted font-bold uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#13131a] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer hover:bg-[#1c1c28] transition-all font-bold"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="year">Year</option>
              </select>
            </div>
          )}
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayItems.map((item, index) => (
                <MovieCard key={item.id} item={item} index={index} />
              ))}
            </div>

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
          </>
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
