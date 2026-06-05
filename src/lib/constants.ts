// Movie Vault Constants

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
} as const;

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const TV_GENRE_MAP: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

export const LANGUAGE_FILTERS: Record<string, { code: string; label: string }> = {
  bollywood: { code: 'hi', label: 'Hindi' },
  hollywood: { code: 'en', label: 'English' },
  tamil: { code: 'ta', label: 'Tamil' },
  telugu: { code: 'te', label: 'Telugu' },
  malayalam: { code: 'ml', label: 'Malayalam' },
  kannada: { code: 'kn', label: 'Kannada' },
  bengali: { code: 'bn', label: 'Bengali' },
  marathi: { code: 'mr', label: 'Marathi' },
  punjabi: { code: 'pa', label: 'Punjabi' },
  japanese: { code: 'ja', label: 'Japanese' },
  korean: { code: 'ko', label: 'Korean' },
  chinese: { code: 'zh', label: 'Chinese' },
  spanish: { code: 'es', label: 'Spanish' },
  french: { code: 'fr', label: 'French' },
};

export const STREAM_SOURCES = {
  movie: [
    {
      name: 'Server 1',
      url: (tmdbId: number) => `https://peachify.top/embed/movie/${tmdbId}?accent=e50914&dub=Hindi&quality=1080`,
    },
    {
      name: 'Server 2',
      url: (tmdbId: number) => `https://streamimdb.ru/embed/movie/${tmdbId}`,
    },
    {
      name: 'Server 3',
      url: (tmdbId: number) => `https://vsembed.su/embed/movie/${tmdbId}`,
    },
    {
      name: 'Server 4',
      url: (tmdbId: number) => `https://vidlink.pro/movie/${tmdbId}?primaryColor=e50914&nextbutton=true&autoplay=true`,
    },
    {
      name: 'Server 5',
      url: (tmdbId: number) => `https://www.vidking.net/embed/movie/${tmdbId}?color=e50914&autoPlay=true`,
    },
    {
      name: 'Server 6',
      url: (tmdbId: number) => `https://vidrock.ru/movie/${tmdbId}`,
    },
    {
      name: 'Server 7',
      url: (tmdbId: number) => `https://player.videasy.net/movie/${tmdbId}?color=e50914&overlay=true`,
    },
    {
      name: 'Server 8',
      url: (tmdbId: number) => `https://www.2embed.cc/embed/${tmdbId}`,
    },
    {
      name: 'Server 9',
      url: (tmdbId: number) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    },
    {
      name: 'Server 10',
      url: (tmdbId: number) => `https://111movies.net/movie/${tmdbId}`,
    },
    {
      name: 'Server 11',
      url: (tmdbId: number) => `https://vidnest.fun/movie/${tmdbId}`,
    },
    {
      name: 'Server 12',
      url: (tmdbId: number) => `https://embedmaster.link/movie/${tmdbId}`,
    },
  ],
  tv: [
    {
      name: 'Server 1',
      url: (tmdbId: number, s: number, e: number) =>
        `https://peachify.top/embed/tv/${tmdbId}/${s}/${e}?accent=e50914&dub=Hindi&quality=1080&autoNext=true&showNextBtn=true`,
    },
    {
      name: 'Server 2',
      url: (tmdbId: number, s: number, e: number) =>
        `https://streamimdb.ru/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
      name: 'Server 3',
      url: (tmdbId: number, s: number, e: number) =>
        `https://vsembed.su/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
      name: 'Server 4',
      url: (tmdbId: number, s: number, e: number) =>
        `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?primaryColor=e50914&nextbutton=true&autoplay=true`,
    },
    {
      name: 'Server 5',
      url: (tmdbId: number, s: number, e: number) =>
        `https://www.vidking.net/embed/tv/${tmdbId}/${s}/${e}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`,
    },
    {
      name: 'Server 6',
      url: (tmdbId: number, s: number, e: number) =>
        `https://vidrock.ru/tv/${tmdbId}/${s}/${e}`,
    },
    {
      name: 'Server 7',
      url: (tmdbId: number, s: number, e: number) =>
        `https://player.videasy.net/tv/${tmdbId}/${s}/${e}?color=e50914&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true`,
    },
    {
      name: 'Server 8',
      url: (tmdbId: number, s: number, e: number) =>
        `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`,
    },
    {
      name: 'Server 9',
      url: (tmdbId: number, s: number, e: number) =>
        `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`,
    },
    {
      name: 'Server 10',
      url: (tmdbId: number, s: number, e: number) =>
        `https://111movies.net/tv/${tmdbId}/${s}/${e}`,
    },
    {
      name: 'Server 11',
      url: (tmdbId: number, s: number, e: number) =>
        `https://vidnest.fun/tv/${tmdbId}/${s}/${e}`,
    },
    {
      name: 'Server 12',
      url: (tmdbId: number, s: number, e: number) =>
        `https://embedmaster.link/tv/${tmdbId}/${s}/${e}`,
    },
  ],
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Movies', href: '/movies' },
  { label: 'Series', href: '/series' },
  { label: 'Anime', href: '/anime' },
  { label: 'Bollywood', href: '/bollywood' },
  { label: 'My List', href: '/watchlist' },
];

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
  { value: 'original_title.asc', label: 'Title A-Z' },
];
