import { Metadata } from 'next';
import { tmdb, getBackdropUrl } from '@/lib/tmdb';

interface WatchLayoutProps {
  children: React.ReactNode;
  params: Promise<{ type: string; id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { type, id } = resolvedParams;
  const numericId = parseInt(id);

  try {
    const detail = type === 'movie'
      ? await tmdb.getMovieDetail(numericId)
      : await tmdb.getTVDetail(numericId);

    if (detail) {
      const title = type === 'movie' ? (detail as any).title : (detail as any).name;
      const overview = detail.overview || 'Stream movies, TV shows, and anime online on StreamVault.';
      const backdrop = detail.backdrop_path ? getBackdropUrl(detail.backdrop_path, 'w780') : undefined;

      return {
        title: `Watch ${title} Online - StreamVault`,
        description: overview.slice(0, 160),
        openGraph: {
          title: `Stream ${title} on StreamVault`,
          description: overview,
          images: backdrop ? [{ url: backdrop }] : [],
          type: 'video.movie',
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate watch layout metadata:', error);
  }

  return {
    title: 'Watch Online - StreamVault',
    description: 'Watch movies, TV series, anime, and more on StreamVault.',
  };
}

export default function WatchLayout({ children }: WatchLayoutProps) {
  return <>{children}</>;
}
