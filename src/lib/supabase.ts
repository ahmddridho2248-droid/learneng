// Ambil URL dan Key dari .env (pastikan di .env tidak pakai tanda kutip)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Bersihkan trailing slash (/) kalau nggak sengaja terbawa di .env
const cleanUrl = SUPABASE_URL.replace(/\/$/, '');

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  total_xp: number;
  updated_at: string;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  // Query GET ke tabel leaderboard, ambil nickname & total_xp
  const url = `${cleanUrl}/rest/v1/leaderboard?select=id,nickname,total_xp,updated_at&order=total_xp.desc&limit=${limit}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Supabase GET Error:", errText);
    throw new Error(errText); // Biar ketahuan error pastinya
  }
  return res.json();
}

export async function submitScore(nickname: string, total_xp: number): Promise<void> {
  const url = `${cleanUrl}/rest/v1/leaderboard`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    // Pastikan key-nya sesuai kolom SQL
    body: JSON.stringify({ nickname, total_xp }) 
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Supabase POST Error:", errText);
  }
}