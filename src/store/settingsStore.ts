// Settings Store — persisted in localStorage via Zustand
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'dark' | 'light';
  kidsMode: boolean;
  activeProfile: string; // 'Adult' | 'Kids'
  language: string; // 'en' | 'hi' | 'ta' | 'te'
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleKidsMode: () => void;
  setLanguage: (lang: string) => void;
  setActiveProfile: (profile: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      kidsMode: false,
      activeProfile: 'Adult',
      language: 'en',
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: nextTheme });
        updateThemeClass(nextTheme);
      },
      setTheme: (theme) => {
        set({ theme });
        updateThemeClass(theme);
      },
      toggleKidsMode: () => set((state) => ({ kidsMode: !state.kidsMode })),
      setLanguage: (language) => set({ language }),
      setActiveProfile: (activeProfile) => {
        const isKids = activeProfile === 'Kids';
        set({ activeProfile, kidsMode: isKids });
      },
    }),
    {
      name: 'streamvault-settings',
    }
  )
);

function updateThemeClass(theme: 'dark' | 'light') {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }
}
