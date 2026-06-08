'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Tv, 
  Tv2, 
  Compass, 
  Sparkles, 
  Users, 
  Layers, 
  ChevronDown, 
  Play, 
  ExternalLink,
  Volume2,
  Film,
  Download
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsAndroid(/android/.test(ua));
    }
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is StremioTV (StreamVault)?",
      a: "StremioTV is a next-generation streaming aggregator that collects movie, television series, anime, and Bollywood databases into a single, high-fidelity platform. It connects with 12+ failover stream providers to bring you instant access in high resolution without premium fees."
    },
    {
      q: "How does the built-in Ad & Popup Blocker work?",
      a: "StremioTV employs an advanced, client-side click-shield system and browser-level window override blockers. This intercepts malicious redirects, popups, and click-hijacks commonly found on 3rd-party media players, ensuring a clean and seamless viewing experience."
    },
    {
      q: "Do I need to configure or install an adblocker extension?",
      a: "No! Unlike other streaming sites that require third-party browser extensions (like uBlock or AdBlock Plus), StremioTV's custom SecurityProvider blocks popups, alerts, and unauthorized redirects right out of the box directly within the web app page."
    },
    {
      q: "What are the failover servers (Server 1 to Server 12)?",
      a: "Different streaming servers can occasionally become overloaded or experience temporary downtime. StremioTV monitors stream health and implements a 12-second auto-switch failure backup system that automatically rotates to alternative working sources if the active player halts."
    },
    {
      q: "Are Hindi audio dubs and anime subtitles supported?",
      a: "Yes! StremioTV prioritizes local audio tracks. Trending blockbusters, action shows, and popular series feature toggles for Hindi Audio and English Dubs. There is also a dedicated Japanese Otaku zone for anime fans."
    },
    {
      q: "How do I watch movies and TV series synchronously with friends?",
      a: "With our 'Watch Together' feature, you can click the 'Watch Together' link on any detail page to host a synchronized room. Copy the generated code, share it with friends, and watch streams, pause, or seek synchronously in real-time."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden font-sans select-none">
      {/* Dynamic Glow Backgrounds */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-glow-purple opacity-30 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[300px] bg-[#e11d48]/10 blur-[120px] pointer-events-none z-0" />

      {/* Main Hero Container */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-36 pb-20 flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sv-red/10 to-[#8b5cf6]/10 border border-sv-red/30 px-4 py-1.5 rounded-full text-xs font-black text-sv-red mb-8 tracking-wider uppercase animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-sv-red animate-pulse" />
          No Ads • No Popups • 100% Free
        </div>

        {/* SEO Optimised Heading H1 */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] max-w-5xl mb-8">
          Stream Everything Ad-Free on <span className="text-gradient-purple">StremioTV</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#9ca3af] text-base md:text-xl max-w-2xl mb-10 leading-relaxed">
          The ultimate web streaming app. Search thousands of movies, TV series, anime, and Bollywood hits with 12+ backup servers, dual-audio tracks, and real-time synchronized rooms.
        </p>

        {/* Dynamic CTA Block */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md">
          {isAndroid ? (
            <>
              <a
                href="/stremio-tv.apk"
                download
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-black px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-[#8b5cf6]/20 hover:scale-105 cursor-pointer"
              >
                <Download className="w-4.5 h-4.5" />
                Download Android APK
              </a>
              <Link
                href="/browse"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-sm font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm"
              >
                <Play className="w-4.5 h-4.5 fill-current" />
                Stream in Browser
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/browse"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sv-red hover:bg-sv-red-hover text-white text-sm font-black px-10 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-sv-red/20 hover:scale-105 hover:shadow-sv-red/30 cursor-pointer"
              >
                <Play className="w-4.5 h-4.5 fill-current animate-pulse" />
                Start Streaming Now
              </Link>
              <a
                href="/stremio-tv.apk"
                download
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-sm font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm"
              >
                <Download className="w-4.5 h-4.5 text-sv-red" />
                Get Android APK
              </a>
            </>
          )}
        </div>

        {/* App Mockup Frame */}
        <div className="relative w-full max-w-5xl rounded-2xl border border-white/5 bg-[#13131a]/80 p-2 shadow-2xl backdrop-blur-sm animate-fade-in-up">
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black">
            {/* Real cinematic backdrop */}
            <img
              src="/mockup-backdrop.png"
              alt="StremioTV streaming preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-left max-w-xl">
              <span className="text-[10px] bg-sv-red text-white font-black px-2 py-0.5 rounded-md w-fit mb-2 tracking-wider">PREVIEW</span>
              <h3 className="text-xl md:text-3xl font-black text-white mb-2">Watch Hindi Dubbed Content Seamlessly</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                StremioTV auto-injects secure overlays to suppress player popups, loading high-quality audio dubs in full definition instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Why Streamers Choose StremioTV</h2>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            We solve the biggest frustrations of online streaming sites: aggressive ads, broken video players, and missing language tracks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ad blocker */}
          <div className="bg-[#13131a]/55 border border-white/5 rounded-2xl p-8 hover:border-sv-red/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-sv-red/10 flex items-center justify-center text-sv-red mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Built-in Click Shield</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our proprietary ad-blocking system captures ad popups, window-hijacks, and redirections, letting you stream peacefully without extra browser extensions.
            </p>
          </div>

          {/* Card 2: 12+ Failovers */}
          <div className="bg-[#13131a]/55 border border-white/5 rounded-2xl p-8 hover:border-sv-red/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] mb-6">
              <Tv2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">12+ Stream Servers</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              If a server is down or lagging, our 12-second automated load checker switches sources dynamically. Server redundancy guarantees 99.9% streaming uptime.
            </p>
          </div>

          {/* Card 3: Hindi Dubs */}
          <div className="bg-[#13131a]/55 border border-white/5 rounded-2xl p-8 hover:border-sv-red/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] mb-6">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Dual-Audio (Hindi Dubs)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Stream blockbuster films and popular television shows in your preferred language. Toggle between original English, Hindi Audio, and Japanese tracks.
            </p>
          </div>

          {/* Card 4: Watch together */}
          <div className="bg-[#13131a]/55 border border-white/5 rounded-2xl p-8 hover:border-[#8b5cf6]/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-sv-red/10 flex items-center justify-center text-sv-red mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Watch Parties (Rooms)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Host synchronized video streaming rooms. Coordinate playbacks, seeks, and pauses in real-time, matching frames perfectly with friends.
            </p>
          </div>

          {/* Card 5: Curated Zones */}
          <div className="bg-[#13131a]/55 border border-white/5 rounded-2xl p-8 hover:border-[#8b5cf6]/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Otaku & Bollywood Hubs</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Dedicated, optimized categories for Japanese anime series and Bollywood releases, sorted dynamically by popularity and rating.
            </p>
          </div>

          {/* Card 6: Watchlist Sync */}
          <div className="bg-[#13131a]/55 border border-white/5 rounded-2xl p-8 hover:border-[#8b5cf6]/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Watchlist & History</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Keep track of what you started with continue-watching progress bars, automatically saved in your local storage watchlist database.
            </p>
          </div>
        </div>
      </section>

      {/* Search Engine Optimised FAQ section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-400">Everything you need to know about streaming on StremioTV.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-[#13131a]/70 border border-white/5 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-sm md:text-base text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sv-red' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 opacity-100 border-t border-white/5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                  <p className="p-6 text-xs md:text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Action Footer Callout */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20 border-t border-white/5 text-center">
        <div className="bg-gradient-to-br from-[#13131a] to-[#0d0d12] border border-white/5 rounded-3xl p-10 md:p-16 max-w-4xl mx-auto flex flex-col items-center">
          <Film className="w-12 h-12 text-sv-red mb-6" />
          <h2 className="text-3xl md:text-5xl font-black mb-4">Ready for Seamless Streaming?</h2>
          <p className="text-sm md:text-base text-gray-400 max-w-md mb-8 leading-relaxed">
            Join thousands of users enjoying ad-free movies, TV shows, and anime today on the public stream portal.
          </p>
          <div className="flex justify-center w-full">
            {isAndroid ? (
              <a
                href="/stremio-tv.apk"
                download
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-black uppercase tracking-wider px-10 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#8b5cf6]/10 cursor-pointer hover:scale-[1.03] active:scale-95 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Android APK
              </a>
            ) : (
              <Link
                href="/browse"
                className="bg-sv-red hover:bg-sv-red-hover text-white text-xs font-black uppercase tracking-wider px-10 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-sv-red/10 cursor-pointer hover:scale-[1.03] active:scale-95"
              >
                Launch Web Portal
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
