import { Metadata } from 'next';
import { tmdb, getBackdropUrl } from '@/lib/tmdb';

interface DetailLayoutProps {
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
      const overview = detail.overview || 'Explore cast, crew, trailers, and reviews on StreamVault.';
      const backdrop = detail.backdrop_path ? getBackdropUrl(detail.backdrop_path, 'w780') : undefined;

      return {
        title: `${title} - Details, Trailer, & Cast - StreamVault`,
        description: overview.slice(0, 160),
        openGraph: {
          title: `${title} Details & Trailer - StreamVault`,
          description: overview,
          images: backdrop ? [{ url: backdrop }] : [],
          type: 'video.movie',
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate detail layout metadata:', error);
  }

  return {
    title: 'Content Details - StreamVault',
    description: 'Explore cast, crew, trailers, and reviews on StreamVault.',
  };
}

export default function DetailLayout({ children }: DetailLayoutProps) {
  return <>{children}</>;
}
