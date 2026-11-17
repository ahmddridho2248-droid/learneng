/**
 * Browser Speech API wrapper (TTS + STT).
 * Graceful fallback when SpeechRecognition is unavailable (iOS Safari, etc.).
 * Zero external dependencies.
 */

/* ------------------------------------------------------------------ */
/*  Feature detection                                                  */
/* ------------------------------------------------------------------ */

const SpeechRecognitionCtor: typeof SpeechRecognition | undefined =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition
    : undefined;

/** `true` if the browser supports the Web Speech Recognition API. */
export const isSpeechRecognitionSupported: boolean = !!SpeechRecognitionCtor;

/** `true` if the browser supports speech synthesis (TTS). */
export const isTTSSupported: boolean =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/* ------------------------------------------------------------------ */
/*  TTS — Text-to-Speech                                               */
/* ------------------------------------------------------------------ */

export interface SpeakOptions {
  text: string;
  lang?: string;   // default 'en-US'
  rate?: number;    // 0.1 – 10, default 1
  pitch?: number;   // 0 – 2, default 1
}

/**
 * Speak the given text using the browser's speech synthesis.
 * Returns a Promise that resolves when the utterance ends.
 */
export function speak(options: SpeakOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isTTSSupported) {
      reject(new Error('SpeechSynthesis not supported'));
      return;
    }

    // Cancel any in-progress utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.lang = options.lang ?? 'en-US';
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

/* ------------------------------------------------------------------ */
/*  STT — Speech-to-Text                                               */
/* ------------------------------------------------------------------ */

export interface ListenOptions {
  lang?: string;          // default 'en-US'
  timeoutMs?: number;     // auto-stop after ms (default 8000)
}

export interface ListenResult {
  transcript: string;
  confidence: number;     // 0–1
}

/**
 * Start listening for speech and return the best transcript.
 * Rejects if SpeechRecognition is not supported or the user denies mic access.
 */
export function listen(options?: ListenOptions): Promise<ListenResult> {
  return new Promise((resolve, reject) => {
    if (!SpeechRecognitionCtor) {
      reject(new Error('SpeechRecognition not supported'));
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = options?.lang ?? 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        recognition.stop();
        reject(new Error('Speech recognition timed out'));
      }
    }, options?.timeoutMs ?? 8000);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);

      const result = event.results[0]?.[0];
      resolve({
        transcript: result?.transcript ?? '',
        confidence: result?.confidence ?? 0,
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        reject(new Error('Speech recognition ended without result'));
      }
    };

    recognition.start();
  });
}
