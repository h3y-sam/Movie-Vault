'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem, TMDBMovie, TMDBTVShow } from '@/types/tmdb.types';
import { getImageUrl } from '@/lib/tmdb';
import { useSettingsStore } from '@/store/settingsStore';

interface TopTenRowProps {
  title: string;
  items: MediaItem[];
}

export default function TopTenRow({ title, items }: TopTenRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { kidsMode } = useSettingsStore();

  const familySafeItems = kidsMode
    ? items.filter((item) =>
        item.genre_ids?.some((id) => id === 16 || id === 10751 || id === 10762)
      )
    : items;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!familySafeItems.length) return null;

  return (
    <section className="content-row-container mb-8 md:mb-10">
      <div className="px-4 md:px-8 lg:px-12 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-sv-text">{title}</h2>
      </div>

      <div className="relative group/row">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="row-arrow absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-sv-bg/80 to-transparent flex items-center justify-start pl-1"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 text-white/80" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-8 lg:px-12 pb-4 snap-x"
        >
          {familySafeItems.slice(0, 10).map((item, index) => {
            const isMovie = 'title' in item;
            const mediaType = isMovie ? 'movie' : 'tv';
            const itemTitle = isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name;

            return (
              <Link
                key={item.id}
                href={`/detail/${mediaType}/${item.id}`}
                className="flex-shrink-0 flex items-end group relative"
              >
                {/* Large Number */}
                <span className="top-ten-number select-none relative -mr-4 md:-mr-6 z-0">
                  {index + 1}
                </span>

                {/* Poster */}
                <div className="relative w-[120px] md:w-[150px] aspect-[2/3] rounded-md overflow-hidden z-10 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={getImageUrl(item.poster_path, 'w342')}
                    alt={itemTitle}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/no-image.svg';
                    }}
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-md" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="row-arrow absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-sv-bg/80 to-transparent flex items-center justify-end pr-1"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 text-white/80" />
        </button>
      </div>
    </section>
  );
}
