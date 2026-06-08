'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, ExternalLink, Play, Plus, Check, Loader2, Film, Tv, Search, ArrowUpDown, Volume2, VolumeX, ArrowRight, ChevronDown, Download, Users } from 'lucide-react';
import { STREAM_SOURCES } from '@/lib/constants';
import { getImageUrl, getBackdropUrl, tmdb } from '@/lib/tmdb';
import { useWatchlistStore } from '@/store/watchlistStore';
import JoinRoomModal from '@/components/room/JoinRoomModal';

interface WatchPageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  const resolvedParams = use(params);
  const { type, id } = resolvedParams;
  const numericId = parseInt(id);
  const sources = type === 'movie' ? STREAM_SOURCES.movie : STREAM_SOURCES.tv;

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSource, setActiveSource] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [selectedDub, setSelectedDub] = useState('Hindi');

  const [title, setTitle] = useState('Loading...');
  const [mediaDetail, setMediaDetail] = useState<any>(null);
  const [seasonsData, setSeasonsData] = useState<{ season_number: number; episode_count: number }[]>([]);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Watch Together integration
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);

  // Search & Sort episodes states
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [episodeSort, setEpisodeSort] = useState<'asc' | 'desc'>('asc');

  // Volume controls overlay
  const [isMuted, setIsMuted] = useState(false);

  // Split layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [autoNext, setAutoNext] = useState(true);

  // Auto-switch failover states
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [consecutiveTimeouts, setConsecutiveTimeouts] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const failoverTimerRef = useRef<any>(null);

  // Ad-blocker click shield: on first user click inside the iframe area, we absorb
  // the event via the shield overlay (which prevents the ad popup from firing) then
  // immediately hide the shield so subsequent clicks reach the player normally.
  const [clickShieldActive, setClickShieldActive] = useState(false);
  const clickShieldRef = useRef<HTMLDivElement>(null);

  // Auto-switch failover timer effect
  // Only switches if the iframe fails to load within the timeout — cancelled on successful iframe load.
  useEffect(() => {
    // Don't start timer if not playing, auto-switch disabled, or iframe already loaded
    if (!isPlaying || !autoSwitch || !iframeLoading) {
      if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
      return;
    }

    if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);

    failoverTimerRef.current = setTimeout(() => {
      // Only switch if the iframe still hasn't loaded (iframeLoading is still true)
      const nextSourceIndex = (activeSource + 1) % sources.length;

      if (consecutiveTimeouts < sources.length - 1) {
        setConsecutiveTimeouts((prev) => prev + 1);
        const nextSourceName = sources[nextSourceIndex].name;
        setToastMessage(`${sources[activeSource].name} failed to load. Auto-switching to ${nextSourceName}...`);
        setActiveSource(nextSourceIndex);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setToastMessage('All streaming servers failed to load. Please select a server manually or try again later.');
        setTimeout(() => setToastMessage(null), 6000);
        setConsecutiveTimeouts(0);
      }
    }, 12000); // 12-second load timeout

    return () => {
      if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
    };
  }, [activeSource, isPlaying, season, episode, autoSwitch, iframeLoading, consecutiveTimeouts, sources]);

  // Check URL parameters for search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const s = urlParams.get('season');
      const e = urlParams.get('episode');
      const play = urlParams.get('play');
      if (s) setSeason(parseInt(s));
      if (e) setEpisode(parseInt(e));
      if (play === 'true') setIsPlaying(true);
    }
  }, []);

  const router = useRouter();

  const handleStartWatchTogether = () => {
    setShowJoinModal(true);
  };

  const handleCreateRoom = async (name: string, avatar: string, color: string) => {
    try {
      setCreatingRoom(true);
      const hostId = Math.random().toString(36).slice(2, 10);

      // Save host identity to localStorage to prevent double name prompt
      localStorage.setItem('streamvault-host-identity', JSON.stringify({
        id: hostId,
        name,
        avatar,
        color,
      }));

      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: numericId,
          mediaType: type,
          season,
          episode,
          title,
          poster: mediaDetail?.backdrop_path || '',
          hostId,
          hostName: name,
          hostAvatar: avatar,
          hostColor: color,
        }),
      });

      if (!res.ok) throw new Error('Failed to create room');
      const data = await res.json();
      setCreatedRoomCode(data.code);
      setShowJoinModal(false);

      // Auto redirect after short delay or direct transition
      router.push(`/room/${data.code}`);
    } catch (err) {
      console.error('Error starting watch together:', err);
      alert('Could not start watch together party. Please try again.');
    } finally {
      setCreatingRoom(false);
    }
  };

  // Sync state to URL params (avoid full refreshes)
  useEffect(() => {
    if (type === 'tv' && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('season', season.toString());
      url.searchParams.set('episode', episode.toString());
      if (isPlaying) {
        url.searchParams.set('play', 'true');
      } else {
        url.searchParams.delete('play');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [type, season, episode, isPlaying]);

  // Load Main Media Details
  useEffect(() => {
    async function loadTitle() {
      try {
        setHasError(false);
        if (type === 'movie') {
          const res = await tmdb.getMovieDetail(numericId);
          if (!res) {
            setHasError(true);
            return;
          }
          setMediaDetail(res);
          setTitle(res?.title || 'Unknown Movie');
        } else {
          const res = await tmdb.getTVDetail(numericId);
          if (!res) {
            setHasError(true);
            return;
          }
          setMediaDetail(res);
          setTitle(res?.name || 'Unknown Show');
          if (res?.seasons) {
            const validSeasons = res.seasons.filter((s: any) => s.season_number > 0);
            setSeasonsData(validSeasons);
            if (validSeasons.length > 0 && !validSeasons.find((s: any) => s.season_number === season)) {
              setSeason(validSeasons[0].season_number);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load title details:', err);
        setHasError(true);
        setTitle('Unknown Title');
      }
    }
    loadTitle();
  }, [type, numericId]);

  // Load TV Season Episodes
  useEffect(() => {
    if (type !== 'tv') return;

    async function loadEpisodes() {
      try {
        setEpisodesLoading(true);
        const res = await tmdb.getTVSeason(numericId, season);
        setEpisodesList(res?.episodes || []);
      } catch (err) {
        console.error('Failed to load episodes:', err);
        setEpisodesList([]);
      } finally {
        setEpisodesLoading(false);
      }
    }
    loadEpisodes();
  }, [numericId, season, type]);

  // Watchlist functions
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inList = mediaDetail ? isInWatchlist(mediaDetail.id, type as 'movie' | 'tv') : false;

  const toggleWatchlist = () => {
    if (!mediaDetail) return;
    const mediaType = type as 'movie' | 'tv';
    if (inList) {
      removeItem(mediaDetail.id, mediaType);
    } else {
      addItem({
        tmdbId: mediaDetail.id,
        mediaType,
        title: type === 'movie' ? mediaDetail.title : mediaDetail.name,
        posterPath: mediaDetail.poster_path,
        backdropPath: mediaDetail.backdrop_path,
        voteAverage: mediaDetail.vote_average,
        addedAt: new Date().toISOString(),
      });
    }
  };

  // Scroll smooth anchor
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Save to Watch History
  useEffect(() => {
    if (!mediaDetail) return;

    try {
      const historyStr = localStorage.getItem('streamvault-watch-history') || '[]';
      let historyList = JSON.parse(historyStr);

      const existingItem = historyList.find(
        (h: any) => h.id === numericId && h.type === type
      );

      const newItem = {
        id: numericId,
        type,
        title: type === 'movie' ? mediaDetail.title : mediaDetail.name,
        posterPath: mediaDetail.poster_path,
        backdropPath: mediaDetail.backdrop_path,
        season: type === 'tv' ? season : undefined,
        episode: type === 'tv' ? episode : undefined,
        watchedAt: new Date().toISOString(),
        progress: existingItem && (type === 'movie' || (existingItem.season === season && existingItem.episode === episode))
          ? existingItem.progress
          : undefined,
      };

      // Filter duplicates
      historyList = historyList.filter(
        (h: any) => !(h.id === numericId && h.type === type)
      );
      historyList.unshift(newItem);

      localStorage.setItem('streamvault-watch-history', JSON.stringify(historyList.slice(0, 20)));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to save to history:', e);
    }
  }, [mediaDetail, season, episode, numericId, type]);

  // Listen for message events from Peachify, VidLink, Vidking, VIDEASY and EmbedMaster players to track watch progress
  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      // Validate origin — only accept messages from trusted player origins
      if (
        event.origin !== 'https://peachify.top' &&
        event.origin !== 'https://vidlink.pro' &&
        event.origin !== 'https://www.vidking.net' &&
        event.origin !== 'https://player.videasy.net' &&
        event.origin !== 'https://embedmaster.link'
      ) {
        return;
      }

      let rawData = event.data;
      // Vidking sends messages stringified
      if (typeof rawData === 'string') {
        try {
          rawData = JSON.parse(rawData);
        } catch (e) {
          return; // Ignore if not valid JSON
        }
      }

      if (!rawData || typeof rawData !== 'object') return;

      const isEmbedMaster = rawData.source === 'embedmaster_player';
      if (!isEmbedMaster && rawData.type !== 'PLAYER_EVENT' && rawData.type !== 'MEDIA_DATA') return;

      // Reset failover timer and counter on any successful message event
      if (failoverTimerRef.current) {
        clearTimeout(failoverTimerRef.current);
        failoverTimerRef.current = null;
      }
      setConsecutiveTimeouts(0);

      let progressUpdate: { currentTime: number; duration: number } | null = null;
      let isEnded = false;

      if (isEmbedMaster) {
        const eventType = rawData.event;
        const info = rawData.info || {};
        if (eventType === 'ended') {
          isEnded = true;
        }
        const currentTime = typeof info.seconds === 'number' ? info.seconds : info.currentTime;
        const duration = info.duration;
        if (typeof currentTime === 'number' && typeof duration === 'number' && duration > 0) {
          progressUpdate = { currentTime, duration };
        }
      } else if (rawData.type === 'PLAYER_EVENT') {
        const { event: eventType, currentTime, duration, season: eventSeason, episode: eventEpisode } = rawData.data || {};

        if (eventType === 'ended') {
          isEnded = true;
        }

        if (typeof currentTime === 'number' && typeof duration === 'number' && duration > 0) {
          progressUpdate = { currentTime, duration };
        }

        // If the player itself advanced the episode/season (e.g. native next button inside iframe, Peachify autoNext)
        // Peachify sends season/episode as numbers; coerce to handle both
        if (type === 'tv') {
          const newSeason = typeof eventSeason === 'string' ? parseInt(eventSeason) : eventSeason;
          const newEpisode = typeof eventEpisode === 'string' ? parseInt(eventEpisode) : eventEpisode;
          if (typeof newSeason === 'number' && !isNaN(newSeason) && newSeason !== season) {
            setSeason(newSeason);
          }
          if (typeof newEpisode === 'number' && !isNaN(newEpisode) && newEpisode !== episode) {
            setEpisode(newEpisode);
          }
        }
      } else if (rawData.type === 'MEDIA_DATA') {
        // MEDIA_DATA handling:
        // VidLink: rawData.data is a flat progress object
        // Peachify: rawData.data is keyed by tmdbId e.g. { "76479": { progress, show_progress, ... } }
        const mediaData = rawData.data;
        if (mediaData) {
          // Detect Peachify format: data is an object keyed by numeric IDs
          const peachifyEntry = mediaData[numericId] ?? mediaData[String(numericId)];

          if (peachifyEntry) {
            // Peachify MEDIA_DATA — store the full payload for continue-watching
            try {
              const existing = JSON.parse(localStorage.getItem('peachify-progress') || '{}');
              existing[numericId] = peachifyEntry;
              localStorage.setItem('peachify-progress', JSON.stringify(existing));
            } catch (_) { }

            // Extract current progress from Peachify payload
            if (type === 'movie' && peachifyEntry.progress) {
              progressUpdate = {
                currentTime: peachifyEntry.progress.watched,
                duration: peachifyEntry.progress.duration,
              };
            } else if (type === 'tv' && peachifyEntry.show_progress) {
              const key = `s${season}e${episode}`;
              const epProgress = peachifyEntry.show_progress[key]?.progress;
              if (epProgress) {
                progressUpdate = {
                  currentTime: epProgress.watched,
                  duration: epProgress.duration,
                };
              }
            }
          } else {
            // Fallback: VidLink-style flat MEDIA_DATA
            if (type === 'movie' && mediaData.progress) {
              progressUpdate = {
                currentTime: mediaData.progress.watched,
                duration: mediaData.progress.duration,
              };
            } else if (type === 'tv' && mediaData.show_progress) {
              const key = `s${season}e${episode}`;
              const epProgress = mediaData.show_progress[key]?.progress;
              if (epProgress) {
                progressUpdate = {
                  currentTime: epProgress.watched,
                  duration: epProgress.duration,
                };
              }
            }
          }
        }
      }

      // Handle Auto Next when video ends
      if (isEnded && type === 'tv' && autoNext) {
        const currentSeasonInfo = seasonsData.find((s) => s.season_number === season);
        const maxEpisodes = currentSeasonInfo?.episode_count || episodesList.length || 0;

        if (episode < maxEpisodes) {
          setEpisode((prev) => prev + 1);
        } else {
          // Check if there is a next season
          const nextSeasonInfo = seasonsData.find((s) => s.season_number === season + 1);
          if (nextSeasonInfo) {
            setSeason((prev) => prev + 1);
            setEpisode(1);
          }
        }
      }

      // Save watch progress to local watch history
      if (progressUpdate) {
        const { currentTime, duration } = progressUpdate;
        const percent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

        try {
          const historyStr = localStorage.getItem('streamvault-watch-history') || '[]';
          let historyList = JSON.parse(historyStr);

          const itemIndex = historyList.findIndex(
            (h: any) => h.id === numericId && h.type === type
          );

          if (itemIndex > -1) {
            const item = historyList[itemIndex];
            item.progress = {
              currentTime,
              duration,
              percent: Math.round(percent),
            };
            if (type === 'tv') {
              item.season = season;
              item.episode = episode;
            }
            item.watchedAt = new Date().toISOString();
            historyList.splice(itemIndex, 1);
            historyList.unshift(item);
          } else if (mediaDetail) {
            const newItem = {
              id: numericId,
              type,
              title: type === 'movie' ? mediaDetail.title : mediaDetail.name,
              posterPath: mediaDetail.poster_path,
              backdropPath: mediaDetail.backdrop_path,
              season: type === 'tv' ? season : undefined,
              episode: type === 'tv' ? episode : undefined,
              watchedAt: new Date().toISOString(),
              progress: {
                currentTime,
                duration,
                percent: Math.round(percent),
              },
            };
            historyList.unshift(newItem);
          }

          localStorage.setItem('streamvault-watch-history', JSON.stringify(historyList.slice(0, 20)));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.error('Failed to update progress in watch history:', e);
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [numericId, type, season, episode, mediaDetail, autoNext, seasonsData, episodesList]);

  // Reset loading spinner whenever source or video indexes change
  useEffect(() => {
    setIframeLoading(true);
    // Re-arm the click shield on every source/episode change so the first click
    // is always intercepted (ad scripts re-arm themselves too)
    setClickShieldActive(true);
  }, [activeSource, season, episode]);

  // Also arm the shield when player starts
  useEffect(() => {
    if (isPlaying) setClickShieldActive(true);
  }, [isPlaying]);

  // Filter & sort episodes list
  const filteredEpisodes = episodesList
    .filter((ep) => {
      if (!episodeSearch.trim()) return true;
      const search = episodeSearch.toLowerCase();
      return (
        ep.name?.toLowerCase().includes(search) ||
        ep.overview?.toLowerCase().includes(search) ||
        ep.episode_number.toString() === search
      );
    })
    .sort((a, b) => {
      return episodeSort === 'asc'
        ? a.episode_number - b.episode_number
        : b.episode_number - a.episode_number;
    });

  const currentSource = sources[activeSource];

  const rawEmbedUrl =
    type === 'movie'
      ? (currentSource.url as (id: number) => string)(numericId)
      : (currentSource.url as (id: number, s: number, e: number) => string)(
        numericId,
        season,
        episode
      );

  let embedUrl = rawEmbedUrl;
  if (rawEmbedUrl.includes('peachify.top')) {
    try {
      const urlObj = new URL(rawEmbedUrl);
      urlObj.searchParams.set('dub', selectedDub);
      embedUrl = urlObj.toString();
    } catch (e) {
      embedUrl = rawEmbedUrl.replace('dub=Hindi', `dub=${selectedDub}`);
    }
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-sv-red mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">Content Not Found</h2>
        <p className="text-sm text-sv-text-muted max-w-sm mb-6">
          We couldn't load the requested details. This content might not exist, or there could be a network connection issue.
        </p>
        <Link 
          href="/" 
          className="bg-sv-red hover:bg-sv-red-hover text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors shrink-0 shadow-lg shadow-sv-red/20 cursor-pointer"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  if (!mediaDetail) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-sv-red animate-spin mb-3" />
        <p className="text-sm text-sv-text font-semibold">Loading movie details...</p>
      </div>
    );
  }

  const similar = mediaDetail.similar?.results?.slice(0, 6) || [];
  const genresLabel = mediaDetail.genres?.map((g: any) => g.name).join('   •   ') || '';

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* 1. Header Media Element: Hero details or active video player */}
      {!isPlaying ? (
        /* Stranger Things Style Info Header Backdrop Banner */
        <div
          className="relative w-full bg-cover bg-center bg-no-repeat flex items-end animate-fade-in"
          style={{
            height: '70vh',
            minHeight: '480px',
            backgroundImage: `url(${getBackdropUrl(mediaDetail?.backdrop_path || mediaDetail?.poster_path, 'original')})`,
          }}
        >
          {/* Double Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />

          {/* Navigation Controls overlay */}
          <button
            onClick={() => window.history.back()}
            className="absolute top-20 left-4 md:left-8 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-20 right-4 md:right-8 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-all cursor-pointer"
            aria-label="Mute controls"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Hero details Overlay */}
          <div className="relative z-10 sv-container pb-10 w-full max-w-4xl space-y-4 text-left animate-fade-in-up">
            {/* Styled title banner */}
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md select-none">
              {title}
            </h1>

            {/* Sub-Metadata Row */}
            <div className="flex items-center gap-3.5 text-xs text-sv-text-secondary flex-wrap font-semibold">
              <span className="flex items-center gap-1 text-sv-red font-bold bg-sv-red/10 px-2 py-0.5 rounded border border-sv-red/20 text-xs">
                ★ {mediaDetail?.vote_average?.toFixed(1) || '8.0'}
              </span>
              <span className="text-sv-text-muted">
                {type === 'movie' ? getYear(mediaDetail?.release_date) : getYear(mediaDetail?.first_air_date)}
              </span>
              {(() => {
                const isHindiAvailable = (mediaItem: any) => {
                  if (mediaItem.original_language === 'hi') return true;
                  if (mediaItem.origin_country?.includes('IN')) return true;
                  if (mediaItem.spoken_languages?.some((lang: any) => lang.iso_639_1 === 'hi')) return true;

                  const genres = mediaItem.genres?.map((g: any) => g.id) || mediaItem.genre_ids || [];
                  const hasActionOrSciFiOrAnimation = genres.some((id: number) => [28, 12, 878, 16].includes(id));
                  if (hasActionOrSciFiOrAnimation && mediaItem.popularity > 25) return true;

                  return false;
                };

                return isHindiAvailable(mediaDetail) ? (
                  <span className="bg-[#e11d48]/10 text-sv-red border border-sv-red/20 text-[10px] font-bold px-2 py-0.5 rounded">
                    HINDI AUDIO
                  </span>
                ) : null;
              })()}
              <span className="text-sv-text-dim font-light">|</span>
              <span className="text-sv-text-muted">{genresLabel}</span>
            </div>


            {/* CTA action buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <button
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-2 bg-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
                style={{ color: 'black', padding: '0.75rem 1.5rem' }}
              >
                <Play className="w-4 h-4 fill-black text-black" />
                Play
              </button>

              <button
                onClick={toggleWatchlist}
                className={`rounded-lg border flex items-center justify-center transition-all cursor-pointer bg-black/30 backdrop-blur-sm ${inList
                    ? 'border-sv-red text-sv-red'
                    : 'border-white/30 text-white hover:border-white'
                  }`}
                style={{ width: '2.75rem', height: '2.75rem' }}
                aria-label="Add to watchlist"
              >
                {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>

              {type === 'tv' && (
                <button
                  onClick={() => scrollToSection('episodes-section')}
                  className="flex items-center gap-2 border border-white/20 hover:border-white text-white rounded-lg font-bold text-xs uppercase tracking-wider bg-black/30 backdrop-blur-sm transition-all cursor-pointer"
                  style={{ padding: '0.75rem 1.25rem' }}
                >
                  <Tv className="w-4 h-4" />
                  Episodes
                </button>
              )}

              <button
                onClick={() => scrollToSection('similars-section')}
                className="flex items-center gap-2 border border-white/20 hover:border-white text-white rounded-lg font-bold text-xs uppercase tracking-wider bg-black/30 backdrop-blur-sm transition-all cursor-pointer"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                <Film className="w-4 h-4" />
                Similars
              </button>
              <button
                onClick={handleStartWatchTogether}
                className="flex items-center gap-2 border border-sv-red/35 hover:border-sv-red text-sv-red rounded-lg font-bold text-xs uppercase tracking-wider bg-[#e11d48]/5 backdrop-blur-sm transition-all cursor-pointer"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                <Users className="w-4 h-4" />
                Watch Together
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Premium Theatre Player Layout (Full Width) */
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 w-full" style={{ paddingTop: '80px', paddingBottom: '1.5rem' }}>
          {/* Clean Top Bar Above Player */}
          <div className="flex items-center justify-between gap-4 mb-4 mt-6 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-black text-white truncate max-w-lg md:max-w-2xl">{title}</h2>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <select
                  value={activeSource}
                  onChange={(e) => setActiveSource(parseInt(e.target.value))}
                  className="bg-[#13131a] border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none cursor-pointer hover:bg-[#1c1c28] appearance-none pr-8 transition-all duration-300"
                >
                  {sources.map((s, idx) => (
                    <option key={s.name} value={idx}>
                      {getServerLabel(s.name)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af] absolute right-3 top-2.5 pointer-events-none" />
              </div>

              <button
                onClick={handleStartWatchTogether}
                className="flex items-center gap-1.5 bg-sv-red/10 border border-sv-red/20 text-sv-red hover:bg-sv-red hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" />
                Watch Together
              </button>

              <button
                onClick={() => setIsPlaying(false)}
                className="flex items-center gap-1.5 bg-white/5 border border-white/5 text-[#9ca3af] hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Details
              </button>
            </div>
          </div>

          <div
            className="relative w-full aspect-video bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 animate-fade-in"
            style={{ height: '60vh', minHeight: '400px' }}
          >
            <div className="relative h-full w-full bg-black flex flex-col">
              {/* Loading Spinner */}
              {iframeLoading && (
                <div className="absolute inset-0 bg-[#0b0b0f] flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-10 h-10 text-sv-red animate-spin mb-3" />
                  <p className="text-sm text-white font-semibold">Resolving stream link...</p>
                  <p className="text-xs text-[#9ca3af] mt-1 font-medium">Source: {currentSource.name}</p>
                </div>
              )}

              {/*
                AD SHIELD OVERLAY — Layer 2 click interception
                This transparent div sits on top of the iframe and catches the very first
                click a user makes after a new source loads. On ad-heavy players, the first
                click always triggers window.open() for a popup. By absorbing that first click
                here (we never pass it to the iframe), the popup is silently swallowed.
                The shield then hides itself so all subsequent clicks reach the player naturally.
              */}
              {clickShieldActive && !iframeLoading && (
                <div
                  ref={clickShieldRef}
                  className="absolute inset-0 z-20 cursor-pointer"
                  style={{ background: 'transparent' }}
                  title="Click to start player"
                  onClick={(e) => {
                    // Absorb the first click (would have opened an ad popup)
                    e.stopPropagation();
                    // Deactivate shield — all subsequent clicks go straight to the iframe
                    setClickShieldActive(false);
                  }}
                />
              )}

              <iframe
                src={embedUrl}
                className="w-full h-full border-none flex-1"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                onLoad={() => {
                  setIframeLoading(false);
                  // Cancel the failover timer — iframe loaded successfully
                  if (failoverTimerRef.current) {
                    clearTimeout(failoverTimerRef.current);
                    failoverTimerRef.current = null;
                  }
                }}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* 2. Source Selector / Adblock warnings and layout options */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 mb-24 animate-fade-in-up" style={{ marginTop: '1.5rem', paddingTop: '1rem' }}>
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Active player controls panel (only visible when player is active) */}
          {isPlaying && (
            <div className="bg-[#13131a]/45 border border-white/5 rounded-2xl flex flex-col gap-6 backdrop-blur-md animate-fade-in shadow-xl p-6 transition-all duration-300">
              {/* Servers row */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-sv-red font-bold uppercase tracking-widest">Streaming Servers</span>
                <div className="flex flex-wrap gap-2.5">
                  {sources.map((source, index) => (
                    <button
                      key={source.name}
                      onClick={() => setActiveSource(index)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${activeSource === index
                          ? 'bg-sv-red border-sv-red text-white shadow-lg shadow-sv-red/20'
                          : 'bg-[#13131a] border-white/5 text-[#9ca3af] hover:bg-[#1c1c28] hover:text-white'
                        }`}
                    >
                      {getServerLabel(source.name)}
                    </button>
                  ))}
                </div>
              </div>

              {/* DUB selection row (only shown for Server 1 / Peachify) */}
              {activeSource === 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-sv-red font-bold uppercase tracking-widest">DUB Audio Language</span>
                  <div className="flex flex-wrap gap-2">
                    {['Hindi', 'English', 'Tamil', 'Telugu', 'Spanish', 'French'].map((dub) => (
                      <button
                        key={dub}
                        onClick={() => setSelectedDub(dub)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${selectedDub === dub
                            ? 'bg-sv-red border-sv-red text-white shadow-md shadow-sv-red/20'
                            : 'bg-[#13131a] border-white/5 text-[#9ca3af] hover:bg-[#1c1c28] hover:text-white'
                          }`}
                      >
                        {dub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggles & Selectors Row */}
              <div className="flex items-center gap-4 flex-wrap justify-between pt-2 border-t border-white/5">
                {/* Auto-Switch Toggle */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-sv-red font-bold uppercase tracking-widest">Failover Option</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-[#13131a] px-3 py-1.5 rounded-full border border-white/5 hover:bg-[#1c1c28] transition-all duration-300 font-semibold text-[10px] text-white/80 uppercase">
                    <input
                      type="checkbox"
                      checked={autoSwitch}
                      onChange={(e) => setAutoSwitch(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sv-red"></div>
                    <span>Auto Switch Server</span>
                  </label>
                </div>

                {/* Download Buttons / Mirrors — marked data-sv-safe so our ad-blocker doesn't intercept these legitimate outbound links */}
                <div className="flex flex-col gap-1.5" data-sv-safe>
                  <span className="text-[10px] text-sv-red font-bold uppercase tracking-widest">Download Options</span>
                  <div className="flex gap-2">
                    <a
                      href={type === 'movie' ? `https://dl.vidsrc.me/movie/${numericId}` : `https://dl.vidsrc.me/tv/${numericId}/${season}/${episode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#e11d48]/10 hover:bg-[#e11d48]/20 text-sv-red hover:text-white px-3.5 py-1.5 rounded-full border border-sv-red/20 hover:border-sv-red/40 transition-all font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Primary DL</span>
                    </a>
                    <a
                      href={type === 'movie' ? `https://vidsrc.xyz/embed/movie/${numericId}` : `https://vidsrc.xyz/embed/tv/${numericId}/${season}/${episode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#9ca3af] hover:text-white px-3.5 py-1.5 rounded-full border border-white/5 hover:border-white/10 transition-all font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mirror DL</span>
                    </a>
                  </div>
                </div>


                {type === 'tv' && (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-sv-red font-bold uppercase tracking-widest">Season</label>
                      <select
                        value={season}
                        onChange={(e) => {
                          setSeason(parseInt(e.target.value));
                          setEpisode(1);
                        }}
                        className="bg-[#13131a] border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none cursor-pointer hover:bg-[#1c1c28] transition-all duration-300 font-bold"
                      >
                        {seasonsData.length > 0 ? (
                          seasonsData.map((s) => (
                            <option key={s.season_number} value={s.season_number}>
                              Season {s.season_number}
                            </option>
                          ))
                        ) : (
                          <option value={season}>Season {season}</option>
                        )}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-sv-red font-bold uppercase tracking-widest">Episode</label>
                      <select
                        value={episode}
                        onChange={(e) => setEpisode(parseInt(e.target.value))}
                        className="bg-[#13131a] border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none cursor-pointer hover:bg-[#1c1c28] transition-all duration-300 font-bold"
                      >
                        {Array.from(
                          { length: seasonsData.find((s) => s.season_number === season)?.episode_count || 24 },
                          (_, i) => i + 1
                        ).map((ep) => (
                          <option key={ep} value={ep}>
                            Episode {ep}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Movie/Show metadata card */}
          {mediaDetail ? (
            <div className="bg-sv-card/40 border border-sv-border p-6 rounded-2xl space-y-4 backdrop-blur-md hover:border-sv-border-hover transition-all duration-300 shadow-md">
              <h3 className="text-base font-bold text-white border-b border-sv-border pb-2">
                About {type === 'movie' ? 'Movie' : 'Show'}
              </h3>

              {mediaDetail.tagline && (
                <p className="text-xs text-sv-text-secondary italic">"{mediaDetail.tagline}"</p>
              )}

              <div className="space-y-3">
                <div>
                  <h5 className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider">Overview</h5>
                  <p className="text-xs text-sv-text-secondary leading-relaxed mt-1">
                    {mediaDetail.overview}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider">Rating</h5>
                    <p className="text-xs text-sv-gold font-bold mt-0.5">
                      ⭐ {mediaDetail.vote_average?.toFixed(1)} / 10
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider">Release Date</h5>
                    <p className="text-xs text-white mt-0.5">
                      {type === 'movie' ? mediaDetail.release_date : mediaDetail.first_air_date}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider">Genres</h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mediaDetail.genres?.map((g: any) => (
                      <span key={g.id} className="text-[10px] text-white/80 bg-white/10 px-2.5 py-0.5 rounded font-medium">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-sv-card/40 border border-sv-border p-5 rounded-xl h-48 animate-pulse flex items-center justify-center">
              <p className="text-xs text-sv-text-muted">Loading details metadata...</p>
            </div>
          )}

          {/* Adblock helper warning */}
          <div className="bg-gradient-to-r from-sv-red/10 via-sv-red/5 to-transparent border border-sv-red/20 p-6 rounded-2xl shadow-lg hover:border-sv-red/40 transition-all duration-300">
            <div className="flex gap-4">
              <AlertCircle className="w-5 h-5 text-sv-red shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">AdBlocker Highly Recommended</h4>
                <p className="text-xs text-sv-text-secondary leading-relaxed font-medium">
                  StremioTV does not host any video content. All streams are retrieved from open third-party indexing
                  embed services. These networks may trigger redirects or popups. We highly suggest using an extension
                  like <strong className="text-sv-red">uBlock Origin</strong> or the <strong className="text-sv-red">Brave Browser</strong> to enjoy a perfectly clean, ad-free streaming experience.
                </p>
              </div>
            </div>
          </div>

          {/* TV Episodes Section - MATCHING SCREENSHOT LAYOUT */}
          {type === 'tv' && (
            <div id="episodes-section" className="space-y-4 pt-4">
              {/* Heading with vertical red bar */}
              <div className="flex items-center border-l-[3px] border-sv-red pl-3">
                <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">
                  Episodes
                </h2>
              </div>

              {/* Sub-Filters Toolbar (dropdown, search input, sort) */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-6">
                {/* Season Dropdown */}
                <div className="relative">
                  <select
                    value={season}
                    onChange={(e) => {
                      setSeason(parseInt(e.target.value));
                      setEpisode(1);
                    }}
                    className="bg-sv-card border border-sv-border rounded-xl px-4.5 py-3 text-xs text-white outline-none cursor-pointer hover:bg-sv-card-hover font-bold pr-10 appearance-none transition-all duration-300"
                  >
                    {seasonsData.length > 0 ? (
                      seasonsData.map((s) => (
                        <option key={s.season_number} value={s.season_number}>
                          Season {s.season_number}
                        </option>
                      ))
                    ) : (
                      <option value={season}>Season {season}</option>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-sv-text-muted absolute right-3.5 top-4 pointer-events-none" />
                </div>

                {/* Search box input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-sv-text-muted absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search episode..."
                    value={episodeSearch}
                    onChange={(e) => setEpisodeSearch(e.target.value)}
                    className="w-full bg-sv-card border border-sv-border rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-sv-red/50 hover:border-sv-border-hover placeholder:text-sv-text-dim font-medium transition-all duration-300"
                  />
                </div>

                {/* Sort Button */}
                <button
                  onClick={() => setEpisodeSort(episodeSort === 'asc' ? 'desc' : 'asc')}
                  className="p-3 rounded-xl bg-sv-card border border-sv-border hover:bg-sv-card-hover text-sv-text-secondary hover:text-white hover:scale-105 transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Sort episodes"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Episodes Cards Listing */}
              {episodesLoading ? (
                /* Loading skeletons */
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="w-full flex gap-4 p-4 rounded-xl border border-sv-border bg-sv-card/40 animate-pulse">
                      <div className="w-36 md:w-48 aspect-video rounded-lg bg-sv-surface flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-sv-surface rounded w-1/3" />
                        <div className="h-3 bg-sv-surface rounded w-1/4" />
                        <div className="h-3 bg-sv-surface rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                  {filteredEpisodes.map((ep) => {
                    const isCurrent = ep.episode_number === episode;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => {
                          setEpisode(ep.episode_number);
                          setIsPlaying(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex gap-4 p-5 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.015] hover:shadow-lg ${isCurrent
                            ? 'bg-sv-red/5 border-sv-red/60 shadow-[0_0_12px_rgba(225,29,72,0.15)] ring-1 ring-sv-red/25'
                            : 'bg-sv-card/40 border-sv-border hover:bg-sv-card-hover hover:border-sv-border-hover'
                          }`}
                      >
                        {/* Still Image aspect-video thumbnail */}
                        <div className="relative w-36 md:w-48 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-sv-card/80 border border-sv-border/70 shadow-md flex items-center justify-center">
                          {ep.still_path ? (
                            <img
                              src={getImageUrl(ep.still_path, 'w300')}
                              alt={ep.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/no-image.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1c1c28] to-[#13131a] flex flex-col items-center justify-center gap-1.5 p-3">
                              <Film className="w-5 h-5 text-sv-text-muted/40" />
                              <span className="text-[9px] text-sv-text-secondary font-black uppercase tracking-wider">Episode {ep.episode_number}</span>
                            </div>
                          )}
                          {/* Episode number badge at bottom-left corner */}
                          <div className="absolute bottom-2 left-2 bg-black/85 px-1.5 py-0.5 rounded text-[9px] font-black text-white border border-white/5">
                            {ep.episode_number}
                          </div>
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>

                        {/* Episode Text Info */}
                        <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center">
                          <h4 className={`text-sm md:text-base font-bold truncate ${isCurrent ? 'text-sv-red' : 'text-white'}`}>
                            {ep.name || `Episode ${ep.episode_number}`}
                          </h4>
                          <p className="text-[10px] text-sv-text-muted mt-0.5 font-bold uppercase tracking-wider">
                            {ep.runtime ? `${ep.runtime} min` : '45 min'}
                          </p>
                          <p className="text-xs text-sv-text-secondary line-clamp-2 mt-2 leading-relaxed font-medium">
                            {ep.overview || 'No description available for this episode.'}
                          </p>
                        </div>

                        {/* Far Right link Arrow/Tray icon */}
                        <div className="flex items-center shrink-0 pr-1">
                          <ArrowRight className="w-4 h-4 text-sv-text-dim hover:text-white transition-colors" />
                        </div>
                      </button>
                    );
                  })}

                  {filteredEpisodes.length === 0 && (
                    <div className="text-center py-10 bg-sv-card/20 rounded-xl border border-sv-border border-dashed p-6">
                      <p className="text-sv-text-muted text-sm font-semibold">No episodes found matching "{episodeSearch}".</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Similars Row for Movies & Shows */}
          <div id="similars-section" className="space-y-6 pt-8">
            {similar.length > 0 && (
              <>
                <div className="border-b border-sv-border pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Film className="w-5 h-5 text-sv-red" />
                    More Like This
                  </h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 lg:gap-8 pb-10">
                  {similar.map((sim: any) => (
                    <Link
                      key={sim.id}
                      href={`/detail/${type}/${sim.id}`}
                      className="group bg-[#13131a] rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 hover:scale-[1.03] transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/30"
                    >
                      <div className="aspect-[2/3] relative bg-[#13131a] overflow-hidden rounded-t-2xl">
                        <img
                          src={getImageUrl(sim.poster_path, 'w342')}
                          alt={sim.title || sim.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-bold truncate text-white group-hover:text-sv-red transition-colors">
                          {sim.title || sim.name}
                        </h4>
                        <p className="text-[10px] text-sv-text-muted mt-0.5 font-medium">
                          ⭐ {sim.vote_average?.toFixed(1) || 'N/A'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>


      {/* Dynamic modals */}
      {showJoinModal && (
        <JoinRoomModal
          movieTitle={title}
          onJoin={handleCreateRoom}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e0e12] border border-sv-red/30 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right backdrop-blur-md">
          <Loader2 className="w-4 h-4 text-sv-red animate-spin" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

function getYear(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).getFullYear().toString();
}

function getServerLabel(name: string): string {
  if (name === 'Server 1') return 'Server 1 ⭐ (Recommended - Multi-Audio)';
  if (name === 'Server 4') return 'Server 4 ⭐ (Fast & Reliable)';
  if (name === 'Server 7') return 'Server 7 ⭐ (High Quality - Low Ads)';
  if (name === 'Server 9') return 'Server 9 (Popular - Auto-Updated)';
  if (name === 'Server 11') return 'Server 11 (Dual Audio / Anime)';
  if (name === 'Server 12') return 'Server 12 (Premium Player)';
  return name;
}
