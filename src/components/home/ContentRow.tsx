'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/types/tmdb.types';
import MovieCard from '@/components/content/MovieCard';
import { useSettingsStore } from '@/store/settingsStore';

interface ContentRowProps {
  title: string;
  items: MediaItem[];
  seeAllHref?: string;
}

export default function ContentRow({ title, items, seeAllHref }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  if (!familySafeItems.length) return null;

  return (
    <section className="content-row-container mb-12 md:mb-16 lg:mb-20">
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 md:px-10 lg:px-16" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
        <h2 className="text-lg md:text-xl font-bold text-sv-text">{title}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm text-sv-text-secondary hover:text-sv-red transition-colors flex items-center gap-1 group"
          >
            See All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Scrollable Row */}
      <div className="relative group/row">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="row-arrow absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-sv-bg/80 to-transparent flex items-center justify-start pl-1 hover:from-sv-bg transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8 text-white/80" />
          </button>
        )}

        {/* Cards Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-6 md:px-10 lg:px-16 snap-x snap-mandatory"
          style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
        >
          {familySafeItems.map((item, index) => (
            <MovieCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="row-arrow absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-sv-bg/80 to-transparent flex items-center justify-end pr-1 hover:from-sv-bg transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8 text-white/80" />
          </button>
        )}
      </div>
    </section>
  );
}
