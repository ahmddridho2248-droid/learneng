/**
 * Zero-dependency Supabase REST client.
 * Uses raw fetch against the PostgREST API — no SDK installed.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface LeaderboardEntry {
  id?: number;
  username: string;
  score: number;
  accuracy: number;
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
 * Fetch the top leaderboard entries, ordered by score descending.
 * Defaults to top 20.
 */
export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const url = `${SUPABASE_URL}/rest/v1/leaderboard?select=id,username,score,accuracy,created_at&order=score.desc&limit=${limit}`;

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
 * Submit a new score entry to the leaderboard.
 */
export async function submitScore(
  username: string,
  score: number,
  accuracy: number,
): Promise<void> {
  const url = `${SUPABASE_URL}/rest/v1/leaderboard`;

  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, score, accuracy }),
  });

  if (!res.ok) {
    throw new Error(`Score submit failed: ${res.status}`);
  }
}
