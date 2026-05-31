// TMDB API TypeScript Types

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  video: boolean;
  media_type?: 'movie';
  runtime?: number;
  genres?: Genre[];
  credits?: Credits;
  videos?: VideoResults;
  similar?: PaginatedResponse<TMDBMovie>;
  recommendations?: PaginatedResponse<TMDBMovie>;
  'watch/providers'?: WatchProviders;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { iso_639_1: string; name: string; english_name: string }[];
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  origin_country: string[];
  media_type?: 'tv';
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: Genre[];
  credits?: Credits;
  videos?: VideoResults;
  similar?: PaginatedResponse<TMDBTVShow>;
  recommendations?: PaginatedResponse<TMDBTVShow>;
  'watch/providers'?: WatchProviders;
  tagline?: string;
  status?: string;
  seasons?: Season[];
  created_by?: { id: number; name: string; profile_path: string | null }[];
  networks?: { id: number; name: string; logo_path: string | null }[];
  episode_run_time?: number[];
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  media_type?: 'person';
  known_for?: (TMDBMovie | TMDBTVShow)[];
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
  movie_credits?: { cast: CastMember[]; crew: CrewMember[] };
  tv_credits?: { cast: CastMember[]; crew: CrewMember[] };
}

export type TMDBMultiResult = TMDBMovie | TMDBTVShow | TMDBPerson;
export type MediaItem = TMDBMovie | TMDBTVShow;

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface VideoResults {
  results: Video[];
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
  vote_average: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime: number;
}

export interface SeasonDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episodes: Episode[];
  air_date: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface WatchProviders {
  results: Record<string, {
    link: string;
    flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
    rent?: { provider_id: number; provider_name: string; logo_path: string }[];
    buy?: { provider_id: number; provider_name: string; logo_path: string }[];
  }>;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface WatchlistItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  addedAt: string;
}
