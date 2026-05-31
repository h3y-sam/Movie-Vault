import HeroBanner from '@/components/home/HeroBanner';
import ContentRow from '@/components/home/ContentRow';
import TopTenRow from '@/components/home/TopTenRow';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';
import MoodPicker from '@/components/home/MoodPicker';
import { tmdb } from '@/lib/tmdb';

export default async function HomePage() {
  const [
    trendingRes,
    moviesRes,
    tvRes,
    topRatedRes,
    bollywoodRes,
    animeRes,
  ] = await Promise.all([
    tmdb.getTrending(),
    tmdb.getMovies(),
    tmdb.getTVShows(),
    tmdb.getTopRated(),
    tmdb.getBollywood(),
    tmdb.getAnime(),
  ]);

  const trending = trendingRes.results;
  const movies = moviesRes.results;
  const tvShows = tvRes.results;
  const topRated = topRatedRes.results;
  const bollywood = bollywoodRes.results;
  const anime = animeRes.results;

  const heroItems = trending.slice(0, 6);
  const newReleases = [...movies.slice(0, 6), ...tvShows.slice(0, 4)];
  const actionAdventure = trending.filter((item) => item.genre_ids.includes(28) || item.genre_ids.includes(12));

  return (
    <div className="min-h-screen">
      <HeroBanner items={heroItems} />

      <div className="-mt-24 relative z-10 space-y-2">
        <MoodPicker />
        <ContinueWatchingRow />

        <ContentRow
          title="🔥 Trending Now"
          items={trending}
          seeAllHref="/movies"
        />

        <TopTenRow
          title="Top 10 in India Today"
          items={[...bollywood.slice(0, 5), ...trending.slice(0, 5)]}
        />

        <ContentRow
          title="Bollywood Hits"
          items={bollywood}
          seeAllHref="/bollywood"
        />

        <ContentRow
          title="Popular TV Series"
          items={tvShows}
          seeAllHref="/series"
        />

        <ContentRow
          title="Top Rated of All Time"
          items={topRated}
          seeAllHref="/movies"
        />

        <ContentRow
          title="🎌 Anime"
          items={anime}
          seeAllHref="/anime"
        />

        <ContentRow
          title="New Arrivals"
          items={newReleases}
          seeAllHref="/movies"
        />

        {actionAdventure.length > 0 && (
          <ContentRow
            title="Action & Adventure"
            items={actionAdventure}
            seeAllHref="/movies"
          />
        )}
      </div>
    </div>
  );
}
