/**
 * Lightweight nickname persistence using idb-keyval.
 * No auth — just a guest display name stored locally.
 */
import { get, set } from 'idb-keyval';

const NICKNAME_KEY = 'learneng-nickname';

/** Read the saved nickname, or null if not set. */
export async function getNickname(): Promise<string | null> {
  const val = await get<string>(NICKNAME_KEY);
  return val ?? null;
}

/** Save a nickname (trimmed, max 20 chars). */
export async function saveNickname(name: string): Promise<string> {
  const clean = name.trim().slice(0, 20);
  await set(NICKNAME_KEY, clean);
  return clean;
}
