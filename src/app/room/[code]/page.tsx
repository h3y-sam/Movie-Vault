'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Pusher from 'pusher-js';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Share2,
  Film,
  Tv,
  ChevronDown,
} from 'lucide-react';
import { useRoomStore } from '@/store/roomStore';
import { STREAM_SOURCES } from '@/lib/constants';
import JoinRoomModal from '@/components/room/JoinRoomModal';
import InviteModal from '@/components/room/InviteModal';
import SyncOverlay from '@/components/room/SyncOverlay';
import FloatingEmoji from '@/components/room/FloatingEmoji';
import WatchPartyPanel from '@/components/room/WatchPartyPanel';

function getServerLabel(name: string): string {
  if (name === 'Server 1') return 'Server 1 ⭐ (Recommended - Multi-Audio)';
  if (name === 'Server 4') return 'Server 4 ⭐ (Fast & Reliable)';
  if (name === 'Server 7') return 'Server 7 ⭐ (High Quality - Low Ads)';
  if (name === 'Server 9') return 'Server 9 (Popular - Auto-Updated)';
  if (name === 'Server 11') return 'Server 11 (Dual Audio / Anime)';
  if (name === 'Server 12') return 'Server 12 (Premium Player)';
  return name;
}

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const code = resolvedParams.code.toUpperCase();

  const {
    myId,
    myName,
    myAvatar,
    myColor,
    isHost,
    members,
    reactions,
    syncOverlay,
    setRoomCode,
    setIdentity,
    setRoomState,
    addMember,
    removeMember,
    addMessage,
    addReaction,
    removeReaction,
    setPlayerState,
    setSyncOverlay,
    reset,
  } = useRoomStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeSource, setActiveSource] = useState(0);

  const [roomData, setRoomData] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimeRef = useRef<number>(0);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const roomDataRef = useRef<any>(null);
  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

  // ─── Load Room ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setRoomCode(code);
    fetch(`/api/room/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error('Room not found or has expired');
        return res.json();
      })
      .then((data) => {
        setRoomState(data);
        setRoomData(data);
        if (typeof data.activeSource === 'number') {
          setActiveSource(data.activeSource);
        }
        setLoading(false);

        // Check if current user is the host who just created this room
        let isUserHost = false;
        try {
          const savedHost = localStorage.getItem('streamvault-host-identity');
          if (savedHost) {
            const parsed = JSON.parse(savedHost);
            if (parsed && parsed.id === data.hostId) {
              setIdentity(parsed.id, parsed.name, parsed.avatar, parsed.color, true);
              isUserHost = true;
            }
          }
        } catch (e) {
          console.error('Error parsing host identity:', e);
        }

        if (!isUserHost) {
          setShowJoinModal(true);
        } else {
          setShowJoinModal(false);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load Watch Party');
        setLoading(false);
      });

    return () => {
      if (pusherRef.current) pusherRef.current.disconnect();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      reset();
    };
  }, [code]);

  // ─── PostMessage helper ──────────────────────────────────────────────────────
  const postToIframe = useCallback((type: string, time?: number) => {
    if (!iframeRef.current) return;
    try {
      const win = iframeRef.current.contentWindow;
      if (!win) return;

      // 1. Standard stringified event
      win.postMessage(JSON.stringify({ event: type, value: time }), '*');

      // 2. Standard object event
      win.postMessage({ event: type, value: time }, '*');

      // 3. EmbedMaster command format
      win.postMessage(
        {
          source: 'embedmaster_player_command',
          command: type === 'play' || type === 'pause' || type === 'seek' ? type : 'seek',
          value: time,
        },
        '*'
      );

      // 4. VidLink command format
      if (type === 'seek' && typeof time === 'number') {
        win.postMessage({ type: 'SEEK', data: { time } }, '*');
      }
    } catch {
      // Cross-origin iframe — postMessage cannot control seek/play
    }
  }, []);

  // ─── Dispatch Pusher event via API ───────────────────────────────────────────
  const dispatchEvent = useCallback((type: string, payload: any) => {
    fetch(`/api/room/${code}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
  }, [code]);

  // ─── Kick member (host only) ─────────────────────────────────────────────────
  const handleKick = useCallback((targetId: string) => {
    dispatchEvent('member_kick', { targetId, hostId: myId });
  }, [dispatchEvent, myId]);

  // ─── Connect to Pusher after identity is set ─────────────────────────────────
  const showSyncNotification = useCallback((message: string, targetTime: number) => {
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    setSyncOverlay({
      visible: true,
      message,
      targetTime,
    });
    overlayTimeoutRef.current = setTimeout(() => {
      setSyncOverlay(null);
    }, 4000);
  }, [setSyncOverlay]);

  useEffect(() => {
    if (!myName) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    });
    pusherRef.current = pusher;
    const channel = pusher.subscribe(`room-${code}`);

    // Member events
    channel.bind('member_join', (member: any) => addMember(member));
    channel.bind('member_leave', ({ memberId }: any) => removeMember(memberId));

    // Kicked — eject this user if they are the target
    channel.bind('member_kick', ({ targetId }: any) => {
      if (targetId === myId) {
        reset();
        router.replace('/');
      } else {
        removeMember(targetId);
      }
    });

    // Full room state (sent when a new member joins)
    channel.bind('room_state', (state: any) => {
      if (state?.code) {
        setRoomState(state);
        setRoomData(state);
        if (typeof state.activeSource === 'number') {
          setActiveSource(state.activeSource);
        }
      }
    });

    channel.bind('server_change', (payload: any) => {
      if (payload.hostId !== myId) {
        setActiveSource(payload.activeSource);
        const currentMediaType = roomDataRef.current?.mediaType || 'movie';
        const updatedSources = currentMediaType === 'movie' ? STREAM_SOURCES.movie : STREAM_SOURCES.tv;
        const serverName = updatedSources?.[payload.activeSource]?.name || `Server ${payload.activeSource + 1}`;
        showSyncNotification(`Host changed streaming server to ${serverName}`, lastTimeRef.current);
      }
    });

    // Chat & reactions
    channel.bind('chat_message', (msg: any) => addMessage(msg));
    channel.bind('emoji_reaction', (reaction: any) => addReaction(reaction));

    // ── Player sync events ──

    // player_sync: emitted right after a new member joins → seek everyone to same point
    channel.bind('player_sync', (payload: any) => {
      if (!isHost && payload.currentTime > 0) {
        lastTimeRef.current = payload.currentTime;
        postToIframe('seek', payload.currentTime);
        if (payload.isPlaying) postToIframe('play', payload.currentTime);
        showSyncNotification('Synced timeline to party position', payload.currentTime);
      }
    });

    // player_heartbeat: periodic pulse from host so guests drift < 20s
    channel.bind('player_heartbeat', (payload: any) => {
      if (!isHost) {
        const delta = Math.abs((payload.currentTime || 0) - lastTimeRef.current);
        if (delta > 8) {
          lastTimeRef.current = payload.currentTime;
          postToIframe('seek', payload.currentTime);
          if (payload.isPlaying) postToIframe('play', payload.currentTime);
          showSyncNotification(`Timeline synced to host position`, payload.currentTime);
        }
      }
    });

    channel.bind('player_play', (payload: any) => {
      if (payload.hostId !== myId) {
        setPlayerState({ isPlaying: true, currentTime: payload.currentTime });
        lastTimeRef.current = payload.currentTime;
        postToIframe('seek', payload.currentTime);
        postToIframe('play', payload.currentTime);
        showSyncNotification('Party is playing', payload.currentTime);
      }
    });

    channel.bind('player_pause', (payload: any) => {
      if (payload.hostId !== myId) {
        setPlayerState({ isPlaying: false, currentTime: payload.currentTime });
        lastTimeRef.current = payload.currentTime;
        postToIframe('pause', payload.currentTime);
        showSyncNotification('Party paused the video', payload.currentTime);
      }
    });

    channel.bind('player_seek', (payload: any) => {
      if (payload.hostId !== myId) {
        setPlayerState({ currentTime: payload.currentTime });
        lastTimeRef.current = payload.currentTime;
        postToIframe('seek', payload.currentTime);
        showSyncNotification('Party skipped to a different position', payload.currentTime);
      }
    });

    // ── Send join event ──
    dispatchEvent('member_join', {
      id: myId,
      name: myName,
      avatar: myAvatar,
      color: myColor,
      isHost,
      joinedAt: Date.now(),
    });

    // ── Host heartbeat: broadcast currentTime every 20s ──
    if (isHost) {
      heartbeatRef.current = setInterval(() => {
        dispatchEvent('player_heartbeat', {
          currentTime: lastTimeRef.current,
          isPlaying: true,
          hostId: myId,
        });
      }, 20000);
    }

    // ── Track postMessage events FROM iframe to update lastTimeRef ──
    const onIframeMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        let time = 0;
        let eventType = '';
        let hasProgress = false;

        const roomInfo = roomDataRef.current;
        if (data.type === 'MEDIA_DATA' && roomInfo) {
          const mediaData = data.data;
          if (mediaData) {
            const movieId = roomInfo.movieId;
            const peachifyEntry = mediaData[movieId] ?? mediaData[String(movieId)];
            if (peachifyEntry) {
              if (roomInfo.mediaType === 'movie' && peachifyEntry.progress) {
                time = peachifyEntry.progress.watched;
                hasProgress = true;
              } else if (roomInfo.mediaType === 'tv' && peachifyEntry.show_progress) {
                const key = `s${roomInfo.season ?? 1}e${roomInfo.episode ?? 1}`;
                const epProgress = peachifyEntry.show_progress[key]?.progress;
                if (epProgress) {
                  time = epProgress.watched;
                  hasProgress = true;
                }
              }
            } else {
              if (roomInfo.mediaType === 'movie' && mediaData.progress) {
                time = mediaData.progress.watched;
                hasProgress = true;
              } else if (roomInfo.mediaType === 'tv' && mediaData.show_progress) {
                const key = `s${roomInfo.season ?? 1}e${roomInfo.episode ?? 1}`;
                const epProgress = mediaData.show_progress[key]?.progress;
                if (epProgress) {
                  time = epProgress.watched;
                  hasProgress = true;
                }
              }
            }
          }
        }

        if (hasProgress) {
          eventType = 'progress';
        } else if (data.type === 'PLAYER_EVENT') {
          time = data.data?.currentTime;
          eventType = data.data?.event;
        } else if (data.source === 'embedmaster_player') {
          time = data.info?.currentTime || data.info?.seconds;
          eventType = data.event;
        } else {
          time = data.currentTime ?? data.time;
          eventType = data.event || '';
        }

        if (typeof time === 'number' && !isNaN(time)) {
          const delta = Math.abs(time - lastTimeRef.current);
          if (isHost) {
            if (eventType === 'play') {
              dispatchEvent('player_play', { currentTime: time, hostId: myId });
            } else if (eventType === 'pause') {
              dispatchEvent('player_pause', { currentTime: time, hostId: myId });
            } else if (eventType === 'seeked' || eventType === 'seek' || delta > 5) {
              if (delta > 5) {
                dispatchEvent('player_seek', { currentTime: time, hostId: myId });
              }
            }
          }
          lastTimeRef.current = time;
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('message', onIframeMessage);

    // ── Leave on unload ──
    const handleUnload = () => {
      navigator.sendBeacon(
        `/api/room/${code}/event`,
        JSON.stringify({ type: 'member_leave', payload: { memberId: myId } })
      );
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('message', onIframeMessage);
      handleUnload();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      pusher.unsubscribe(`room-${code}`);
    };
  }, [myName, isHost, code, myId, dispatchEvent, addMember, removeMember, reset, router, setRoomState, addMessage, addReaction, setPlayerState, showSyncNotification]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSendMessage = (text: string) => {
    dispatchEvent('chat_message', {
      id: Math.random().toString(36).slice(2, 11),
      memberId: myId,
      memberName: myName,
      memberAvatar: myAvatar,
      memberColor: myColor,
      isHost,
      text,
      timestamp: Date.now(),
    });
  };

  const handleSendReaction = (emoji: string) => {
    dispatchEvent('emoji_reaction', {
      id: Math.random().toString(36).slice(2, 11),
      emoji,
      memberId: myId,
      memberName: myName,
      x: 10 + Math.random() * 80,
    });
  };

  const handleSyncPlayer = () => {
    if (syncOverlay) {
      postToIframe('seek', syncOverlay.targetTime);
      postToIframe('play', syncOverlay.targetTime);
      setSyncOverlay(null);
    }
  };

  const handleLeave = () => {
    const mediaType = roomData?.mediaType || 'movie';
    const movieId = roomData?.movieId || '';
    dispatchEvent('member_leave', { memberId: myId });
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    reset();
    router.push(`/watch/${mediaType}/${movieId}`);
  };

  // ─── Embed URL ───────────────────────────────────────────────────────────────
  const sources = roomData?.mediaType === 'movie' ? STREAM_SOURCES.movie : STREAM_SOURCES.tv;
  const sourceObj = sources?.[activeSource];
  const embedUrl = sourceObj && roomData
    ? (sourceObj as any).url(roomData.movieId, roomData.season ?? 1, roomData.episode ?? 1)
    : '';

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-sv-red animate-spin mb-3" />
        <p className="text-sm text-gray-400">Loading Watch Party…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-sv-red mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Failed to join Watch Party</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">{error}</p>
        <Link
          href="/join"
          className="px-5 py-2.5 bg-sv-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
        >
          Try another room
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040508] text-white flex flex-col h-screen overflow-hidden">

      {/* ── Navbar ── */}
      <header className="px-4 py-3 bg-[#0d111d] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all shrink-0 font-semibold text-xs border border-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Leave Party</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {roomData?.title}
            </h1>
            <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
              {roomData?.mediaType === 'movie'
                ? <Film className="w-3 h-3" />
                : <Tv className="w-3 h-3" />}
              <span className="uppercase font-semibold tracking-wider text-sv-red">
                {roomData?.mediaType}
              </span>
              {roomData?.mediaType === 'tv' && (
                <span>• S{roomData.season} E{roomData.episode}</span>
              )}
              <span className="text-gray-600">•</span>
              <span className="font-mono font-bold tracking-widest text-gray-300">
                {code}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isHost ? (
            <div className="relative shrink-0">
              <select
                value={activeSource}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setActiveSource(val);
                  dispatchEvent('server_change', { activeSource: val, hostId: myId });
                }}
                className="bg-[#13131a] border border-white/10 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-gray-300 outline-none cursor-pointer hover:bg-white/10 hover:text-white appearance-none transition-all"
              >
                {sources.map((s, idx) => (
                  <option key={s.name} value={idx} className="bg-[#0d111d] text-white">
                    {getServerLabel(s.name)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold rounded-lg shrink-0">
              Server: {sources[activeSource]?.name || `Server ${activeSource + 1}`}
            </div>
          )}

          <Link
            href="/join"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold rounded-lg transition-all"
          >
            Join Another
          </Link>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sv-red text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>
      </header>

      {/* ── Main Area ── */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Video Player */}
        <div className="flex-1 flex flex-col relative h-full bg-black min-w-0">
          <div className="relative w-full h-full">
            {embedUrl ? (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                allowFullScreen
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sv-red animate-spin" />
              </div>
            )}

            {/* Sync Overlay */}
            <AnimatePresence>
              {syncOverlay?.visible && (
                <SyncOverlay
                  message={syncOverlay.message}
                  targetTime={syncOverlay.targetTime}
                  onSync={handleSyncPlayer}
                  onDismiss={() => setSyncOverlay(null)}
                />
              )}
            </AnimatePresence>

            {/* Floating Reactions */}
            <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none z-30 overflow-hidden">
              {reactions.map((r) => (
                <FloatingEmoji
                  key={r.id}
                  id={r.id}
                  emoji={r.emoji}
                  x={r.x}
                  onDone={removeReaction}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Chat & Members Panel */}
        <WatchPartyPanel
          onSendMessage={handleSendMessage}
          onSendReaction={handleSendReaction}
          onKickMember={handleKick}
          onLeaveRoom={handleLeave}
        />
      </div>

      {/* ── Modals ── */}
      {showJoinModal && (
        <JoinRoomModal
          roomCode={code}
          movieTitle={roomData?.title}
          onJoin={(name, avatar, color) => {
            const isFirst = members.length === 0;
            setIdentity(myId, name, avatar, color, isFirst);
            setShowJoinModal(false);
          }}
          onClose={() => router.push('/')}
        />
      )}

      {showInviteModal && (
        <InviteModal
          roomCode={code}
          movieTitle={roomData?.title || ''}
          memberCount={members.length}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
