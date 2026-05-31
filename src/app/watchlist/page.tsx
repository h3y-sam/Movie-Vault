'use client';

import Link from 'next/link';
import { Bookmark, Trash2, Play, Star } from 'lucide-react';
import { useWatchlistStore } from '@/store/watchlistStore';
import { getImageUrl } from '@/lib/tmdb';
import { getYear } from '@/lib/mockData';

export default function WatchlistPage() {
  const { items, removeItem } = useWatchlistStore();

  return (
    <div className="min-h-screen" style={{ paddingTop: '112px' }}>
      <div className="px-4 md:px-8 lg:px-12 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-7 h-7 text-sv-red" />
          <h1 className="text-3xl md:text-4xl font-bold">My List</h1>
        </div>
        <p className="text-sv-text-secondary text-sm">
          {items.length} {items.length === 1 ? 'title' : 'titles'} saved
        </p>
      </div>

      <div className="px-4 md:px-8 lg:px-12">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={`${item.mediaType}-${item.tmdbId}`}
                className="group bg-sv-card rounded-xl overflow-hidden border border-sv-border hover:border-sv-border-hover transition-all"
              >
                <div className="flex gap-4 p-4">
                  {/* Poster */}
                  <Link
                    href={`/detail/${item.mediaType}/${item.tmdbId}`}
                    className="flex-shrink-0 w-20 aspect-[2/3] rounded-lg overflow-hidden bg-sv-surface"
                  >
                    <img
                      src={getImageUrl(item.posterPath, 'w185')}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/no-image.svg';
                      }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/detail/${item.mediaType}/${item.tmdbId}`}
                      className="text-sm font-semibold hover:text-sv-red transition-colors line-clamp-2 mb-1"
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center gap-2 mb-3 text-xs text-sv-text-muted">
                      <span className="uppercase bg-sv-surface px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                      </span>
                      {item.voteAverage && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-sv-gold fill-sv-gold" />
                          <span>{item.voteAverage.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/watch/${item.mediaType}/${item.tmdbId}`}
                        className="flex items-center gap-1.5 bg-sv-red hover:bg-sv-red-hover text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Play
                      </Link>
                      <button
                        onClick={() => removeItem(item.tmdbId, item.mediaType)}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500/20 text-sv-text-muted hover:text-red-400 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                        aria-label={`Remove ${item.title} from watchlist`}
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sv-card flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-sv-text-dim" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your list is empty</h2>
            <p className="text-sv-text-muted mb-6 max-w-md mx-auto">
              Browse movies and shows, then click the + button to add them to your watchlist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-sv-red hover:bg-sv-red-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
