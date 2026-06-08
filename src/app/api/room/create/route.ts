import { NextRequest, NextResponse } from 'next/server';
import { createRoom, generateRoomCode } from '@/lib/room-store';
import { pusherServer } from '@/lib/pusher-server';
import type { RoomMember } from '@/types/room.types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieId, mediaType, season, episode, title, poster, hostId, hostName, hostAvatar, hostColor } = body;

    if (!movieId || !mediaType || !hostId || !hostName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const code = generateRoomCode();

    const host: RoomMember = {
      id: hostId,
      name: hostName,
      avatar: hostAvatar || '🎬',
      color: hostColor || '#e11d48',
      isHost: true,
      joinedAt: Date.now(),
    };

    createRoom({
      code,
      movieId,
      mediaType,
      season: season ?? 1,
      episode: episode ?? 1,
      title: title ?? 'Unknown',
      poster: poster ?? '',
      hostId,
      members: [host],
      messages: [],
      playerState: { isPlaying: false, currentTime: 0, updatedAt: Date.now() },
      createdAt: Date.now(),
      activeSource: 0,
    });

    // Notify Pusher that a new room was created (channel will be activated on first subscription)
    await pusherServer.trigger(`room-${code}`, 'room_state', {});

    return NextResponse.json({ code });
  } catch (err) {
    console.error('[room/create]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
