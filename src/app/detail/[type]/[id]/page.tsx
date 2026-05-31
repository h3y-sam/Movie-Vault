'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, Check, Star, Clock, Calendar, Globe, ArrowLeft, Share2 } from 'lucide-react';
import { getImageUrl, getBackdropUrl, tmdb } from '@/lib/tmdb';
import { getYear } from '@/lib/mockData';
import ContentRow from '@/components/home/ContentRow';
import { useWatchlistStore } from '@/store/watchlistStore';
import { MediaItem } from '@/types/tmdb.types';

interface DetailPageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function DetailPage({ params }: DetailPageProps) {
  const resolvedParams = use(params);
  const { type, id } = resolvedParams;
  const numericId = parseInt(id);

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (type === 'movie') {
          const res = await tmdb.getMovieDetail(numericId);
          setItem(res);
        } else {
          const res = await tmdb.getTVDetail(numericId);
          setItem(res);
        }
      } catch (err) {
        console.error('Failed to fetch detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type, numericId]);

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex gap-2">
          <div className="w-3 h-3 bg-sv-red rounded-full"></div>
          <div className="w-3 h-3 bg-sv-red rounded-full"></div>
          <div className="w-3 h-3 bg-sv-red rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Content not found</h1>
          <p className="text-sv-text-secondary mb-4">
            We couldn't find details for this title.
          </p>
          <Link href="/" className="text-sv-red hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const title = type === 'movie' ? item.title : item.name;
  const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
  const mediaType = type as 'movie' | 'tv';
  const inList = isInWatchlist(item.id, mediaType);

  const toggleWatchlist = () => {
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

  const genres = item.genres?.map((g: any) => g.name) || [];
  const similar: MediaItem[] = item.similar?.results || [];
  const cast = item.credits?.cast?.slice(0, 10) || [];
  
  // Find a YouTube trailer
  const trailer = item.videos?.results?.find(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  return (
    <div className="min-h-screen">
      {/* Backdrop Hero */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getBackdropUrl(item.backdrop_path, 'original')})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sv-bg via-sv-bg/60 to-sv-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-sv-bg/90 via-sv-bg/30 to-transparent" />

        <button
          onClick={() => window.history.back()}
          className="absolute top-20 md:top-24 left-4 md:left-8 lg:left-12 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="relative -mt-40 md:-mt-56 z-10 px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl">
          {/* Poster */}
          <div className="hidden md:block flex-shrink-0">
            <div className="w-[250px] lg:w-[300px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img
                src={getImageUrl(item.poster_path, 'w500')}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/no-image.svg';
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black mb-1 text-shadow-hero">{title}</h1>
            {item.tagline && (
              <p className="text-lg text-sv-text-muted italic mb-4">{item.tagline}</p>
            )}

            {/* Meta Row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-sv-gold/20 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-sv-gold fill-sv-gold" />
                <span className="text-sv-gold text-sm font-bold">
                  {item.vote_average?.toFixed(1) || 'NR'}
                </span>
                <span className="text-sv-text-dim text-xs">/ 10</span>
              </div>

              {releaseDate && (
                <div className="flex items-center gap-1.5 text-sv-text-secondary text-sm">
                  <Calendar className="w-4 h-4" />
                  {getYear(releaseDate)}
                </div>
              )}

              {type === 'movie' && item.runtime > 0 && (
                <div className="flex items-center gap-1.5 text-sv-text-secondary text-sm">
                  <Clock className="w-4 h-4" />
                  {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
                </div>
              )}

              {type === 'tv' && item.number_of_seasons && (
                <div className="flex items-center gap-1.5 text-sv-text-secondary text-sm">
                  <Globe className="w-4 h-4" />
                  {item.number_of_seasons} Seasons
                </div>
              )}

              {item.original_language && (
                <span className="px-2 py-0.5 border border-sv-text-muted text-sv-text-muted text-xs rounded uppercase">
                  {item.original_language}
                </span>
              )}
            </div>

            {/* Genre Tags */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {genres.map((g: string) => (
                <span
                  key={g}
                  className="px-3 py-1 bg-white/10 rounded-full text-sm text-sv-text-secondary hover:bg-white/15 transition-colors cursor-pointer"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <Link
                href={`/watch/${mediaType}/${item.id}`}
                className="flex items-center gap-2 bg-sv-red hover:bg-sv-red-hover text-white px-8 py-3 rounded-lg font-semibold text-base transition-all active:scale-95 shadow-lg shadow-sv-red/20"
              >
                <Play className="w-5 h-5 fill-white" />
                Play Now
              </Link>
              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base transition-all active:scale-95 ${
                  inList
                    ? 'bg-white/20 text-sv-red border border-sv-red/30'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                {inList ? (
                  <>
                    <Check className="w-5 h-5" /> In My List
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> My List
                  </>
                )}
              </button>
              <button
                className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-sv-text-secondary hover:text-white hover:bg-white/20 transition-all"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Overview */}
            {item.overview && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-sv-text-secondary leading-relaxed max-w-2xl">
                  {item.overview}
                </p>
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Cast</h3>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {cast.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex-shrink-0 w-24 text-center"
                    >
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-sv-card mb-2 ring-2 ring-sv-border">
                        <img
                          src={getImageUrl(member.profile_path, 'w185')}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/no-image.svg';
                          }}
                        />
                      </div>
                      <p className="text-xs font-medium text-sv-text line-clamp-1">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-sv-text-muted line-clamp-1">
                        {member.character}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trailer */}
            {trailer && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Trailer</h3>
                <div className="relative aspect-video max-w-2xl rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-white/10">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?modestbranding=1&rel=0`}
                    title="YouTube video player"
                    className="absolute top-0 left-0 w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Content */}
      {similar.length > 0 && (
        <div className="mt-12">
          <ContentRow
            title="More Like This"
            items={similar}
          />
        </div>
      )}
    </div>
  );
}
