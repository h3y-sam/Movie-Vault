'use client';

import Link from 'next/link';
import { useSettingsStore } from '@/store/settingsStore';

export default function Footer() {
  const { theme, toggleTheme, language, setLanguage } = useSettingsStore();

  const footerLinks = [
    {
      title: 'Navigate',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Movies', href: '/movies' },
        { label: 'TV Series', href: '/series' },
        { label: 'Anime', href: '/anime' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { label: 'Bollywood', href: '/bollywood' },
        { label: 'Hollywood', href: '/movies' },
        { label: 'K-Drama', href: '/series' },
        { label: 'Documentaries', href: '/movies' },
      ],
    },
    {
      title: 'Account & Vibe',
      links: [
        { label: 'My Watchlist', href: '/watchlist' },
        {
          label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
          href: '#',
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            toggleTheme();
          }
        },
        { label: 'Privacy Policy', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-sv-bg border-t border-sv-border mt-20 pb-24 md:pb-8">
      <div className="sv-container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sv-text-secondary text-xs font-bold uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-sv-text-muted text-sm hover:text-sv-text transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 text-left font-medium"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sv-text-muted text-sm hover:text-sv-text transition-colors duration-200 font-medium"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Brand Column */}
          <div>
            <h3 className="text-sv-text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              StremioTV
            </h3>
            <p className="text-sv-text-muted text-sm leading-relaxed font-medium">
              Your personal streaming universe. All movies, all series, all in one place.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sv-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="StremioTV Logo" className="w-9 h-9 object-contain" />
              <div className="flex items-center gap-0.5">
                <span className="text-white font-black text-lg">STREMIO</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e11d48] to-[#f43f5e] font-black text-lg">TV</span>
              </div>
            </div>



            {/* TMDB Attribution */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#032541] px-3 py-1.5 rounded-md">
                <svg width="20" height="18" viewBox="0 0 185.04 133.4" fill="none">
                  <linearGradient id="tmdb-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#90cea1" />
                    <stop offset="50%" stopColor="#3cbec9" />
                    <stop offset="100%" stopColor="#00b3e5" />
                  </linearGradient>
                  <circle cx="92.52" cy="66.7" r="50" stroke="url(#tmdb-gradient)" strokeWidth="8" fill="none" />
                </svg>
                <span className="text-white text-xs font-bold">TMDB</span>
              </div>
            </div>

            {/* Copyright & Credit */}
            <div className="flex flex-col items-center md:items-end gap-1.5">
              <p className="text-sv-text-dim text-xs text-center md:text-right font-medium">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
              <p className="text-sv-red text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                Made with <span className="text-sv-red animate-pulse">❤️</span> by h3y-Sam
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
