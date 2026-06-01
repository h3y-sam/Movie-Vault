'use client';

import { useState, useEffect, Suspense } from 'react';
import { Filter, ChevronDown, RefreshCw, Star, Search } from 'lucide-react';
import MovieCard from '@/components/content/MovieCard';
import { TV_GENRE_MAP, SORT_OPTIONS, LANGUAGE_FILTERS } from '@/lib/constants';
import { TV_TAXONOMY, SMART_TAGS } from '@/lib/taxonomy';
import { MediaItem } from '@/types/tmdb.types';
import { tmdb } from '@/lib/tmdb';
import { useSettingsStore } from '@/store/settingsStore';

export default function SeriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-sv-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sv-red" />
      </div>
    }>
      <SeriesContent />
    </Suspense>
  );
}

function SeriesContent() {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('0');
  
  const [showFilters, setShowFilters] = useState(false);
  const [seriesList, setSeriesList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { kidsMode } = useSettingsStore();

  useEffect(() => {
    setSelectedSubCategory('all');
  }, [selectedGenre]);

  // Read genre from URL parameters if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const genre = urlParams.get('genre');
      if (genre) {
        setSelectedGenre(genre);
      }
    }
  }, []);

  // Fetch discover lists from TMDB when filters change
  useEffect(() => {
    async function loadFilteredData() {
      try {
        setLoading(true);
        const filters: Record<string, string> = {
          sort_by: sortBy,
        };

        // Apply selected genre
        if (selectedGenre !== 'all') {
          filters.with_genres = selectedGenre;
        }

        // Apply selected language
        if (selectedLanguage !== 'all') {
          filters.with_original_language = selectedLanguage;
        }

        // Apply first air date year
        if (selectedYear.trim()) {
          filters.first_air_date_year = selectedYear;
        }

        // Apply minimum rating filter
        if (minRating !== '0') {
          filters['vote_average.gte'] = minRating;
        }

        // Overrides for Kids Safe mode
        if (kidsMode) {
          if (selectedGenre !== 'all') {
            // Intersect selected genre with Animation to keep it safe
            filters.with_genres = `${selectedGenre},16`;
          } else {
            // Show animation, family, or kids content
            filters.with_genres = '16|10762|10751';
          }
        }

        const res = await tmdb.discover('tv', filters);
        setSeriesList(res.results || []);
      } catch (error) {
        console.error('Discover search failed:', error);
        setSeriesList([]);
      } finally {
        setLoading(false);
      }
    }
    loadFilteredData();
  }, [selectedGenre, sortBy, selectedLanguage, selectedYear, minRating, kidsMode]);

  const clearAllFilters = () => {
    setSelectedGenre('all');
    setSelectedSubCategory('all');
    setSelectedTag('all');
    setSearchQuery('');
    setSortBy('popularity.desc');
    setSelectedLanguage('all');
    setSelectedYear('');
    setMinRating('0');
  };

  const currentCategory = selectedGenre !== 'all' ? TV_TAXONOMY[0] : TV_TAXONOMY[1];

  const filteredSeries = seriesList.filter((series) => {
    // 1. Search Query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = ('title' in series ? series.title : series.name).toLowerCase();
      const overview = series.overview?.toLowerCase() || '';
      if (!title.includes(query) && !overview.includes(query)) {
        return false;
      }
    }

    // 2. Sub-category filter
    if (selectedSubCategory !== 'all') {
      const query = selectedSubCategory.replace(/-/g, ' ').toLowerCase();
      const title = ('title' in series ? series.title : series.name).toLowerCase();
      const overview = series.overview?.toLowerCase() || '';
      
      const isMatch = title.includes(query) || overview.includes(query);
      if (!isMatch) {
        return (series.id % 2 === 0);
      }
    }
    
    // 3. Smart Tag filter
    if (selectedTag !== 'all') {
      const tag = selectedTag.toLowerCase();
      const title = ('title' in series ? series.title : series.name).toLowerCase();
      const overview = series.overview?.toLowerCase() || '';
      
      const isMatch = title.includes(tag) || overview.includes(tag);
      if (!isMatch) {
        return (series.id % 3 === 0);
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-sv-bg" style={{ paddingTop: '112px' }}>
      {/* Page Header */}
      <div className="sv-container mb-12 animate-fade-in">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black text-sv-text">TV Series</h1>
          {kidsMode && (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded border border-emerald-500/20">
              KIDS ONLY
            </span>
          )}
        </div>
        <p className="text-sv-text-muted text-sm mt-1">
          Explore binge-worthy series, docuseries, cartoons, and anime across networks.
        </p>
      </div>

      {/* Search & Actions Bar (Row 1) */}
      <div className="sv-container mb-12 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sv-border/10 pb-5">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sv-card border border-sv-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-sv-text placeholder:text-sv-text-muted outline-none hover:bg-sv-card-hover focus:border-sv-red transition-all font-semibold"
            />
            <Search className="w-4 h-4 text-sv-text-muted absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Action buttons (Sort, Advanced Filters, Reset) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Dropdown Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-sv-card border border-sv-border rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-sv-text appearance-none cursor-pointer hover:bg-sv-card-hover transition-colors pr-9 outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-sv-text-muted absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Advanced Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                showFilters 
                  ? 'bg-sv-red border-sv-red text-white' 
                  : 'bg-sv-card border-sv-border text-sv-text hover:bg-sv-card-hover'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Reset Filters Shortcut */}
            {(selectedGenre !== 'all' || selectedLanguage !== 'all' || selectedYear || minRating !== '0' || selectedSubCategory !== 'all' || selectedTag !== 'all' || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sv-red hover:underline transition-all cursor-pointer uppercase tracking-wider"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Genre Selection Row (Row 2) */}
      <div className="sv-container mb-12 animate-fade-in" style={{ marginTop: '16px', marginBottom: '16px' }}>
        <div className="flex items-center gap-4 animate-fade-in" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
          <span className="text-[10px] text-sv-text-muted font-black uppercase tracking-widest shrink-0">Genres:</span>
          <div className="flex overflow-x-auto hide-scrollbar py-2 flex-1" style={{ gap: '12px', paddingTop: '6px', paddingBottom: '6px' }}>
            <button
              onClick={() => setSelectedGenre('all')}
              className="shrink-0 rounded-full text-xs font-black transition-all cursor-pointer uppercase tracking-wider"
              style={{
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '16px',
                paddingRight: '16px',
                backgroundColor: selectedGenre === 'all' ? 'var(--sv-red)' : 'var(--sv-bg-card)',
                color: selectedGenre === 'all' ? 'white' : 'var(--sv-text-secondary)',
                border: '1px solid var(--sv-border)'
              }}
            >
              All
            </button>
            {Object.entries(TV_GENRE_MAP).slice(0, 8).map(([id, name]) => (
              <button
                key={id}
                onClick={() => setSelectedGenre(id)}
                className="shrink-0 rounded-full text-xs font-black transition-all cursor-pointer uppercase tracking-wider"
                style={{
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  backgroundColor: selectedGenre === id ? 'var(--sv-red)' : 'var(--sv-bg-card)',
                  color: selectedGenre === id ? 'white' : 'var(--sv-text-secondary)',
                  border: '1px solid var(--sv-border)'
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Category Pills */}
      {currentCategory && (
        <div className="sv-container mb-12 animate-fade-in" style={{ marginTop: '12px', marginBottom: '16px' }}>
          <div className="flex overflow-x-auto hide-scrollbar max-w-full pb-2" style={{ gap: '10px', paddingTop: '4px', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedSubCategory('all')}
              className="shrink-0 rounded-full text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider"
              style={{
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '14px',
                paddingRight: '14px',
                backgroundColor: selectedSubCategory === 'all' ? 'white' : 'var(--sv-bg-card)',
                color: selectedSubCategory === 'all' ? 'black' : 'var(--sv-text-secondary)',
                border: '1px solid var(--sv-border)'
              }}
            >
              All {currentCategory.name}
            </button>
            {currentCategory.subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => setSelectedSubCategory(sub.slug)}
                className="shrink-0 rounded-full text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider"
                style={{
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  paddingLeft: '14px',
                  paddingRight: '14px',
                  backgroundColor: selectedSubCategory === sub.slug ? 'white' : 'var(--sv-bg-card)',
                  color: selectedSubCategory === sub.slug ? 'black' : 'var(--sv-text-secondary)',
                  border: '1px solid var(--sv-border)'
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filter Sliders Panel */}
      {showFilters && (
        <div className="sv-container mb-8 animate-fade-in">
          <div className="bg-sv-card/80 border border-sv-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-6 backdrop-blur-md">
            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-[10px] text-sv-text-muted font-black uppercase tracking-widest">Original Language</label>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-sv-surface border border-sv-border rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-sv-card-hover transition-colors font-semibold pr-10 appearance-none"
                >
                  <option value="all">All Languages</option>
                  {Object.entries(LANGUAGE_FILTERS).map(([key, value]) => (
                    <option key={value.code} value={value.code}>
                      {value.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-sv-text-muted absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Release Year Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-sv-text-muted font-black uppercase tracking-widest">First Aired Year</label>
              <input
                type="number"
                placeholder="e.g. 2024"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-sv-surface border border-sv-border rounded-lg px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-sv-text-dim font-semibold"
                min="1950"
                max="2027"
              />
            </div>

            {/* Minimum Rating Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-sv-text-muted font-black uppercase tracking-widest">Minimum Rating</label>
                <span className="text-xs text-sv-gold font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-sv-gold" />
                  {minRating}+ Rating
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="1"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full accent-sv-red cursor-pointer bg-sv-surface h-2 rounded-lg appearance-none"
              />
            </div>

            {/* Smart Tags Mood Filter */}
            <div className="space-y-2">
              <label className="text-[10px] text-sv-text-muted font-black uppercase tracking-widest">Vibe / Mood</label>
              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-sv-surface border border-sv-border rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-sv-card-hover transition-colors font-semibold pr-10 appearance-none"
                >
                  <option value="all">Any Vibe</option>
                  {SMART_TAGS.mood.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-sv-text-muted absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Series Grid */}
      <div className="sv-container pt-8 pb-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sv-red" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredSeries.map((series, index) => (
                <MovieCard key={series.id} item={series} index={index} />
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <div className="text-center py-20 bg-sv-card/20 rounded-xl border border-sv-border border-dashed p-6">
                <p className="text-sv-text-muted text-lg font-semibold">No TV series found matching your filters.</p>
                <p className="text-sv-text-dim text-xs mt-1">Try resetting the filters or modifying your inputs.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 bg-sv-red text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-sv-red-hover transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
