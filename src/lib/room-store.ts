// In-memory room storage (ephemeral, suitable for co-watching sessions)
import type { RoomState } from '@/types/room.types';

const rooms = new Map<string, RoomState>();

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

export function createRoom(state: RoomState): void {
  rooms.set(state.code, state);
  // Auto-cleanup after 8 hours
  setTimeout(() => rooms.delete(state.code), 8 * 60 * 60 * 1000);
}

export function getRoom(code: string): RoomState | undefined {
  return rooms.get(code);
}

export function updateRoom(code: string, updater: (s: RoomState) => RoomState): RoomState | null {
  const room = rooms.get(code);
  if (!room) return null;
  const updated = updater(room);
  rooms.set(code, updated);
  return updated;
}

export function deleteRoom(code: string): void {
  rooms.delete(code);
}
