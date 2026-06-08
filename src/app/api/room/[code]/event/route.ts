import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoom } from '@/lib/room-store';
import { pusherServer } from '@/lib/pusher-server';
import type { RoomEvent } from '@/types/room.types';

interface Params {
  params: Promise<{ code: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const room = getRoom(upperCode);

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const event: RoomEvent = await req.json();
  const channel = `room-${upperCode}`;

  try {
    switch (event.type) {
      case 'server_change': {
        const { activeSource, hostId } = event.payload;
        if (room.hostId !== hostId) {
          return NextResponse.json({ error: 'Only the host can change servers' }, { status: 403 });
        }
        updateRoom(upperCode, (r) => ({
          ...r,
          activeSource,
        }));
        await pusherServer.trigger(channel, 'server_change', event.payload);
        break;
      }

      case 'player_play':
      case 'player_pause':
      case 'player_seek': {
        updateRoom(upperCode, (r) => ({
          ...r,
          playerState: {
            isPlaying: event.type === 'player_play',
            currentTime: event.payload.currentTime,
            updatedAt: Date.now(),
          },
        }));
        await pusherServer.trigger(channel, event.type, event.payload);
        break;
      }

      // Host broadcasts currentTime every ~20s so latecomers stay in sync
      case 'player_heartbeat': {
        updateRoom(upperCode, (r) => ({
          ...r,
          playerState: {
            ...r.playerState,
            currentTime: event.payload.currentTime,
            isPlaying: event.payload.isPlaying,
            updatedAt: Date.now(),
          },
        }));
        await pusherServer.trigger(channel, 'player_heartbeat', event.payload);
        break;
      }

      case 'chat_message': {
        updateRoom(upperCode, (r) => ({
          ...r,
          messages: [...r.messages.slice(-199), event.payload],
        }));
        await pusherServer.trigger(channel, 'chat_message', event.payload);
        break;
      }

      case 'emoji_reaction': {
        await pusherServer.trigger(channel, 'emoji_reaction', event.payload);
        break;
      }

      case 'member_join': {
        updateRoom(upperCode, (r) => ({
          ...r,
          members: [...r.members.filter((m) => m.id !== event.payload.id), event.payload],
        }));
        await pusherServer.trigger(channel, 'member_join', event.payload);

        // Send full room state so the joining guest gets movie + player position
        const updated = getRoom(upperCode);
        if (updated) {
          await pusherServer.trigger(channel, 'room_state', updated);
          // Dedicated sync event so guest's player immediately seeks to host time
          await pusherServer.trigger(channel, 'player_sync', {
            currentTime: updated.playerState.currentTime,
            isPlaying: updated.playerState.isPlaying,
            forMemberId: event.payload.id,
          });
        }
        break;
      }

      case 'member_leave': {
        updateRoom(upperCode, (r) => ({
          ...r,
          members: r.members.filter((m) => m.id !== event.payload.memberId),
        }));
        await pusherServer.trigger(channel, 'member_leave', event.payload);
        break;
      }

      // Host removes a specific member (kick)
      case 'member_kick': {
        const { targetId, hostId } = event.payload;
        if (room.hostId !== hostId) {
          return NextResponse.json({ error: 'Only the host can kick members' }, { status: 403 });
        }
        updateRoom(upperCode, (r) => ({
          ...r,
          members: r.members.filter((m) => m.id !== targetId),
        }));
        // Notify all members — kicked user will self-redirect when they receive this
        await pusherServer.trigger(channel, 'member_kick', { targetId });
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[room/event]', err);
    return NextResponse.json({ error: 'Failed to broadcast event' }, { status: 500 });
  }
}
