'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Film, Tv, Bookmark } from 'lucide-react';

const mobileNavItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Movies', href: '/movies', icon: Film },
  { label: 'Series', href: '/series', icon: Tv },
  { label: 'My List', href: '/watchlist', icon: Bookmark },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Hide on landing page
  if (pathname === '/') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sv-bg/95 backdrop-blur-lg border-t border-sv-border">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-sv-red'
                  : 'text-sv-text-muted hover:text-sv-text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-0 w-5 h-0.5 bg-sv-red rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
