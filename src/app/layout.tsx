import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Movie Vault — Your Personal Streaming Universe",
  description:
    "Discover and stream movies, TV shows, anime, and more from Netflix, Prime, Hotstar, and every platform — all in one place. Hollywood, Bollywood, Anime, K-Drama — Movie Vault has it all.",
  keywords: [
    "streaming",
    "movies",
    "TV shows",
    "anime",
    "bollywood",
    "hollywood",
    "netflix",
    "prime video",
    "hotstar",
  ],
  openGraph: {
    title: "Movie Vault",
    description: "Your Personal Netflix-Grade Streaming Discovery Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-sv-bg text-sv-text min-h-dvh antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
