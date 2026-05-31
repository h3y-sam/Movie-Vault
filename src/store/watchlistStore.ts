// Watchlist Store — persisted in localStorage via Zustand

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WatchlistItem } from '@/types/tmdb.types';

interface WatchlistState {
  items: WatchlistItem[];
  addItem: (item: WatchlistItem) => void;
  removeItem: (tmdbId: number, mediaType: 'movie' | 'tv') => void;
  isInWatchlist: (tmdbId: number, mediaType: 'movie' | 'tv') => boolean;
  clearAll: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.some(
            (i) => i.tmdbId === item.tmdbId && i.mediaType === item.mediaType
          );
          if (exists) return state;
          return { items: [item, ...state.items] };
        }),
      removeItem: (tmdbId, mediaType) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.tmdbId === tmdbId && i.mediaType === mediaType)
          ),
        })),
      isInWatchlist: (tmdbId, mediaType) =>
        get().items.some(
          (i) => i.tmdbId === tmdbId && i.mediaType === mediaType
        ),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'streamvault-watchlist',
    }
  )
);
