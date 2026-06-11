import { NextRequest, NextResponse } from 'next/server';
import { tmdb } from '@/lib/tmdb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, args = [] } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const tmdbFunc = (tmdb as any)[action];
    if (typeof tmdbFunc !== 'function') {
      return NextResponse.json({ error: `Method ${action} not found on TMDB client` }, { status: 404 });
    }

    const result = await tmdbFunc(...args);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('TMDB Proxy Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error during TMDB operation' },
      { status: 500 }
    );
  }
}
