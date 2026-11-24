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
  try {
    // 1. Cek apakah user sudah ada di database berdasarkan nickname
    const checkUrl = `${cleanUrl}/rest/v1/leaderboard?nickname=eq.${encodeURIComponent(nickname)}&select=id`;
    const checkRes = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!checkRes.ok) {
      const errText = await checkRes.text();
      console.error('Supabase Check User Error:', errText);
      return;
    }

    const existing: Array<{ id: string | number }> = await checkRes.json();

    if (existing && existing.length > 0) {
      // 2. User ditemukan: perbarui (PATCH) nilai total_xp
      const patchUrl = `${cleanUrl}/rest/v1/leaderboard?id=eq.${existing[0].id}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ total_xp }),
      });

      if (!patchRes.ok) {
        const errText = await patchRes.text();
        console.error('Supabase PATCH Error:', errText);
      }
    } else {
      // 3. User belum ada: buat (POST) row baru
      const postUrl = `${cleanUrl}/rest/v1/leaderboard`;
      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ nickname, total_xp }),
      });

      if (!postRes.ok) {
        const errText = await postRes.text();
        console.error('Supabase POST Error:', errText);
      }
    }
  } catch (err) {
    console.error('Supabase submitScore Network Error:', err);
  }
}