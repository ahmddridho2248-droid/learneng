/**
 * Fisher-Yates (Knuth) in-place shuffle.
 * Returns a NEW shuffled array — the original is untouched.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
