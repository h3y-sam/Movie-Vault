'use client';

import { useEffect } from 'react';

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. Disable Developer Key Combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      
      // Ctrl + Shift + I/J/C/K
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return;
      }

      // Ctrl + S (Save Page)
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 3. Disable Images Dragging (restricts easy content scraping)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    document.addEventListener('dragstart', handleDragStart);

    // 4. Overwrite standard Console logs to prevent backend/API/payload snooping
    if (typeof window !== 'undefined') {
      // Backup original console methods just in case (optional, we choose not to keep them accessible)
      const emptyFn = () => {};
      
      // Protect logs in production and external environments
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        window.console.log = emptyFn;
        window.console.info = emptyFn;
        window.console.warn = emptyFn;
        window.console.error = emptyFn;
        window.console.debug = emptyFn;
        
        // 5. Anti-developer tools loop (pauses debugger continuously if Inspector is opened)
        const devToolsDetectorInterval = setInterval(() => {
          (function() {
            try {
              (function a(i) {
                if (("" + i / i).length !== 1 || i % 20 === 0) {
                  (function() {}).constructor("debugger")();
                } else {
                  debugger;
                }
                a(++i);
              })(0);
            } catch (e) {}
          })();
        }, 800);

        return () => {
          clearInterval(devToolsDetectorInterval);
        };
      }
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return <>{children}</>;
}
