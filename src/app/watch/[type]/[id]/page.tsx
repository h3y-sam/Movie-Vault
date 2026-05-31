'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ExternalLink, Play, Plus, Check, Loader2, Calendar, Clock, Film, Tv, Search, ArrowUpDown, Volume2, VolumeX, ArrowRight, ChevronDown } from 'lucide-react';
import { STREAM_SOURCES } from '@/lib/constants';
import { getImageUrl, getBackdropUrl, tmdb } from '@/lib/tmdb';
import { useWatchlistStore } from '@/store/watchlistStore';

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

  const [title, setTitle] = useState('Loading...');
  const [mediaDetail, setMediaDetail] = useState<any>(null);
  const [seasonsData, setSeasonsData] = useState<{ season_number: number; episode_count: number }[]>([]);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

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

  // Auto-switch failover timer effect
  useEffect(() => {
    if (!isPlaying || !autoSwitch) {
      if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
      return;
    }

    if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);

    failoverTimerRef.current = setTimeout(() => {
      const nextSourceIndex = (activeSource + 1) % sources.length;
      
      if (consecutiveTimeouts < sources.length - 1) {
        setConsecutiveTimeouts((prev) => prev + 1);
        const nextSourceName = sources[nextSourceIndex].name;
        setToastMessage(`${sources[activeSource].name} unresponsive. Auto-switching to ${nextSourceName}...`);
        setActiveSource(nextSourceIndex);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setToastMessage('All streaming servers are unresponsive. Please select a server manually or try again later.');
        setTimeout(() => setToastMessage(null), 6000);
        setConsecutiveTimeouts(0);
      }
    }, 12000); // 12-second load timeout

    return () => {
      if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
    };
  }, [activeSource, isPlaying, season, episode, autoSwitch, consecutiveTimeouts, sources]);

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
        if (type === 'movie') {
          const res = await tmdb.getMovieDetail(numericId);
          setMediaDetail(res);
          setTitle(res?.title || 'Unknown Movie');
        } else {
          const res = await tmdb.getTVDetail(numericId);
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

  // Listen for message events from VidLink, Vidking and VIDEASY players to track watch progress
  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      // Validate origin
      if (
        event.origin !== 'https://vidlink.pro' &&
        event.origin !== 'https://www.vidking.net' &&
        event.origin !== 'https://player.videasy.net'
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

      // Reset failover timer and counter on any successful message event
      if (failoverTimerRef.current) {
        clearTimeout(failoverTimerRef.current);
        failoverTimerRef.current = null;
      }
      setConsecutiveTimeouts(0);

      let progressUpdate: { currentTime: number; duration: number } | null = null;
      let isEnded = false;

      if (rawData.type === 'PLAYER_EVENT') {
        const { event: eventType, currentTime, duration, season: eventSeason, episode: eventEpisode } = rawData.data || {};
        
        if (eventType === 'ended') {
          isEnded = true;
        }
        
        if (typeof currentTime === 'number' && typeof duration === 'number' && duration > 0) {
          progressUpdate = { currentTime, duration };
        }

        // If the player itself advanced the episode/season (e.g. native next button clicked inside the iframe)
        if (type === 'tv') {
          if (typeof eventSeason === 'number' && eventSeason !== season) {
            setSeason(eventSeason);
          }
          if (typeof eventEpisode === 'number' && eventEpisode !== episode) {
            setEpisode(eventEpisode);
          }
        }
      } else if (rawData.type === 'MEDIA_DATA') {
        // Fallback for VidLink MEDIA_DATA
        const mediaData = rawData.data;
        if (mediaData) {
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
  }, [activeSource, season, episode]);

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

  const embedUrl =
    type === 'movie'
      ? (currentSource.url as (id: number) => string)(numericId)
      : (currentSource.url as (id: number, s: number, e: number) => string)(
          numericId,
          season,
          episode
        );

  const similar = mediaDetail?.similar?.results?.slice(0, 6) || [];
  const genresLabel = mediaDetail?.genres?.map((g: any) => g.name).join('   •   ') || '';

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* 1. Header Media Element: Hero details or active video player */}
      {!isPlaying ? (
        /* Stranger Things Style Info Header Backdrop Banner */
        <div
          className="relative w-full h-[65vh] md:h-[75vh] bg-cover bg-center bg-no-repeat flex items-end animate-fade-in"
          style={{
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
          <div className="relative z-10 px-4 md:px-8 lg:px-12 pb-10 w-full max-w-4xl space-y-4 text-left animate-fade-in-up">
            {/* Styled title banner */}
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md select-none">
              {title}
            </h1>

            {/* Sub-Metadata Row */}
            <div className="flex items-center gap-3.5 text-xs text-sv-text-secondary flex-wrap font-semibold">
              <span className="flex items-center gap-1 text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-xs">
                ★ {mediaDetail?.vote_average?.toFixed(1) || '8.0'}
              </span>
              <span className="text-sv-text-muted">
                {type === 'movie' ? getYear(mediaDetail?.release_date) : getYear(mediaDetail?.first_air_date)}
              </span>
              <span className="text-sv-text-dim font-light">|</span>
              <span className="text-sv-text-muted">{genresLabel}</span>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-sv-text-secondary leading-relaxed max-w-2xl font-medium line-clamp-3 md:line-clamp-4 drop-shadow">
              {mediaDetail?.overview || 'No synopsis description available.'}
            </p>

            {/* CTA action buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <button
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-2 bg-white text-black hover:bg-white/85 px-6.5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-black" />
                Play
              </button>
              
              <button
                onClick={toggleWatchlist}
                className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all cursor-pointer bg-black/30 backdrop-blur-sm ${
                  inList
                    ? 'border-sv-red text-sv-red'
                    : 'border-white/30 text-white hover:border-white'
                }`}
                aria-label="Add to watchlist"
              >
                {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>

              {type === 'tv' && (
                <button
                  onClick={() => scrollToSection('episodes-section')}
                  className="flex items-center gap-2 border border-white/20 hover:border-white text-white px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider bg-black/30 backdrop-blur-sm transition-all cursor-pointer"
                >
                  <Tv className="w-4 h-4" />
                  Episodes
                </button>
              )}

              <button
                onClick={() => scrollToSection('similars-section')}
                className="flex items-center gap-2 border border-white/20 hover:border-white text-white px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider bg-black/30 backdrop-blur-sm transition-all cursor-pointer"
              >
                <Film className="w-4 h-4" />
                Similars
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Premium Split-Screen Player Layout */
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-4 w-full">
          <div className="relative w-full lg:h-[80vh] aspect-video lg:aspect-auto bg-[#0a0a0c] border border-sv-border rounded-2xl overflow-hidden shadow-2xl shadow-black/80 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-4 h-full w-full relative">
              
              {/* Left: Video Player Column */}
              <div className={`${isSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'} relative h-full w-full bg-black flex flex-col transition-all duration-300`}>
                {/* Loading Spinner */}
                {iframeLoading && (
                  <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-10 h-10 text-sv-red animate-spin mb-3" />
                    <p className="text-sm text-sv-text font-semibold">Resolving stream link...</p>
                    <p className="text-xs text-sv-text-muted mt-1 font-medium">Source: {currentSource.name}</p>
                  </div>
                )}

                {/* Control Overlay Buttons */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white/90 hover:text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all border border-white/10 hover:bg-black/80 cursor-pointer shadow-md"
                  >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Info
                </button>

                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center gap-1.5 bg-[#18181c] text-white/90 hover:text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all border border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer shadow-md"
                  >
                    <Tv className="w-4 h-4 text-cyan-400" />
                    Open Sidebar
                  </button>
                )}
              </div>

              <iframe
                src={embedUrl}
                className="w-full h-full border-none"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={() => setIframeLoading(false)}
              ></iframe>
            </div>

            {/* Right: Collapsible Sidebar Column */}
            {isSidebarOpen && (
              <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-sv-border bg-[#101014] flex flex-col h-[50vh] lg:h-full overflow-hidden animate-fade-in relative z-20">
                
                {/* Sidebar Header */}
                <div className="p-4 border-b border-sv-border space-y-3 shrink-0 bg-[#0d0d10]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-1">
                      <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" /> Playing Now
                    </span>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Auto switch toggle switch */}
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span className="text-[9px] text-sv-text-muted font-bold uppercase tracking-wider">Auto Switch</span>
                        <input
                          type="checkbox"
                          checked={autoSwitch}
                          onChange={(e) => setAutoSwitch(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>

                      {/* Auto next toggle switch */}
                      {type === 'tv' && (
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <span className="text-[9px] text-sv-text-muted font-bold uppercase tracking-wider">Auto next</span>
                          <input
                            type="checkbox"
                            checked={autoNext}
                            onChange={(e) => setAutoNext(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                      )}
                      
                      {/* Close button */}
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-sv-text-muted hover:text-white transition-all duration-300 hover:scale-105 cursor-pointer"
                        title="Collapse sidebar"
                      >
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic inputs based on type */}
                  {type === 'tv' ? (
                    <div className="flex gap-2">
                      {/* Season select dropdown */}
                      <select
                        value={season}
                        onChange={(e) => {
                          setSeason(parseInt(e.target.value));
                          setEpisode(1);
                        }}
                        className="bg-sv-surface border border-sv-border rounded px-2.5 py-1.5 text-[11px] text-white outline-none cursor-pointer hover:bg-sv-card-hover font-semibold shrink-0"
                      >
                        {seasonsData.length > 0 ? (
                          seasonsData.map((s) => (
                            <option key={s.season_number} value={s.season_number}>
                              S{s.season_number}
                            </option>
                          ))
                        ) : (
                          <option value={season}>S{season}</option>
                        )}
                      </select>

                      {/* Search box input */}
                      <input
                        type="text"
                        placeholder="Search..."
                        value={episodeSearch}
                        onChange={(e) => setEpisodeSearch(e.target.value)}
                        className="w-full min-w-0 bg-sv-surface border border-sv-border rounded px-2 py-1 text-[11px] text-white outline-none focus:border-cyan-500/50 placeholder:text-sv-text-dim font-medium"
                      />
                    </div>
                  ) : (
                    /* Movie sidebar: Server/Source selector */
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-sv-text-muted font-bold uppercase tracking-wider">Change Server</span>
                      <select
                        value={activeSource}
                        onChange={(e) => setActiveSource(parseInt(e.target.value))}
                        className="w-full bg-sv-surface border border-sv-border rounded px-3 py-2 text-xs text-white outline-none cursor-pointer hover:bg-sv-card-hover font-bold"
                      >
                        {sources.map((source, index) => (
                          <option key={source.name} value={index}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Sidebar Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 hide-scrollbar">
                  {type === 'tv' ? (
                    filteredEpisodes.map((ep) => {
                      const isCurrent = ep.episode_number === episode;
                      const runtimeStr = ep.runtime ? `${ep.runtime}m` : '45m';

                      return (
                        <button
                          key={ep.id}
                          onClick={() => {
                            setEpisode(ep.episode_number);
                            setIframeLoading(true);
                          }}
                          className={`w-full flex gap-3 p-2.5 rounded-lg border text-left transition-all ${
                            isCurrent
                              ? 'bg-cyan-500/5 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.05)]'
                              : 'bg-sv-surface/40 border-sv-border/70 hover:bg-sv-card-hover hover:border-sv-border-hover'
                          }`}
                        >
                          {/* Left: Text detail */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isCurrent && (
                                <span className="bg-cyan-500 text-black text-[8px] font-black px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                                  Watching
                                </span>
                              )}
                              <span className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider shrink-0">
                                Ep {ep.episode_number}
                              </span>
                            </div>
                            <h4 className={`text-xs font-bold truncate mt-0.5 ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                              {ep.name || `Episode ${ep.episode_number}`}
                            </h4>
                            <p className="text-[10px] text-sv-text-secondary mt-1 line-clamp-2 leading-relaxed font-medium">
                              {ep.overview || 'No synopsis description details available.'}
                            </p>
                          </div>

                          {/* Right: Still Image */}
                          <div className="relative w-20 aspect-video rounded overflow-hidden flex-shrink-0 bg-sv-surface border border-sv-border/50">
                            <img
                              src={getImageUrl(ep.still_path || mediaDetail?.backdrop_path, 'w185')}
                              alt={ep.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/no-image.svg';
                              }}
                            />
                            <div className="absolute bottom-1 right-1 bg-black/85 px-1 py-0.2 rounded text-[7px] font-black text-white">
                              {runtimeStr}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    /* Movie similar items list */
                    <div className="space-y-3">
                      <div className="border-b border-sv-border/70 pb-2.5">
                        <span className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider">
                          More Like This
                        </span>
                      </div>
                      
                      {similar.length > 0 ? (
                        similar.map((sim: any) => (
                          <Link
                            key={sim.id}
                            href={`/detail/${type}/${sim.id}`}
                            className="flex gap-2.5 p-2 rounded-lg bg-sv-surface/40 hover:bg-sv-card-hover border border-sv-border/60 hover:border-sv-border-hover transition-all"
                          >
                            <div className="w-11 aspect-[2/3] relative bg-sv-surface rounded overflow-hidden shrink-0">
                              <img
                                src={getImageUrl(sim.poster_path, 'w185')}
                                alt={sim.title || sim.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className="text-xs font-bold text-white truncate hover:text-sv-red transition-colors">
                                {sim.title || sim.name}
                              </h4>
                              <p className="text-[10px] text-sv-gold font-semibold mt-0.5">
                                ⭐ {sim.vote_average?.toFixed(1) || '8.0'}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-sv-text-dim text-center py-4">No recommended similar movies</p>
                      )}
                    </div>
                  )}
                  
                  {type === 'tv' && filteredEpisodes.length === 0 && (
                    <p className="text-xs text-sv-text-dim text-center py-4">No episodes match search</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 2. Source Selector / Adblock warnings and layout options */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-12 mb-16 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main content drawer column (taking 2/3 space) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active player controls panel (only visible when player is active) */}
            {isPlaying && (
              <div className="bg-sv-card/45 border border-sv-border/80 p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4 backdrop-blur-md animate-fade-in shadow-xl hover:border-sv-border transition-all duration-300">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Server Sources</span>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source, index) => (
                      <button
                        key={source.name}
                        onClick={() => setActiveSource(index)}
                        className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          activeSource === index
                            ? 'bg-sv-red text-white shadow-lg shadow-sv-red/20 scale-[1.02]'
                            : 'bg-sv-surface border border-sv-border text-sv-text-secondary hover:bg-sv-card-hover hover:text-white hover:scale-[1.01]'
                        }`}
                      >
                        {source.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {/* Auto-Switch Toggle */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Failover</span>
                    <label className="flex items-center gap-2 cursor-pointer select-none bg-sv-surface px-3 py-2 rounded-xl border border-sv-border hover:bg-sv-card-hover transition-all duration-300 font-semibold text-[10px] text-white/80 uppercase">
                      <input
                        type="checkbox"
                        checked={autoSwitch}
                        onChange={(e) => setAutoSwitch(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                      <span>Auto Switch</span>
                    </label>
                  </div>

                  {type === 'tv' && (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Season</label>
                        <select
                          value={season}
                          onChange={(e) => {
                            setSeason(parseInt(e.target.value));
                            setEpisode(1);
                          }}
                          className="bg-sv-surface border border-sv-border rounded-xl px-4 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-sv-card-hover hover:border-sv-border-hover transition-all duration-300 font-bold"
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
                        <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Episode</label>
                        <select
                          value={episode}
                          onChange={(e) => setEpisode(parseInt(e.target.value))}
                          className="bg-sv-surface border border-sv-border rounded-xl px-4 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-sv-card-hover hover:border-sv-border-hover transition-all duration-300 font-bold"
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

            {/* Adblock helper warning */}
            <div className="bg-gradient-to-r from-sv-red/10 via-sv-red/5 to-transparent border border-sv-red/25 p-6 rounded-2xl shadow-lg hover:border-sv-red/45 transition-all duration-300">
              <div className="flex gap-4">
                <AlertCircle className="w-5 h-5 text-sv-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">AdBlocker Highly Recommended</h4>
                  <p className="text-xs text-sv-text-secondary leading-relaxed font-medium">
                    Movie Vault does not host any video content. All streams are retrieved from open third-party indexing 
                    embed services. These networks may trigger redirects or popups. We highly suggest using an extension 
                    like <strong className="text-cyan-400">uBlock Origin</strong> or the <strong className="text-cyan-400">Brave Browser</strong> to enjoy a perfectly clean, ad-free streaming experience.
                  </p>
                </div>
              </div>
            </div>

            {/* TV Episodes Section - MATCHING SCREENSHOT LAYOUT */}
            {type === 'tv' && (
              <div id="episodes-section" className="space-y-4 pt-4">
                {/* Heading with vertical cyan bar */}
                <div className="flex items-center border-l-[3px] border-cyan-500 pl-3">
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
                      className="w-full bg-sv-card border border-sv-border rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-cyan-500/50 hover:border-sv-border-hover placeholder:text-sv-text-dim font-medium transition-all duration-300"
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
                          className={`w-full flex gap-4 p-5 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.015] hover:shadow-lg ${
                            isCurrent
                              ? 'bg-cyan-500/5 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/25'
                              : 'bg-sv-card/40 border-sv-border hover:bg-sv-card-hover hover:border-sv-border-hover'
                          }`}
                        >
                          {/* Still Image aspect-video thumbnail */}
                          <div className="relative w-36 md:w-48 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-sv-surface border border-sv-border/70 shadow-md">
                            <img
                              src={getImageUrl(ep.still_path || mediaDetail?.backdrop_path, 'w300')}
                              alt={ep.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/no-image.svg';
                              }}
                            />
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
                            <h4 className={`text-sm md:text-base font-bold truncate ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
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
            <div id="similars-section" className="space-y-4 pt-4">
              {similar.length > 0 && (
                <>
                  <div className="border-b border-sv-border pb-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                      <Film className="w-5 h-5 text-sv-red" />
                      More Like This
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {similar.map((sim: any) => (
                      <Link
                        key={sim.id}
                        href={`/detail/${type}/${sim.id}`}
                        className="group bg-sv-card rounded-2xl overflow-hidden border border-sv-border hover:border-sv-border-hover hover:scale-[1.03] transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/30"
                      >
                        <div className="aspect-[2/3] relative bg-sv-surface overflow-hidden rounded-t-2xl">
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

          {/* Right column sidebar */}
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e0e12] border border-cyan-500/30 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right backdrop-blur-md">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
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
