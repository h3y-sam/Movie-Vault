'use client';

import Link from 'next/link';
import { Star, Play, Plus, Check } from 'lucide-react';
import { TMDBMovie, TMDBTVShow, MediaItem } from '@/types/tmdb.types';
import { getImageUrl } from '@/lib/tmdb';
import { getGenreNames, getYear } from '@/lib/mockData';
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
  const genres = getGenreNames(item.genre_ids).slice(0, 2);

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inList = isInWatchlist(item.id, mediaType);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) {
      removeItem(item.id, mediaType);
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
    }
  };

  return (
    <div
      className="movie-card group relative flex-shrink-0 w-[160px] md:w-[200px] lg:w-[220px] rounded-md overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link href={`/detail/${mediaType}/${item.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${title}`} />
      
      {/* Poster Image */}
      <div className="relative aspect-[2/3] bg-sv-card rounded-md overflow-hidden pointer-events-none">
        <img
          src={getImageUrl(item.poster_path, 'w342')}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/no-image.svg';
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto z-10 flex flex-col justify-end">
          <div className="p-3">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-2 relative z-20">
              <Link
                href={`/watch/${mediaType}/${item.id}`}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/80 transition-colors"
                aria-label={`Play ${title}`}
              >
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              </Link>
              <button
                onClick={toggleWatchlist}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  inList
                    ? 'border-sv-red bg-sv-red/20 text-sv-red'
                    : 'border-white/50 text-white/70 hover:border-white hover:text-white'
                }`}
                aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {/* Info */}
            <h3 className="text-white text-sm font-semibold line-clamp-1 mb-1">{title}</h3>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-sv-gold fill-sv-gold" />
                <span className="text-sv-gold font-medium">{item.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-white/50">{getYear(releaseDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {genres.map((g) => (
                <span key={g} className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Rating Badge (always visible) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs z-10 pointer-events-auto">
          <Star className="w-3 h-3 text-sv-gold fill-sv-gold" />
          <span className="text-white font-medium">{item.vote_average.toFixed(1)}</span>
        </div>
      </div>

      {/* Title below card (visible on mobile, hidden on hover-capable devices) */}
      <div className="mt-2 md:hidden relative z-10 pointer-events-none">
        <h3 className="text-sv-text text-xs font-medium line-clamp-1">{title}</h3>
        <span className="text-sv-text-dim text-[10px]">{getYear(releaseDate)}</span>
      </div>
    </div>
  );
}
