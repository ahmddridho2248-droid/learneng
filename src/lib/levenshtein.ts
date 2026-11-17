/**
 * Lightweight Levenshtein distance + similarity scoring.
 * Zero external dependencies.
 */

/** Strip punctuation, collapse whitespace, lowercase. */
export function normalize(s: string): string {
  return s
    .replace(/[^\w\s]|_/g, '')  // remove punctuation & underscores
    .replace(/\s+/g, ' ')       // collapse whitespace
    .trim()
    .toLowerCase();
}

/** Classic DP Levenshtein distance between two strings. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Use single-row optimisation for memory efficiency
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

/**
 * Returns a similarity score 0–100 (%) between two strings.
 * Both inputs are normalised first (lowercase, no punctuation).
 *
 * 100 = exact match, 0 = completely different.
 */
export function similarityScore(input: string, target: string): number {
  const a = normalize(input);
  const b = normalize(target);

  if (a === b) return 100;

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100; // both empty

  const dist = levenshtein(a, b);
  return Math.round(((maxLen - dist) / maxLen) * 100);
}
