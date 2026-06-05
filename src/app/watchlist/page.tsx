'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useWatchlistStore } from '@/store/watchlistStore';
import MovieCard from '@/components/content/MovieCard';

export default function WatchlistPage() {
  const { items } = useWatchlistStore();

  return (
    <div className="min-h-screen bg-[#0b0b0f] pb-16" style={{ paddingTop: '96px' }}>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">My Lists</h1>
            <p className="text-[#9ca3af] text-sm mt-1">Saved titles to watch later.</p>
          </div>
          <button className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] hover:from-[#a78bfa] hover:to-pink-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-[#8b5cf6]/20 transition-all shrink-0 cursor-pointer">
            + Create Watchlist
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-4">
          <button className="bg-[#8b5cf6] text-white text-xs font-bold px-4.5 py-1.5 rounded-full cursor-pointer">
            Default List ({items.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
            {items.map((item, index) => {
              // Map WatchlistItem to TMDB MediaItem format for MovieCard
              const mediaItem = {
                id: item.tmdbId,
                poster_path: item.posterPath,
                backdrop_path: item.backdropPath || '',
                vote_average: item.voteAverage || 0,
                genre_ids: [],
                overview: '',
                ...(item.mediaType === 'movie' ? { title: item.title } : { name: item.title })
              };

              return <MovieCard key={`${item.mediaType}-${item.tmdbId}`} item={mediaItem as any} index={index} />;
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-[#13131a]/40 rounded-xl border border-white/5 border-dashed p-8 max-w-lg mx-auto animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#13131a] flex items-center justify-center border border-white/5">
              <Bookmark className="w-6 h-6 text-[#6b7280]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">This list is empty</h2>
            <p className="text-[#9ca3af] text-xs mb-6 max-w-xs mx-auto">
              No items added to your default watchlist yet. Explore our movies and series to add them!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/movies"
                className="bg-[#8b5cf6] hover:bg-[#a78bfa] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Browse Movies
              </Link>
              <Link
                href="/series"
                className="bg-transparent border border-white/10 hover:border-white/20 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Browse TV Shows
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
