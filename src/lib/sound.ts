/**
 * Synthesised sound effects via Web Audio API.
 * Zero external MP3 assets — all sounds are generated procedurally.
 */

let _ctx: AudioContext | undefined;

/** Lazily initialise a shared AudioContext (must be called after user gesture). */
function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext();
  }
  return _ctx;
}

/**
 * Resume the AudioContext if suspended (browsers require a user gesture).
 * Call this once on the first tap/click.
 */
export async function resumeAudio(): Promise<void> {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/* ------------------------------------------------------------------ */
/*  Mechanical click                                                   */
/* ------------------------------------------------------------------ */

/**
 * Short, dry mechanical click — mimics a tactile button press.
 * ~15 ms burst of shaped noise.
 */
export function playClick(): void {
  const ctx = getCtx();
  const duration = 0.015;
  const now = ctx.currentTime;

  // White-noise buffer
  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // High-pass to remove boominess → crisp click
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;

  // Envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(hp).connect(gain).connect(ctx.destination);
  source.start(now);
  source.stop(now + duration);
}

/* ------------------------------------------------------------------ */
/*  Correct chime (ascending two-tone)                                 */
/* ------------------------------------------------------------------ */

/**
 * Bright ascending two-note chime for correct answers.
 * C6 → E6, ~180 ms total.
 */
export function playCorrect(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const notes = [1046.5, 1318.5]; // C6, E6
  const noteDuration = 0.09;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const start = now + i * noteDuration;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration * 1.6);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + noteDuration * 1.8);
  });
}

/* ------------------------------------------------------------------ */
/*  Wrong buzz (low descending tone)                                   */
/* ------------------------------------------------------------------ */

/**
 * Short low-frequency buzz for incorrect answers.
 * ~120 ms, slight downward pitch bend.
 */
export function playWrong(): void {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const duration = 0.12;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}
