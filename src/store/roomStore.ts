import { create } from 'zustand';
import type { RoomMember, ChatMessage, EmojiReaction, PlayerState, RoomState } from '@/types/room.types';

interface RoomStore {
  // Session identity
  roomCode: string | null;
  myId: string;
  myName: string;
  myAvatar: string;
  myColor: string;
  isHost: boolean;

  // Room data
  roomState: RoomState | null;
  members: RoomMember[];
  messages: ChatMessage[];
  reactions: EmojiReaction[];
  playerState: PlayerState;

  // UI state
  isPanelOpen: boolean;
  activeTab: 'chat' | 'members';

  // Sync overlay
  syncOverlay: { visible: boolean; message: string; targetTime: number } | null;

  // Actions
  setRoomCode: (code: string) => void;
  setIdentity: (id: string, name: string, avatar: string, color: string, isHost: boolean) => void;
  setRoomState: (state: RoomState) => void;
  addMember: (member: RoomMember) => void;
  removeMember: (memberId: string) => void;
  addMessage: (message: ChatMessage) => void;
  addReaction: (reaction: EmojiReaction) => void;
  removeReaction: (id: string) => void;
  setPlayerState: (state: Partial<PlayerState>) => void;
  setPanelOpen: (open: boolean) => void;
  setActiveTab: (tab: 'chat' | 'members') => void;
  setSyncOverlay: (overlay: { visible: boolean; message: string; targetTime: number } | null) => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

export const useRoomStore = create<RoomStore>((set) => ({
  roomCode: null,
  myId: generateId(),
  myName: '',
  myAvatar: '🎬',
  myColor: '#e11d48',
  isHost: false,

  roomState: null,
  members: [],
  messages: [],
  reactions: [],
  playerState: { isPlaying: false, currentTime: 0, updatedAt: Date.now() },

  isPanelOpen: true,
  activeTab: 'chat',
  syncOverlay: null,

  setRoomCode: (code) => set({ roomCode: code }),
  setIdentity: (id, name, avatar, color, isHost) =>
    set({ myId: id, myName: name, myAvatar: avatar, myColor: color, isHost }),
  setRoomState: (state) =>
    set({ roomState: state, members: state.members, messages: state.messages, playerState: state.playerState }),
  addMember: (member) =>
    set((s) => ({ members: [...s.members.filter((m) => m.id !== member.id), member] })),
  removeMember: (memberId) =>
    set((s) => ({ members: s.members.filter((m) => m.id !== memberId) })),
  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages.slice(-200), message] })),
  addReaction: (reaction) =>
    set((s) => ({ reactions: [...s.reactions.slice(-30), reaction] })),
  removeReaction: (id) =>
    set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })),
  setPlayerState: (state) =>
    set((s) => ({ playerState: { ...s.playerState, ...state } })),
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSyncOverlay: (overlay) => set({ syncOverlay: overlay }),
  reset: () =>
    set({
      roomCode: null,
      myName: '',
      isHost: false,
      roomState: null,
      members: [],
      messages: [],
      reactions: [],
      playerState: { isPlaying: false, currentTime: 0, updatedAt: Date.now() },
      isPanelOpen: true,
      syncOverlay: null,
    }),
}));
