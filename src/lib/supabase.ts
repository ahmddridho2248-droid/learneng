/**
 * Zero-dependency Supabase REST client.
 * Uses raw fetch against the PostgREST API — no SDK installed.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface LeaderboardEntry {
  id?: number;
  nickname: string;
  total_xp: number;
  created_at?: string;
}

function headers(): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
}

/**
 * Fetch the top leaderboard entries, ordered by total_xp descending.
 * Defaults to top 20.
 */
export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const url = `${SUPABASE_URL}/rest/v1/leaderboard?select=id,nickname,total_xp,created_at&order=total_xp.desc&limit=${limit}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`Leaderboard fetch failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Submit a new score row to the leaderboard.
 * Inserts a fresh row each time — the query fetches the highest.
 */
export async function submitScore(
  nickname: string,
  total_xp: number,
): Promise<void> {
  const url = `${SUPABASE_URL}/rest/v1/leaderboard`;

  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ nickname, total_xp }),
  });

  if (!res.ok) {
    throw new Error(`Score submit failed: ${res.status}`);
  }
}
