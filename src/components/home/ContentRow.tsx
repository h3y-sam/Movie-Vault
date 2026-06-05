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

  // Remove leading emojis/special characters from the title
  const cleanTitle = title.replace(/^[^a-zA-Z0-9]+/, '').trim();

  return (
    <section className="content-row-container mb-10 md:mb-14">
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 md:px-10 lg:px-16" style={{ paddingTop: '1.5rem', paddingBottom: '0.75rem' }}>
        <div className="flex items-center gap-2">
          <span className="text-[#8b5cf6] text-xs shrink-0 select-none">●</span>
          <h2 className="text-sm md:text-base font-extrabold text-white tracking-wider uppercase">{cleanTitle}</h2>
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs font-bold text-[#8b5cf6] hover:text-[#a78bfa] transition-colors flex items-center gap-0.5 group tracking-widest uppercase"
          >
            See All
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Scrollable Row */}
      <div className="relative group/row">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="row-arrow absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-[#0b0b0f] to-transparent flex items-center justify-start pl-3 hover:scale-105 transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-7 h-7 text-white/80" />
          </button>
        )}

        {/* Cards Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto hide-scrollbar px-6 md:px-10 lg:px-16 snap-x snap-mandatory"
          style={{ paddingTop: '0.5rem', paddingBottom: '0.75rem' }}
        >
          {familySafeItems.map((item, index) => (
            <MovieCard key={`${item.id}-${index}`} item={item} index={index} />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="row-arrow absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-[#0b0b0f] to-transparent flex items-center justify-end pr-3 hover:scale-105 transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-7 h-7 text-white/80" />
          </button>
        )}
      </div>
    </section>
  );
}
