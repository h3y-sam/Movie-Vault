// TMDB API Client — uses real API if env token exists, otherwise mock data

import { TMDBMovie, TMDBTVShow, PaginatedResponse } from '@/types/tmdb.types';
import {
  MOCK_TRENDING_MOVIES,
  MOCK_BOLLYWOOD_MOVIES,
  MOCK_TV_SHOWS,
  MOCK_ANIME,
  MOCK_TOP_RATED_MOVIES,
  MOCK_CAST,
} from './mockData';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p';

const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN || process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
const USE_MOCK = !ACCESS_TOKEN;

export function getImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/no-image.svg';
  return `${TMDB_IMAGE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: string = 'w1280'): string {
  if (!path) return '/no-backdrop.svg';
  return `${TMDB_IMAGE}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// --- Mock response helpers ---
function mockPaginated<T>(items: T[]): PaginatedResponse<T> {
  return {
    page: 1,
    results: items,
    total_pages: 1,
    total_results: items.length,
  };
}

// --- Public API ---

export const tmdb = {
  // Trending
  async getTrending(type: string = 'all', period: string = 'week') {
    if (USE_MOCK) {
      return mockPaginated([...MOCK_TRENDING_MOVIES, ...MOCK_TV_SHOWS.slice(0, 4)]);
    }
    return tmdbFetch<PaginatedResponse<TMDBMovie | TMDBTVShow>>(
      `/trending/${type}/${period}`
    );
  },

  // Movies
  async getMovies(category: string = 'popular', page: number = 1) {
    if (USE_MOCK) {
      return mockPaginated(MOCK_TRENDING_MOVIES);
    }
    return tmdbFetch<PaginatedResponse<TMDBMovie>>(`/movie/${category}`, {
      page: page.toString(),
    });
  },

  // Movie Detail
  async getMovieDetail(id: number) {
    if (USE_MOCK) {
      const movie = [...MOCK_TRENDING_MOVIES, ...MOCK_TOP_RATED_MOVIES, ...MOCK_BOLLYWOOD_MOVIES].find(
        (m) => m.id === id
      );
      if (movie) {
        return {
          ...movie,
          runtime: 148,
          tagline: 'An epic cinematic experience',
          credits: { cast: MOCK_CAST, crew: [] },
          videos: {
            results: [
              {
                id: 'yt1',
                key: 'dQw4w9WgXcQ',
                name: 'Official Trailer',
                site: 'YouTube',
                type: 'Trailer',
                official: true,
              },
            ],
          },
          similar: mockPaginated(MOCK_TRENDING_MOVIES.filter((m) => m.id !== id).slice(0, 6)),
          recommendations: mockPaginated(MOCK_TOP_RATED_MOVIES.slice(0, 6)),
          genres: movie.genre_ids.map((gid) => ({
            id: gid,
            name: getGenreLabel(gid),
          })),
        };
      }
      return null;
    }
    return tmdbFetch<TMDBMovie>(`/movie/${id}`, {
      append_to_response: 'credits,videos,similar,recommendations,watch/providers',
    });
  },

  // TV Shows
  async getTVShows(category: string = 'popular', page: number = 1) {
    if (USE_MOCK) {
      return mockPaginated(MOCK_TV_SHOWS);
    }
    return tmdbFetch<PaginatedResponse<TMDBTVShow>>(`/tv/${category}`, {
      page: page.toString(),
    });
  },

  // TV Detail
  async getTVDetail(id: number) {
    if (USE_MOCK) {
      const show = [...MOCK_TV_SHOWS, ...MOCK_ANIME].find((s) => s.id === id);
      if (show) {
        return {
          ...show,
          tagline: 'The greatest story ever told',
          credits: { cast: MOCK_CAST, crew: [] },
          videos: {
            results: [
              {
                id: 'yt2',
                key: 'dQw4w9WgXcQ',
                name: 'Official Trailer',
                site: 'YouTube',
                type: 'Trailer',
                official: true,
              },
            ],
          },
          similar: mockPaginated(MOCK_TV_SHOWS.filter((s) => s.id !== id).slice(0, 6)),
          recommendations: mockPaginated(MOCK_TV_SHOWS.slice(0, 6)),
          genres: show.genre_ids.map((gid) => ({
            id: gid,
            name: getGenreLabel(gid),
          })),
          seasons: [
            {
              id: 1,
              name: 'Season 1',
              overview: 'The beginning of an epic saga.',
              poster_path: show.poster_path,
              season_number: 1,
              episode_count: 10,
              air_date: show.first_air_date,
              vote_average: show.vote_average,
            },
          ],
        };
      }
      return null;
    }
    return tmdbFetch<TMDBTVShow>(`/tv/${id}`, {
      append_to_response: 'credits,videos,similar,recommendations,watch/providers',
    });
  },

  // TV Season Detail
  async getTVSeason(tvId: number, seasonNumber: number) {
    if (USE_MOCK) {
      const episodes = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Episode ${i + 1}`,
        overview: `This is the overview for Episode ${i + 1} of Season ${seasonNumber}.`,
        still_path: null,
        episode_number: i + 1,
        air_date: '2026-01-01',
      }));
      return { episodes };
    }
    return tmdbFetch<{ episodes: any[] }>(`/tv/${tvId}/season/${seasonNumber}`);
  },

  // Discover
  async discover(type: 'movie' | 'tv', filters: Record<string, string>) {
    if (USE_MOCK) {
      if (type === 'movie') {
        const lang = filters.with_original_language;
        if (lang === 'hi') return mockPaginated(MOCK_BOLLYWOOD_MOVIES);
        return mockPaginated(MOCK_TRENDING_MOVIES);
      }
      const lang = filters.with_original_language;
      if (lang === 'ja') return mockPaginated(MOCK_ANIME);
      return mockPaginated(MOCK_TV_SHOWS);
    }
    return tmdbFetch<PaginatedResponse<TMDBMovie | TMDBTVShow>>(
      `/discover/${type}`,
      filters
    );
  },

  // Search
  async search(query: string, page: number = 1) {
    if (USE_MOCK) {
      const allItems = [
        ...MOCK_TRENDING_MOVIES.map((m) => ({ ...m, media_type: 'movie' as const })),
        ...MOCK_TV_SHOWS.map((s) => ({ ...s, media_type: 'tv' as const })),
        ...MOCK_BOLLYWOOD_MOVIES.map((m) => ({ ...m, media_type: 'movie' as const })),
        ...MOCK_ANIME.map((s) => ({ ...s, media_type: 'tv' as const })),
      ];
      const q = query.toLowerCase();
      const filtered = allItems.filter(
        (item) =>
          ('title' in item && item.title.toLowerCase().includes(q)) ||
          ('name' in item && item.name.toLowerCase().includes(q))
      );
      return mockPaginated(filtered);
    }
    return tmdbFetch<PaginatedResponse<TMDBMovie | TMDBTVShow>>('/search/multi', {
      query,
      page: page.toString(),
      include_adult: 'false',
    });
  },

  // Bollywood
  async getBollywood(page: number = 1) {
    if (USE_MOCK) return mockPaginated(MOCK_BOLLYWOOD_MOVIES);
    return tmdbFetch<PaginatedResponse<TMDBMovie>>('/discover/movie', {
      with_original_language: 'hi',
      sort_by: 'popularity.desc',
      page: page.toString(),
    });
  },

  // Anime
  async getAnime(page: number = 1) {
    if (USE_MOCK) return mockPaginated(MOCK_ANIME);
    return tmdbFetch<PaginatedResponse<TMDBTVShow>>('/discover/tv', {
      with_genres: '16',
      with_keywords: '210024',
      with_original_language: 'ja',
      sort_by: 'popularity.desc',
      page: page.toString(),
    });
  },

  // Top Rated
  async getTopRated(type: 'movie' | 'tv' = 'movie', page: number = 1) {
    if (USE_MOCK) {
      return type === 'movie'
        ? mockPaginated(MOCK_TOP_RATED_MOVIES)
        : mockPaginated(MOCK_TV_SHOWS);
    }
    return tmdbFetch<PaginatedResponse<TMDBMovie | TMDBTVShow>>(
      `/${type}/top_rated`,
      { page: page.toString() }
    );
  },
};

// Genre label helper
import { GENRE_MAP, TV_GENRE_MAP } from './constants';

function getGenreLabel(id: number): string {
  return GENRE_MAP[id] || TV_GENRE_MAP[id] || 'Unknown';
}
