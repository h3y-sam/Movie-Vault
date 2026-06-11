'use client';

import { useState, useEffect, Suspense } from 'react';
import { Filter, ChevronDown, RefreshCw, Star, Search } from 'lucide-react';
import MovieCard from '@/components/content/MovieCard';
import { GENRE_MAP, SORT_OPTIONS, LANGUAGE_FILTERS } from '@/lib/constants';
import { MOVIES_TAXONOMY, SMART_TAGS } from '@/lib/taxonomy';
import { MediaItem } from '@/types/tmdb.types';
import { tmdb } from '@/lib/tmdb';
import { useSettingsStore } from '@/store/settingsStore';

export default function MoviesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b5cf6]" />
      </div>
    }>
      <MoviesContent />
    </Suspense>
  );
}

function MoviesContent() {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('0');
  const [page, setPage] = useState(1);
  
  const [showFilters, setShowFilters] = useState(false);
  const [moviesList, setMoviesList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { kidsMode } = useSettingsStore();

  useEffect(() => {
    setSelectedSubCategory('all');
  }, [selectedGenre]);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedGenre, sortBy, selectedLanguage, selectedYear, minRating, kidsMode]);

  // Read genre from URL parameters if available (for Mood Vibe Selector redirect)
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
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        const filters: Record<string, string> = {
          sort_by: sortBy,
          page: page.toString(),
        };

        // Apply selected genre
        if (selectedGenre !== 'all') {
          filters.with_genres = selectedGenre;
        }

        // Apply selected language
        if (selectedLanguage !== 'all') {
          filters.with_original_language = selectedLanguage;
        }

        // Apply release year
        if (selectedYear.trim()) {
          filters.primary_release_year = selectedYear;
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
            // Show any animation, family, or kids content
            filters.with_genres = '16|10751|10762';
          }
        }

        const res = await tmdb.discover('movie', filters);
        if (page === 1) {
          setMoviesList(res.results || []);
        } else {
          setMoviesList((prev) => [...prev, ...(res.results || [])]);
        }
      } catch (error) {
        console.error('Discover search failed:', error);
        if (page === 1) {
          setMoviesList([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    loadFilteredData();
  }, [selectedGenre, sortBy, selectedLanguage, selectedYear, minRating, kidsMode, page]);

  const clearAllFilters = () => {
    setSelectedGenre('all');
    setSelectedSubCategory('all');
    setSelectedTag('all');
    setSearchQuery('');
    setSortBy('popularity.desc');
    setSelectedLanguage('all');
    setSelectedYear('');
    setMinRating('0');
    setPage(1);
  };

  const currentCategory = MOVIES_TAXONOMY.find((cat) => {
    if (selectedGenre === '28') return cat.slug === 'action-adventure';
    if (selectedGenre === '35') return cat.slug === 'comedies';
    if (selectedGenre === '18') return cat.slug === 'dramas';
    if (selectedGenre === '27') return cat.slug === 'horror';
    if (selectedGenre === '878') return cat.slug === 'sci-fi-fantasy';
    if (selectedGenre === '10749') return cat.slug === 'romance';
    if (selectedGenre === '53') return cat.slug === 'thriller-mystery';
    if (selectedGenre === '99') return cat.slug === 'documentaries';
    if (selectedGenre === '10751') return cat.slug === 'family';
    return false;
  });

  const filteredMovies = moviesList.filter((movie) => {
    // 1. Search Query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = ('title' in movie ? movie.title : movie.name).toLowerCase();
      const overview = movie.overview?.toLowerCase() || '';
      if (!title.includes(query) && !overview.includes(query)) {
        return false;
      }
    }

    // 2. Sub-category filter
    if (selectedSubCategory !== 'all') {
      const query = selectedSubCategory.replace(/-/g, ' ').toLowerCase();
      const title = ('title' in movie ? movie.title : movie.name).toLowerCase();
      const overview = movie.overview?.toLowerCase() || '';
      
      const isMatch = title.includes(query) || overview.includes(query);
      if (!isMatch) {
        return (movie.id % 2 === 0);
      }
    }
    
    // 3. Smart Tag filter
    if (selectedTag !== 'all') {
      const tag = selectedTag.toLowerCase();
      const title = ('title' in movie ? movie.title : movie.name).toLowerCase();
      const overview = movie.overview?.toLowerCase() || '';
      
      const isMatch = title.includes(tag) || overview.includes(tag);
      if (!isMatch) {
        return (movie.id % 3 === 0);
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0b0b0f] pb-16" style={{ paddingTop: '96px' }}>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-10 animate-fade-in">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Movies</h1>
          {kidsMode && (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded leading-none">
              KIDS ONLY
            </span>
          )}
        </div>
        <p className="text-[#9ca3af] text-sm mt-1.5 max-w-xl">
          Explore Hollywood blockbusters, independent gems, and international cinema.
        </p>
      </div>

      {/* Search & Actions Bar (Row 1) */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#13131a] border border-white/5 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none hover:bg-[#1c1c28] focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/50 transition-all font-semibold"
            />
            <Search className="w-3.5 h-3.5 text-[#6b7280] absolute left-4 top-2.5 pointer-events-none" />
          </div>

          {/* Action buttons (Sort, Advanced Filters, Reset) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Dropdown Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#13131a] border border-white/5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-white appearance-none cursor-pointer hover:bg-[#1c1c28] transition-colors pr-9 outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af] absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Advanced Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 border rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                showFilters 
                  ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' 
                  : 'bg-[#13131a] border-white/5 text-[#9ca3af] hover:bg-[#1c1c28] hover:text-white'
              }`}
            >
              <Filter className="w-3 h-3" />
              Filters
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Reset Filters Shortcut */}
            {(selectedGenre !== 'all' || selectedLanguage !== 'all' || selectedYear || minRating !== '0' || selectedSubCategory !== 'all' || selectedTag !== 'all' || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#8b5cf6] hover:text-[#a78bfa] transition-all cursor-pointer uppercase tracking-wider"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Genre Selection Row (Row 2) */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-6 animate-fade-in">
        <div className="flex items-center gap-4 animate-fade-in py-1">
          <span className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest shrink-0">Genres:</span>
          <div className="flex overflow-x-auto hide-scrollbar py-1 flex-1 gap-2.5">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`shrink-0 rounded-full text-xs font-black transition-all cursor-pointer uppercase tracking-wider px-4 py-2 border ${
                selectedGenre === 'all'
                  ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/10'
                  : 'bg-[#13131a] border-white/5 text-[#9ca3af] hover:bg-[#1c1c28] hover:text-white'
              }`}
            >
              All
            </button>
            {Object.entries(GENRE_MAP).slice(0, 8).map(([id, name]) => (
              <button
                key={id}
                onClick={() => setSelectedGenre(id)}
                className={`shrink-0 rounded-full text-xs font-black transition-all cursor-pointer uppercase tracking-wider px-4 py-2 border ${
                  selectedGenre === id
                    ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/10'
                    : 'bg-[#13131a] border-white/5 text-[#9ca3af] hover:bg-[#1c1c28] hover:text-white'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Category Pills */}
      {currentCategory && (
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-6 animate-fade-in">
          <div className="flex overflow-x-auto hide-scrollbar max-w-full pb-1 gap-2">
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`shrink-0 rounded-full text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider px-3.5 py-1.5 border ${
                selectedSubCategory === 'all'
                  ? 'bg-white border-white text-black'
                  : 'bg-[#13131a] border-white/5 text-[#9ca3af] hover:bg-[#1c1c28] hover:text-white'
              }`}
            >
              All {currentCategory.name}
            </button>
            {currentCategory.subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => setSelectedSubCategory(sub.slug)}
                className={`shrink-0 rounded-full text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider px-3.5 py-1.5 border ${
                  selectedSubCategory === sub.slug
                    ? 'bg-white border-white text-black'
                    : 'bg-[#13131a] border-white/5 text-[#9ca3af] hover:bg-[#1c1c28] hover:text-white'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filter Sliders Panel */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 animate-fade-in">
          <div className="bg-[#13131a]/90 border border-white/5 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-6 backdrop-blur-md">
            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest">Original Language</label>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-[#13131a] border border-white/5 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-[#1c1c28] transition-colors font-semibold pr-10 appearance-none"
                >
                  <option value="all">All Languages</option>
                  {Object.entries(LANGUAGE_FILTERS).map(([key, value]) => (
                    <option key={value.code} value={value.code}>
                      {value.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#9ca3af] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Release Year Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest">Release Year</label>
              <input
                type="number"
                placeholder="e.g. 2024"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#13131a] border border-white/5 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-[#6b7280] font-semibold"
                min="1950"
                max="2027"
              />
            </div>

            {/* Minimum Rating Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest">Minimum Rating</label>
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
                className="w-full accent-[#8b5cf6] cursor-pointer bg-[#1c1c28] h-1.5 rounded-lg appearance-none"
              />
            </div>

            {/* Smart Tags Mood Filter */}
            <div className="space-y-2">
              <label className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest">Vibe / Mood</label>
              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-[#13131a] border border-white/5 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-[#1c1c28] transition-colors font-semibold pr-10 appearance-none"
                >
                  <option value="all">Any Vibe</option>
                  {SMART_TAGS.mood.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#9ca3af] absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-4">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8b5cf6]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.map((movie, index) => (
                <MovieCard key={`movie-${movie.id}-${index}`} item={movie} index={index} />
              ))}
            </div>

            {filteredMovies.length > 0 && (
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
            )}

            {filteredMovies.length === 0 && (
              <div className="text-center py-20 bg-[#13131a]/40 rounded-xl border border-white/5 border-dashed p-6">
                <p className="text-[#9ca3af] text-lg font-semibold">No movies found matching your filters.</p>
                <p className="text-[#6b7280] text-xs mt-1">Try resetting the filters or modifying your inputs.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 bg-[#8b5cf6] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-[#a78bfa] transition-colors cursor-pointer"
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
