'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useSettingsStore } from '@/store/settingsStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const { theme, toggleTheme, activeProfile, kidsMode, setActiveProfile } = useSettingsStore();

  // Sync theme to root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-sv-bg border-b border-sv-border shadow-lg shadow-black/10'
          : 'gradient-nav'
      }`}
    >
      <div
        className="flex items-center justify-between px-6 md:px-10 lg:px-16"
        style={{ height: 'var(--sv-navbar-height)' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-sv-red font-black text-2xl md:text-3xl tracking-tight">
            MOVIE
          </span>
          <span className="text-sv-text font-light text-2xl md:text-3xl tracking-tight">
            VAULT
          </span>
          {kidsMode && (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
              KIDS
            </span>
          )}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6 ml-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-sv-text ${
                pathname === link.href
                  ? 'text-sv-text font-semibold'
                  : 'text-sv-text-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="flex items-center bg-sv-bg border border-sv-border-hover rounded-md overflow-hidden animate-slide-in-right">
                  <Search className="w-4 h-4 text-sv-text-secondary ml-3" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Titles, people, genres..."
                    className="bg-transparent text-sm text-sv-text px-3 py-2 w-48 md:w-64 outline-none placeholder:text-sv-text-dim"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="px-2 py-2 text-sv-text-muted hover:text-sv-text transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-sv-text-secondary hover:text-sv-text transition-colors cursor-pointer"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="hidden md:block p-2 text-sv-text-secondary hover:text-sv-text transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sv-red rounded-full animate-pulse" />
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-sv-card border border-sv-border shadow-xl z-20 p-4 animate-fade-in text-xs text-sv-text-secondary space-y-3">
                  <h4 className="font-bold text-white text-sm border-b border-sv-border pb-1.5">Notifications</h4>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-2 h-2 bg-sv-red rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="text-white font-medium">New Release Available</p>
                      <p className="text-sv-text-muted mt-0.5">Stream your favorite Hollywood blockbuster now!</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="text-white font-medium">Kids Mode Activated</p>
                      <p className="text-sv-text-muted mt-0.5">Filter content to Animation and Family shows.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="hidden md:flex items-center gap-1 group cursor-pointer animate-fade-in"
              aria-label="Profile menu"
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-white shadow-inner bg-gradient-to-br transition-all duration-300 ${
                  activeProfile === 'Kids'
                    ? 'from-emerald-400 to-cyan-500'
                    : 'from-sv-red to-orange-500'
                }`}
              >
                {activeProfile[0].toUpperCase()}
              </div>
              <ChevronDown
                className={`w-3 h-3 text-sv-text-secondary transition-transform duration-300 ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-sv-card border border-sv-border shadow-xl z-20 py-2 animate-fade-in text-sm text-sv-text-secondary">
                  <div className="px-4 py-2 border-b border-sv-border">
                    <p className="font-bold text-white">Profiles</p>
                    <p className="text-xs text-sv-text-muted mt-0.5">
                      Vibe: {kidsMode ? 'Kids Zone' : 'Standard View'}
                    </p>
                  </div>

                  <div className="py-1.5">
                    <button
                      onClick={() => {
                        setActiveProfile('Adult');
                        setProfileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-sv-card-hover flex items-center gap-2 cursor-pointer ${
                        activeProfile === 'Adult' ? 'text-sv-red font-bold' : ''
                      }`}
                    >
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-sv-red to-orange-500 flex items-center justify-center text-[10px] text-white font-black">A</div>
                      <span>Adult View</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveProfile('Kids');
                        setProfileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-sv-card-hover flex items-center gap-2 cursor-pointer ${
                        activeProfile === 'Kids' ? 'text-emerald-500 font-bold' : ''
                      }`}
                    >
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[10px] text-white font-black">K</div>
                      <span>Kids View</span>
                    </button>
                  </div>

                  <div className="border-t border-sv-border my-1" />

                  {/* Settings / Theme Toggler */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-sv-card-hover text-white flex items-center justify-between cursor-pointer font-medium"
                    >
                      <span>Theme</span>
                      <span>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-sv-text-secondary hover:text-sv-text transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile Menu Drawer — rendered outside nav to avoid height clipping */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[var(--sv-navbar-height)] left-0 right-0 z-40 bg-sv-bg border-b border-sv-border animate-fade-in max-h-[85vh] overflow-y-auto shadow-xl">
          <div className="py-4 px-6 md:px-10 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-sv-text bg-white/5 font-semibold'
                    : 'text-sv-text-secondary hover:text-sv-text hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Settings Section */}
            <div className="border-t border-sv-border my-3 pt-3">
              <p className="text-[10px] text-sv-text-muted font-bold uppercase tracking-wider px-4 mb-2">Profile & Settings</p>
              
              <button
                onClick={() => {
                  setActiveProfile(activeProfile === 'Adult' ? 'Kids' : 'Adult');
                }}
                className="w-full flex items-center justify-between py-2 px-4 rounded-lg text-sm text-sv-text-secondary hover:text-white cursor-pointer"
              >
                <span>Active Profile</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black text-white ${
                  activeProfile === 'Kids' ? 'bg-emerald-500' : 'bg-sv-red'
                }`}>
                  {activeProfile.toUpperCase()}
                </span>
              </button>

              <button
                onClick={() => toggleTheme()}
                className="w-full flex items-center justify-between py-2 px-4 rounded-lg text-sm text-sv-text-secondary hover:text-white cursor-pointer"
              >
                <span>Vibe Theme</span>
                <span className="text-xs font-semibold text-white">
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
