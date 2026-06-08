import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (!ACCESS_TOKEN) {
    return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
  }

  if (type !== 'movie' && type !== 'tv') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const endpoint = type === 'movie'
      ? `/movie/${id}?append_to_response=credits,videos,similar,recommendations`
      : `/tv/${id}?append_to_response=credits,videos,similar,recommendations`;

    const res = await fetch(`${TMDB_BASE}${endpoint}`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'TMDB API error' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('TMDB proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
