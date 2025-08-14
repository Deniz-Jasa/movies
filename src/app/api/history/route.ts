import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { fetchRecentlyWatched, trimRecentlyWatched, upsertRecentlyWatched } from '@/lib/db';
import MovieService from '@/services/MovieService';
import { MediaType, type Show } from '@/types';

async function getUserEmailFromCookie() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload } = await jwtVerify(token, secret);
    return (payload.email as string) ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const email = await getUserEmailFromCookie();
  if (!email) return NextResponse.json({ shows: [] });
  const rows = await fetchRecentlyWatched(email, 15);
  const detailsPromises = rows.map(async (row) => {
    try {
      if (row.media_type === MediaType.TV || row.media_type === 'tv') {
        const res = await MovieService.findTvSeries(row.show_id);
        return res.data as Show;
      }
      const res = await MovieService.findMovie(row.show_id);
      return res.data as Show;
    } catch {
      return null;
    }
  });
  const details = await Promise.all(detailsPromises);
  const shows = details
    .map((s, i) => {
      if (!s) return null;
      // ensure media_type is present for client routing
      const media = rows[i]?.media_type === MediaType.TV || rows[i]?.media_type === 'tv' ? MediaType.TV : MediaType.MOVIE;
      (s as Show).media_type = media;
      return s as Show;
    })
    .filter(Boolean) as Show[];
  return NextResponse.json({ shows });
}

export async function POST(req: Request) {
  const email = await getUserEmailFromCookie();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { showId, mediaType } = await req.json();
  if (!showId || !mediaType) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  await upsertRecentlyWatched(email, Number(showId), String(mediaType));
  await trimRecentlyWatched(email, 15);
  return NextResponse.json({ success: true });
}


