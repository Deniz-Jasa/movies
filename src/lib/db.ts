import { sql } from '@vercel/postgres';

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS recently_watched (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      show_id INTEGER NOT NULL,
      media_type TEXT NOT NULL,
      watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_email, show_id, media_type)
    );
  `;
}

export async function findUserByEmail(email: string) {
  const { rows } = await sql<{ id: number; email: string; password_hash: string }>`
    SELECT id, email, password_hash FROM users WHERE email = ${email} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string) {
  const { rows } = await sql<{ id: number; email: string }>`
    INSERT INTO users (email, password_hash) VALUES (${email}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email
  `;
  return rows[0] ?? null;
}

export async function upsertRecentlyWatched(userEmail: string, showId: number, mediaType: string) {
  await sql`
    INSERT INTO recently_watched (user_email, show_id, media_type)
    VALUES (${userEmail}, ${showId}, ${mediaType})
    ON CONFLICT (user_email, show_id, media_type)
    DO UPDATE SET watched_at = NOW()
  `;
}

export type RecentlyWatchedRow = { user_email: string; show_id: number; media_type: string; watched_at: string };
export async function fetchRecentlyWatched(userEmail: string, limit = 15) {
  const { rows } = await sql<RecentlyWatchedRow>`
    SELECT user_email, show_id, media_type, watched_at
    FROM recently_watched
    WHERE user_email = ${userEmail}
    ORDER BY watched_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

export async function trimRecentlyWatched(userEmail: string, cap = 15) {
  await sql`
    DELETE FROM recently_watched
    WHERE user_email = ${userEmail}
      AND id NOT IN (
        SELECT id FROM recently_watched
        WHERE user_email = ${userEmail}
        ORDER BY watched_at DESC
        LIMIT ${cap}
      )
  `;
}


