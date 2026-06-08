import Link from 'next/link';

export const metadata = {
  title: 'DMCA Notice | StremioTV',
  description: 'StremioTV DMCA notice and copyright information.',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white" style={{ paddingTop: '96px' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sv-red mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">DMCA Notice</h1>
          <p className="text-[#9ca3af] text-sm">Last updated: June 2026</p>
        </div>

        <div className="space-y-10 text-[#d1d5db] text-sm leading-relaxed">

          {/* Core disclaimer box */}
          <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6">
            <p className="text-[#9ca3af] text-xs leading-relaxed">
              <strong className="text-white">StremioTV does not host any content.</strong> StremioTV is a free, non-commercial web directory that indexes links to video content that is already freely and publicly accessible on the internet — in the same way Google or Bing indexes publicly available web pages. We do not own, store, upload, cache, reproduce, or distribute any video files. All content linked to on this platform is hosted entirely by independent third-party websites over which we have zero control.
            </p>
          </div>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">No Hosting — No Piracy</h2>
            <p>
              StremioTV is not a piracy website. We do not upload, encode, steal, sell, or distribute any copyrighted material. The video streams accessible through StremioTV are already freely available on the public internet and are hosted by third-party platforms. StremioTV merely provides a convenient directory interface to discover and access that content — similar to how a search engine works.
            </p>
            <p className="mt-3">
              We have no financial relationship with any streaming provider and do not profit from any copyrighted content.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">For Rights Holders</h2>
            <p>
              If you are a copyright holder and believe that a <strong className="text-white">link displayed on StremioTV</strong> points to infringing content hosted on a third-party platform, we encourage you to:
            </p>
            <ol className="mt-4 space-y-3 list-decimal list-inside text-[#9ca3af]">
              <li>
                <strong className="text-white">Contact the hosting platform directly</strong> — since the content is not on our servers, only the hosting platform can remove it. StremioTV has no ability to delete files that exist on third-party servers.
              </li>
              <li>
                <strong className="text-white">Contact us to delist the link</strong> — if you would like StremioTV to remove a specific link from its directory, send a written request with the details below and we will process it promptly.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">What to Include in a Delisting Request</h2>
            <ul className="space-y-2 list-disc list-inside text-[#9ca3af]">
              <li>The specific URL on StremioTV where the link appears.</li>
              <li>The copyrighted work you claim is infringed.</li>
              <li>A statement that you are the rights holder or authorized to act on their behalf.</li>
              <li>Your contact information (name and email).</li>
            </ul>
            <p className="mt-4">
              We will review and act on legitimate requests as quickly as possible.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-3">Metadata Attribution</h2>
            <p>
              All movie and TV show titles, descriptions, poster images, and backdrop images displayed on StremioTV are sourced from{' '}
              <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-sv-red hover:underline">
                The Movie Database (TMDB)
              </a>{' '}
              under their public API terms. StremioTV is not endorsed or certified by TMDB. All such metadata and imagery remains the property of TMDB and the respective studios and rights holders.
            </p>
          </section>

          <div className="bg-[#0f0f15] border border-sv-red/20 rounded-2xl p-6">
            <p className="text-[#9ca3af] text-xs leading-relaxed">
              <strong className="text-sv-red">Final note:</strong> StremioTV is built purely as a personal project and web directory. It does not generate revenue from copyrighted content, does not encourage piracy, and does not take responsibility for the actions or content of third-party websites it links to. If a third-party source is hosting content illegally, that is the sole responsibility of that platform — not StremioTV.
            </p>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-xs text-[#6b7280]">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/browse" className="hover:text-white transition-colors">← Back to Browse</Link>
        </div>
      </div>
    </div>
  );
}
