'use client';

import { useEffect } from 'react';

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {

    // ─────────────────────────────────────────────────────────
    // AD / POPUP BLOCKER — Layer 1 (Global, applies to all pages)
    // ─────────────────────────────────────────────────────────

    // 1a. Kill window.open() — #1 mechanism 3rd-party iframes use to open popup ads.
    //     We save the original so our own "Watch Together" or legit flows still work.
    const originalOpen = window.open.bind(window);
    window.open = (..._args: Parameters<typeof window.open>): Window | null => {
      // Drop ALL calls to window.open — every 3rd party ad uses this
      return null;
    };

    // 1b. Freeze window.location on the parent so iframes can't redirect the whole
    //     page via: window.top.location = 'https://ad-site.com'
    //     This is the most dangerous iframe ad attack vector. We try to lock it down.
    try {
      const locDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
      if (locDescriptor && locDescriptor.configurable) {
        Object.defineProperty(window, 'location', {
          configurable: false,
          writable: false,
          value: window.location,
        });
      }
    } catch (_) {
      // Browser may already protect window.location — safe to ignore
    }

    // 1c. Block beforeunload hijacks — ad scripts trigger "Are you sure you want to leave?"
    //     dialogs to trap users on ad pages. We silently suppress these.
    const suppressBeforeUnload = (e: BeforeUnloadEvent) => {
      e.stopImmediatePropagation();
      return undefined;
    };
    window.addEventListener('beforeunload', suppressBeforeUnload, { capture: true });

    // 1d. Block fake <a target="_blank"> injections — some player scripts inject invisible
    //     anchor tags and synthetically click them to open new tab redirects.
    //     We intercept at capture phase (runs before any other listener).
    const blockFakeAnchorClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      if (
        anchor.target === '_blank' &&
        !anchor.closest('[data-sv-safe]') &&   // Our own safe links are marked data-sv-safe
        anchor.rel !== 'noopener noreferrer'    // Standard legitimate outbound links have this
      ) {
        const href = anchor.href || '';
        const isSameOrigin =
          href.startsWith(window.location.origin) ||
          href.startsWith('/') ||
          href.startsWith('#');
        if (!isSameOrigin) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };
    document.addEventListener('click', blockFakeAnchorClicks, { capture: true });

    // ─────────────────────────────────────────────────────────
    // UX SECURITY — Layer 2 (Dev tools / scraping protection)
    // ─────────────────────────────────────────────────────────

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
      if (e.ctrlKey && e.key.toLowerCase() === 'u') { e.preventDefault(); return; }
      if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); return; }
    };
    document.addEventListener('keydown', handleKeyDown);

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    document.addEventListener('dragstart', handleDragStart);

    const isLocalDev =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      // Also treat local network IPs as dev (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname);

    if (!isLocalDev) {
      // Suppress console output in production only
      const emptyFn = () => {};
      window.console.log = emptyFn;
      window.console.info = emptyFn;
      window.console.warn = emptyFn;
      window.console.error = emptyFn;
      window.console.debug = emptyFn;
      // Note: debugger trap removed — it freezes mobile browsers and breaks fetches
    }

    // Cleanup all listeners and restore window.open
    return () => {
      window.open = originalOpen;
      window.removeEventListener('beforeunload', suppressBeforeUnload, { capture: true });
      document.removeEventListener('click', blockFakeAnchorClicks, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return <>{children}</>;
}
