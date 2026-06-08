import { NextRequest, NextResponse } from 'next/server';
import { getRoom } from '@/lib/room-store';

interface Params {
  params: Promise<{ code: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { code } = await params;
  const room = getRoom(code.toUpperCase());

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json(room);
}
