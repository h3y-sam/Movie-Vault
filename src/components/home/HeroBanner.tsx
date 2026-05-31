'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TMDBMovie, TMDBTVShow, MediaItem } from '@/types/tmdb.types';
import { getBackdropUrl } from '@/lib/tmdb';
import { getGenreNames, getYear } from '@/lib/mockData';
import { useSettingsStore } from '@/store/settingsStore';

interface HeroBannerProps {
  items: MediaItem[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { kidsMode } = useSettingsStore();

  const familySafeItems = kidsMode
    ? items.filter((item) =>
        item.genre_ids?.some((id) => id === 16 || id === 10751 || id === 10762)
      )
    : items;

  // Auto reset index if items change or kidsMode changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [kidsMode]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || familySafeItems.length === 0) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning, familySafeItems.length]
  );

  const nextSlide = useCallback(() => {
    if (familySafeItems.length === 0) return;
    goToSlide((currentIndex + 1) % familySafeItems.length);
  }, [currentIndex, familySafeItems.length, goToSlide]);

  const prevSlide = useCallback(() => {
    if (familySafeItems.length === 0) return;
    goToSlide((currentIndex - 1 + familySafeItems.length) % familySafeItems.length);
  }, [currentIndex, familySafeItems.length, goToSlide]);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!familySafeItems.length) return null;

  const current = familySafeItems[currentIndex];
  const title = 'title' in current ? current.title : current.name;
  const mediaType = 'title' in current ? 'movie' : 'tv';
  const releaseDate = 'release_date' in current ? current.release_date : current.first_air_date;
  const genres = getGenreNames(current.genre_ids).slice(0, 3);

  return (
    <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden" id="hero-banner">
      {/* Background Images */}
      {familySafeItems.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getBackdropUrl(item.backdrop_path, 'original')})`,
            }}
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 gradient-hero-left" />
      <div className="absolute inset-0 bg-gradient-to-r from-sv-bg/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end md:items-center">
        <div
          className="px-4 md:px-8 lg:px-12 pb-32 md:pb-0 w-full max-w-3xl animate-fade-in-up"
          key={currentIndex}
        >
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 text-shadow-hero">
            {title}
          </h1>

          {/* Meta Row */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-sv-gold/20 px-2.5 py-1 rounded-full">
              <Star className="w-4 h-4 text-sv-gold fill-sv-gold" />
              <span className="text-sv-gold text-sm font-bold">
                {current.vote_average.toFixed(1)}
              </span>
            </div>
            <span className="text-sv-text-secondary text-sm">{getYear(releaseDate)}</span>
            <span className="text-sv-text-dim text-xs">•</span>
            {genres.map((genre) => (
              <span
                key={genre}
                className="text-sv-text-secondary text-sm bg-white/10 px-2.5 py-0.5 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-sv-text-secondary text-sm md:text-base leading-relaxed mb-6 line-clamp-3 max-w-xl">
            {current.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href={`/watch/${mediaType}/${current.id}`}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-md font-semibold text-base hover:bg-white/85 transition-all duration-200 active:scale-95 animate-pulse-glow"
            >
              <Play className="w-5 h-5 fill-black" />
              Play
            </Link>
            <Link
              href={`/detail/${mediaType}/${current.id}`}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-md font-semibold text-base hover:bg-white/30 transition-all duration-200 active:scale-95"
            >
              <Info className="w-5 h-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all opacity-0 md:opacity-100 hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all opacity-0 md:opacity-100 hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {familySafeItems.slice(0, 6).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-355 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 bg-sv-red'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
