<script lang="ts">
  import type { SpeakingQuestion } from '../types/quiz';
  import { isSpeechRecognitionSupported, listen } from '../lib/speech';
  import { similarityScore } from '../lib/levenshtein';
  import { playClick } from '../lib/sound';

  interface Props {
    question: SpeakingQuestion;
    userAnswer: string;
    score: number;
    isLocked: boolean;
    onAnswerUpdate: (answer: string, score: number) => void;
  }

  let { question, userAnswer, score, isLocked, onAnswerUpdate }: Props = $props();

  let isListening = $state(false);
  let statusMessage = $state('');
  // Force fallback if STT not supported, otherwise let user toggle
  let isTypingFallback = $state(!isSpeechRecognitionSupported);

  async function handleStartRecording() {
    if (isLocked || isListening) return;
    playClick();
    isListening = true;
    statusMessage = 'Listening... Speak now';

    try {
      const result = await listen({ lang: 'en-US', timeoutMs: 9000 });
      const currentScore = similarityScore(result.transcript, question.answer);
      onAnswerUpdate(result.transcript, currentScore);
      statusMessage = '';
    } catch (err: any) {
      statusMessage = err?.message?.includes('timed out')
        ? 'Timed out. Tap mic to try again.'
        : 'Microphone not detected or permission denied.';
    } finally {
      isListening = false;
    }
  }

  function handleTextInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    const currentScore = similarityScore(val, question.answer);
    onAnswerUpdate(val, currentScore);
  }

  function toggleMode() {
    playClick();
    isTypingFallback = !isTypingFallback;
    statusMessage = '';
  }
</script>

<div class="flex flex-col gap-5 w-full">
  <!-- Prompt Card -->
  <div class="p-5 bg-white border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413]">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-mono font-bold tracking-wider text-[#141413]/60 uppercase">
        Speaking Practice
      </span>
      <span class="text-xs font-mono font-bold px-2 py-0.5 bg-[#EFECE6] border border-[#141413] rounded">
        [{question.level}]
      </span>
    </div>
    <p class="text-sm font-medium text-[#141413]/80 mb-2">{question.prompt}</p>
    <div class="text-lg font-extrabold tracking-tight text-[#141413] mb-1">
      "{question.sentence}"
    </div>
    <p class="text-xs font-medium text-[#141413]/60 italic">{question.translation}</p>
  </div>

  {#if !isTypingFallback}
    <!-- Speaking Mode -->
    <div class="flex flex-col items-center gap-4 p-6 bg-white border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413]">
      <!-- Microphone Button -->
      <button
        type="button"
        onclick={handleStartRecording}
        disabled={isLocked || isListening}
        class="w-24 h-24 rounded-full border-2 border-[#141413] flex items-center justify-center transition-all duration-100
          {isListening
            ? 'bg-[#FF5A1F] text-white animate-pulse shadow-none scale-105'
            : 'bg-[#FF5A1F] text-white shadow-[4px_4px_0px_#141413] hover:bg-[#e04f1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
          }
          {isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        "
        aria-label="Tap to record"
      >
        <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      </button>

      <span class="text-xs font-mono font-bold tracking-tight text-[#141413]/70">
        {#if isListening}
          Listening... Speak clearly in English
        {:else if statusMessage}
          {statusMessage}
        {:else if userAnswer}
          Tap mic to re-record
        {:else}
          Tap mic and speak
        {/if}
      </span>

      <!-- Transcript & Score Feedback -->
      {#if userAnswer}
        <div class="w-full mt-2 pt-3 border-t-2 border-[#141413]/10 flex flex-col gap-2">
          <div class="text-xs font-mono font-bold uppercase text-[#141413]/50">Transcribed:</div>
          <div class="p-3 bg-[#EFECE6] border-2 border-[#141413] rounded-xl text-sm font-semibold text-[#141413]">
            "{userAnswer}"
          </div>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs font-mono font-medium text-[#141413]/70">Accuracy (Target &ge; 80%)</span>
            <span class="font-mono text-sm font-extrabold tabular-nums px-2.5 py-0.5 rounded border border-[#141413]
              {score >= 80 ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'}"
            >
              {score}%
            </span>
          </div>
        </div>
      {/if}

      <!-- Fallback Switch Button -->
      <button
        type="button"
        onclick={toggleMode}
        class="mt-2 text-xs font-mono font-semibold text-[#1D4ED8] hover:underline"
      >
        Switch to typing mode
      </button>
    </div>
  {:else}
    <!-- Typing Fallback Mode -->
    <div class="flex flex-col gap-3 p-5 bg-white border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413]">
      <div class="flex items-center justify-between">
        <label for="type-input" class="text-xs font-mono font-bold uppercase tracking-wider text-[#141413]/60">
          Type the sentence:
        </label>
        {#if isSpeechRecognitionSupported}
          <button
            type="button"
            onclick={toggleMode}
            class="text-xs font-mono font-semibold text-[#1D4ED8] hover:underline"
          >
            Switch to voice
          </button>
        {/if}
      </div>

      <input
        id="type-input"
        type="text"
        value={userAnswer}
        oninput={handleTextInput}
        disabled={isLocked}
        placeholder="Type here..."
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        class="w-full px-4 py-3 bg-[#F7F5F0] border-2 border-[#141413] rounded-xl text-sm font-semibold text-[#141413] focus:outline-none focus:bg-white transition-colors"
      />

      <div class="flex items-center justify-between mt-1">
        <span class="text-xs font-mono font-medium text-[#141413]/70">Accuracy (Target &ge; 80%)</span>
        <span class="font-mono text-sm font-extrabold tabular-nums px-2.5 py-0.5 rounded border border-[#141413]
          {score >= 80 ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'}"
        >
          {score}%
        </span>
      </div>
    </div>
  {/if}
</div>
