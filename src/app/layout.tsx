import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import SecurityProvider from "@/components/common/SecurityProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stremiostv.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'StremioTV — Watch Movies, TV Shows & Anime Free Online',
    template: '%s | StremioTV',
  },
  description:
    'StremioTV is a free streaming directory to watch movies, TV shows, anime, and Bollywood films online. No ads, no signup, no subscription — stream anything instantly.',
  keywords: [
    'watch movies online free',
    'free streaming site',
    'watch anime online free',
    'bollywood movies online',
    'hindi dubbed movies',
    'watch tv shows online',
    'no ads streaming',
    'free movie streaming 2025',
    'watch movies without signup',
    'StremioTV',
    'streaming aggregator',
    'netflix alternative free',
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'StremioTV — Watch Movies, TV Shows & Anime Free Online',
    description:
      'Free streaming directory for movies, TV shows, anime, and Bollywood. No ads, no signup. Stream anything instantly.',
    url: siteUrl,
    siteName: 'StremioTV',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StremioTV — Free Movie & TV Streaming Directory',
    description:
      'Watch movies, TV shows, and anime online for free. No ads, no account. Stream anything on StremioTV.',
    site: '@stremiostv',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StremioTV',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#e11d48" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-sv-bg text-sv-text min-h-dvh antialiased">
        <SecurityProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <MobileNav />
        </SecurityProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
