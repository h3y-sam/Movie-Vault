import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | StremioTV',
  description: 'How StremioTV handles your data and privacy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white" style={{ paddingTop: '96px' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sv-red mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-[#9ca3af] text-sm">Last updated: June 2026</p>
        </div>

        <div className="space-y-10 text-[#d1d5db] text-sm leading-relaxed">

          <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6">
            <p className="text-[#9ca3af] text-xs leading-relaxed">
              <strong className="text-white">What StremioTV is:</strong> StremioTV is a free, open web directory that indexes and links to video content that is publicly and freely available on the internet — similar to how a search engine indexes web pages. StremioTV does not host, upload, store, cache, distribute, or reproduce any video content on its own servers. We have no affiliation with any streaming provider.
            </p>
          </div>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">1. Information We Collect</h2>
            <p>
              StremioTV does not require you to create an account and does not collect any personally identifiable information — no name, email, payment detail, or IP address is stored by us. Your watchlist and preferences are saved exclusively in your own browser via <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs font-mono">localStorage</code> on your device. We have no access to this data.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">2. Third-Party Content &amp; Links</h2>
            <p>
              StremioTV provides links and embeds to video players that are freely accessible on the public internet. We do not own, operate, control, or endorse these third-party sources. Any content accessible through those links is hosted entirely by those external platforms. If you have a concern about a specific piece of content, please contact the platform hosting it directly.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">3. Metadata &amp; TMDB</h2>
            <p>
              Movie and TV show metadata, titles, posters, and backdrop images are sourced from{' '}
              <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-sv-red hover:underline">The Movie Database (TMDB)</a>{' '}
              under their public API. StremioTV is not endorsed or certified by TMDB.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">4. Cookies</h2>
            <p>
              StremioTV itself does not set tracking or advertising cookies. Third-party embedded video players may set their own cookies per their own privacy policies, which are beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">5. Analytics</h2>
            <p>
              We may use anonymized, aggregate analytics (e.g., page views) solely to understand usage patterns and improve the platform. This data cannot identify individual users.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">6. Changes</h2>
            <p>
              This policy may be updated from time to time. Continued use of StremioTV after changes are posted constitutes acceptance.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-xs text-[#6b7280]">
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
          <Link href="/browse" className="hover:text-white transition-colors">← Back to Browse</Link>
        </div>
      </div>
    </div>
  );
}
