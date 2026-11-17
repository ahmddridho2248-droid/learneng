/**
 * SuperMemo-2 (SM-2) spaced-repetition algorithm.
 * All state persisted via idb-keyval (IndexedDB).
 */
import { get, set } from 'idb-keyval';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UserCardProgress {
  cardId: string;
  /** SM-2 easiness factor (≥ 1.3) */
  ef: number;
  /** Current repetition count */
  repetitions: number;
  /** Current interval in days */
  interval: number;
  /** Next review date (ISO string) */
  nextReview: string;
  /** Last quality grade given (0-5) */
  lastQuality: number;
}

/* ------------------------------------------------------------------ */
/*  Constants & keys                                                   */
/* ------------------------------------------------------------------ */

const CARD_PREFIX = 'sm2:card:';
const XP_KEY = 'sm2:totalXP';

/** XP awarded per quality grade (index = quality 0-5) */
const XP_TABLE: readonly number[] = [0, 0, 5, 10, 15, 20];

/* ------------------------------------------------------------------ */
/*  Core SM-2 calculation (pure function)                              */
/* ------------------------------------------------------------------ */

/**
 * Run one SM-2 iteration and return the updated card progress.
 *
 * @param card  Current card state (or undefined for a brand-new card)
 * @param cardId  Unique card identifier
 * @param quality  Response quality 0-5 (0 = blackout, 5 = perfect)
 */
export function sm2(
  card: UserCardProgress | undefined,
  cardId: string,
  quality: number,
): UserCardProgress {
  const q = Math.min(5, Math.max(0, Math.round(quality)));

  let ef = card?.ef ?? 2.5;
  let repetitions = card?.repetitions ?? 0;
  let interval = card?.interval ?? 0;

  // EF update
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  if (q < 3) {
    // Incorrect — reset
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
  }

  const nextReview = new Date(
    Date.now() + interval * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    cardId,
    ef: parseFloat(ef.toFixed(2)),
    repetitions,
    interval,
    nextReview,
    lastQuality: q,
  };
}

/* ------------------------------------------------------------------ */
/*  IndexedDB persistence helpers                                      */
/* ------------------------------------------------------------------ */

/** Retrieve a single card's progress (or undefined if unseen). */
export async function getCardProgress(
  cardId: string,
): Promise<UserCardProgress | undefined> {
  return get<UserCardProgress>(CARD_PREFIX + cardId);
}

/** Save a card's progress to IndexedDB. */
export async function saveCardProgress(
  card: UserCardProgress,
): Promise<void> {
  await set(CARD_PREFIX + card.cardId, card);
}

/**
 * Process a review: run SM-2, persist the result, award XP.
 * Returns the updated card progress.
 */
export async function reviewCard(
  cardId: string,
  quality: number,
): Promise<UserCardProgress> {
  const existing = await getCardProgress(cardId);
  const updated = sm2(existing, cardId, quality);
  await saveCardProgress(updated);

  // Award XP
  const xp = XP_TABLE[updated.lastQuality] ?? 0;
  if (xp > 0) {
    await addXP(xp);
  }

  return updated;
}

/** Get total accumulated XP. */
export async function getTotalXP(): Promise<number> {
  return (await get<number>(XP_KEY)) ?? 0;
}

/** Add XP and persist. */
export async function addXP(amount: number): Promise<number> {
  const current = await getTotalXP();
  const next = current + amount;
  await set(XP_KEY, next);
  return next;
}
