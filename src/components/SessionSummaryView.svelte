<script lang="ts">
  import type { SessionResult } from '../types/quiz';
  import { playClick } from '../lib/sound';

  interface Props {
    result: SessionResult;
    correctMap: boolean[];
    onHome: () => void;
  }

  let { result, correctMap, onHome }: Props = $props();

  let copied = $state(false);

  function handleHome() {
    playClick();
    onHome();
  }

  function buildShareText(): string {
    const squares = correctMap.map((ok) => (ok ? '\u{1F7E9}' : '\u{1F7E5}')).join('');
    return `LearnEng \u{1F3AF} ${result.correctAnswers}/${result.totalQuestions} | ${squares}`;
  }

  async function handleShare() {
    playClick();
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Fallback: ignore silently on browsers that block clipboard
    }
  }
</script>

<div class="flex flex-col gap-6 w-full py-4 my-auto">
  <!-- Top badge -->
  <div class="text-center">
    <span class="inline-block px-3 py-1 bg-[#EFECE6] border-2 border-[#141413] rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#141413] shadow-[2px_2px_0px_#141413] mb-3">
      Session Complete
    </span>
    <h2 class="text-2xl font-extrabold tracking-tight text-[#141413]">
      Performance Summary
    </h2>
    <p class="text-xs font-medium text-[#141413]/60 mt-1">
      All cards recorded to Spaced Repetition queue
    </p>
  </div>

  <!-- Primary Stat Card -->
  <div class="p-6 bg-white border-2 border-[#141413] rounded-2xl shadow-[4px_4px_0px_#141413] text-center">
    <span class="text-xs font-mono font-bold uppercase tracking-wider text-[#141413]/60 block mb-1">
      Session Accuracy
    </span>
    <div class="text-5xl font-mono font-extrabold text-[#141413] tabular-nums tracking-tight">
      {result.accuracy}%
    </div>
    <div class="mt-4 flex items-center justify-center gap-2">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DCFCE7] border border-[#15803D] rounded-full text-xs font-mono font-bold text-[#15803D]">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{result.correctAnswers} / {result.totalQuestions} correct</span>
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 gap-3">
    <!-- XP Earned -->
    <div class="p-4 bg-white border-2 border-[#141413] rounded-xl shadow-[3px_3px_0px_#141413]">
      <span class="text-xs font-mono font-bold text-[#141413]/60 uppercase block mb-1">
        XP Earned
      </span>
      <div class="flex items-center gap-1.5 font-mono text-2xl font-bold text-[#FF5A1F] tabular-nums">
        <span>+{result.xpEarned}</span>
        <span class="text-xs font-semibold text-[#141413]">XP</span>
      </div>
    </div>

    <!-- Mistakes -->
    <div class="p-4 bg-white border-2 border-[#141413] rounded-xl shadow-[3px_3px_0px_#141413]">
      <span class="text-xs font-mono font-bold text-[#141413]/60 uppercase block mb-1">
        Review Soon
      </span>
      <div class="flex items-center gap-1.5 font-mono text-2xl font-bold text-[#B91C1C] tabular-nums">
        <span>{result.totalQuestions - result.correctAnswers}</span>
        <span class="text-xs font-semibold text-[#141413]">cards</span>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex flex-col gap-3 mt-4">
    <!-- Share Score Button -->
    <button
      type="button"
      onclick={handleShare}
      class="w-full min-h-[50px] font-extrabold text-sm bg-white text-[#141413] rounded-xl border-2 border-[#141413] shadow-[3px_3px_0px_#141413] hover:bg-[#EFECE6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2 relative"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      <span>{copied ? 'Copied!' : 'Share Score'}</span>

      {#if copied}
        <span class="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#141413] text-white text-xs font-mono font-bold rounded-lg shadow-md">
          Copied!
        </span>
      {/if}
    </button>

    <!-- Home Button -->
    <button
      type="button"
      onclick={handleHome}
      class="w-full min-h-[52px] font-extrabold text-base bg-[#FF5A1F] text-white rounded-xl border-2 border-[#141413] shadow-[3px_3px_0px_#141413] hover:bg-[#e04f1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2"
    >
      <span>Back to Decks</span>
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</div>
