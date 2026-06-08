'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useSettingsStore } from '@/store/settingsStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0b0b0f]/85 border-b border-white/5 transition-all duration-300"
    >
      <div
        className="flex items-center justify-between px-6 md:px-10 lg:px-16"
        style={{ height: 'var(--sv-navbar-height)' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <img
            src="/logo.png"
            alt="StremioTV Logo"
            className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-white font-extrabold text-xl tracking-tight">
            Stremio<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e11d48] to-[#f43f5e] font-black text-lg">TV</span>
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
              className={`relative py-1 text-sm font-medium transition-colors duration-200 hover:text-white flex flex-col items-center ${
                pathname === link.href
                  ? 'text-white font-semibold'
                  : 'text-[#9ca3af]'
              }`}
            >
              <span>{link.label}</span>
              {pathname === link.href && (
                <span className="absolute bottom-[-6px] w-1.5 h-1.5 rounded-full bg-sv-red animate-pulse" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Desktop Search Bar (Always visible) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
            <div className="flex items-center bg-[#13131a]/80 border border-white/5 rounded-full overflow-hidden w-60 focus-within:border-sv-red/50 focus-within:w-64 transition-all duration-300">
              <Search className="w-4 h-4 text-[#9ca3af] ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles..."
                className="bg-transparent text-xs text-white px-3 py-1.5 w-full outline-none placeholder:text-[#6b7280]"
              />
            </div>
          </form>

          {/* Mobile Search Toggle (If viewport is small) */}
          <div className="md:hidden relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="flex items-center bg-[#13131a] border border-white/10 rounded-full overflow-hidden animate-slide-in-right">
                  <Search className="w-4 h-4 text-[#9ca3af] ml-3" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent text-xs text-white px-3 py-1.5 w-32 outline-none placeholder:text-[#6b7280]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="px-2 py-1.5 text-[#6b7280] hover:text-white transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                aria-label="Open search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center cursor-pointer animate-fade-in"
              aria-label="Profile menu"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow bg-gradient-to-br transition-all duration-300 ${
                  activeProfile === 'Kids'
                    ? 'from-emerald-400 to-teal-500'
                    : 'from-sv-red to-[#f43f5e]'
                }`}
              >
                {activeProfile[0].toUpperCase()}
              </div>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#13131a] border border-white/5 shadow-xl z-20 py-1.5 animate-fade-in text-xs text-[#9ca3af]">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="font-bold text-white">Profiles</p>
                    <p className="text-[10px] text-[#6b7280] mt-0.5">
                      Vibe: {kidsMode ? 'Kids Zone' : 'Standard View'}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveProfile('Adult');
                        setProfileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 cursor-pointer ${
                        activeProfile === 'Adult' ? 'text-sv-red font-bold' : ''
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-br from-sv-red to-[#f43f5e] flex items-center justify-center text-[8px] text-white font-black">A</div>
                      <span>Adult View</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveProfile('Kids');
                        setProfileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 cursor-pointer ${
                        activeProfile === 'Kids' ? 'text-emerald-500 font-bold' : ''
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[8px] text-white font-black">K</div>
                      <span>Kids View</span>
                    </button>
                  </div>

                  <div className="border-t border-white/5 my-1" />

                  {/* Settings / Theme Toggler */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 text-white flex items-center justify-between cursor-pointer font-medium"
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
            className="lg:hidden p-2 text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
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
        <div className="lg:hidden fixed top-[var(--sv-navbar-height)] left-0 right-0 z-40 bg-[#0b0b0f] border-b border-white/5 animate-fade-in max-h-[85vh] overflow-y-auto shadow-xl">
          <div className="py-4 px-6 md:px-10 space-y-1">
            {/* Search row inside mobile menu */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="flex items-center bg-[#13131a] border border-white/5 rounded-full overflow-hidden w-full px-3.5 py-2">
                <Search className="w-4 h-4 text-[#9ca3af] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles..."
                  className="bg-transparent text-sm text-white px-3 w-full outline-none placeholder:text-[#6b7280]"
                />
              </div>
            </form>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-white bg-white/5 font-semibold'
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Settings Section */}
            <div className="border-t border-white/5 my-3 pt-3">
              <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider px-4 mb-2">Profile & Settings</p>
              
              <button
                onClick={() => {
                  setActiveProfile(activeProfile === 'Adult' ? 'Kids' : 'Adult');
                }}
                className="w-full flex items-center justify-between py-2 px-4 rounded-lg text-sm text-[#9ca3af] hover:text-white cursor-pointer"
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
                className="w-full flex items-center justify-between py-2 px-4 rounded-lg text-sm text-[#9ca3af] hover:text-white cursor-pointer"
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
