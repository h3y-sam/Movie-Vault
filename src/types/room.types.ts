export interface RoomMember {
  id: string;
  name: string;
  avatar: string; // emoji avatar e.g. "🦊"
  color: string;  // tailwind-compatible hex for name badge
  isHost: boolean;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberColor: string;
  isHost: boolean;
  text: string;
  timestamp: number;
}

export interface EmojiReaction {
  id: string;
  emoji: string;
  memberId: string;
  memberName: string;
  x: number; // 0–100 percent across the video frame
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
}

export interface RoomState {
  code: string;
  movieId: number;
  mediaType: 'movie' | 'tv';
  season: number;
  episode: number;
  title: string;
  poster: string;
  hostId: string;
  members: RoomMember[];
  messages: ChatMessage[];
  playerState: PlayerState;
  createdAt: number;
  activeSource?: number;
}

export type RoomEvent =
  | { type: 'player_play';       payload: { currentTime: number; hostId: string } }
  | { type: 'player_pause';      payload: { currentTime: number; hostId: string } }
  | { type: 'player_seek';       payload: { currentTime: number; hostId: string } }
  | { type: 'player_heartbeat';  payload: { currentTime: number; isPlaying: boolean } }
  | { type: 'server_change';     payload: { activeSource: number; hostId: string } }
  | { type: 'chat_message';      payload: ChatMessage }
  | { type: 'emoji_reaction';    payload: EmojiReaction }
  | { type: 'member_join';       payload: RoomMember }
  | { type: 'member_leave';      payload: { memberId: string } }
  | { type: 'member_kick';       payload: { targetId: string; hostId: string } }
  | { type: 'room_state';        payload: RoomState };
