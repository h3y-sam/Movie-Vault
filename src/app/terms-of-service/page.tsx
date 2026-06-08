import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | StremioTV',
  description: 'The terms governing your use of StremioTV, a free web content directory.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white" style={{ paddingTop: '96px' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sv-red mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
          <p className="text-[#9ca3af] text-sm">Last updated: June 2026</p>
        </div>

        <div className="space-y-10 text-[#d1d5db] text-sm leading-relaxed">

          <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6">
            <p className="text-[#9ca3af] text-xs leading-relaxed">
              <strong className="text-white">Important:</strong> StremioTV is a <strong className="text-white">free, non-commercial web directory</strong>. It works like a search engine — it discovers, indexes, and links to video content that is already publicly and freely accessible on the internet. StremioTV does not host, store, upload, cache, distribute, sell, or reproduce any video file. We are not affiliated with any content provider, studio, broadcaster, or streaming service.
            </p>
          </div>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">1. Nature of the Service</h2>
            <p>
              StremioTV operates as an internet directory and link aggregator. When you click on a title, StremioTV embeds or redirects to a publicly available video player hosted on a third-party website — in the same way a search engine links to external web pages. StremioTV has no control over those external sources, their content, their availability, or their legal status.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">2. No Piracy — No Distribution</h2>
            <p>
              StremioTV does not engage in, facilitate, or encourage piracy of any kind. We do not reproduce, copy, or redistribute any copyrighted content. All video content linked to by StremioTV is already freely accessible on the open internet and is hosted entirely by third parties. If a third-party source is hosting content unlawfully, that is the sole responsibility of that third party.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">3. User Responsibility</h2>
            <p>
              By using StremioTV, you acknowledge that you are responsible for complying with the copyright laws applicable in your country. StremioTV does not condone the viewing of content in jurisdictions where doing so is illegal. You use StremioTV entirely at your own discretion and risk.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">4. Metadata &amp; Attribution</h2>
            <p>
              Movie and TV metadata displayed on StremioTV is sourced from{' '}
              <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-sv-red hover:underline">The Movie Database (TMDB)</a>{' '}
              via their public API. All poster images, backdrop photos, and descriptive text remain the property of their respective owners. StremioTV claims no ownership over any third-party metadata or imagery.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">5. Intellectual Property</h2>
            <p>
              The StremioTV application interface, logo, and original code are the work of the developer. All movie titles, artwork, and related intellectual property belong to their respective studios, distributors, and rights holders. StremioTV makes no claim to any of it.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">6. Limitation of Liability</h2>
            <p>
              StremioTV is provided &quot;as is&quot; without warranties of any kind. We are not liable for the content, legality, or availability of any third-party source linked to by this platform. We accept no responsibility for any action taken based on content accessed via third-party links.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">7. Modifications</h2>
            <p>
              These Terms may be updated at any time. Continued use of StremioTV after updates are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-xs text-[#6b7280]">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
          <Link href="/browse" className="hover:text-white transition-colors">← Back to Browse</Link>
        </div>
      </div>
    </div>
  );
}
