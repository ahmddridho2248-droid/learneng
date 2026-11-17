<script lang="ts">
  import { playClick } from '../lib/sound';

  interface Props {
    isCorrect: boolean;
    correctAnswer: string;
    translation: string;
    explanation: string;
    xpAwarded: number;
    onContinue: () => void;
  }

  let { isCorrect, correctAnswer, translation, explanation, xpAwarded, onContinue }: Props = $props();

  function handleContinue() {
    playClick();
    onContinue();
  }
</script>

<div
  class="w-full border-2 border-[#141413] rounded-2xl p-5 shadow-[4px_4px_0px_#141413] transition-all
    {isCorrect ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}"
>
  <!-- Header row with badge -->
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-2">
      <!-- Minimalist geometric icon -->
      {#if isCorrect}
        <div class="w-6 h-6 rounded-full bg-[#15803D] text-white flex items-center justify-center">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="font-extrabold text-base tracking-tight text-[#15803D]">
          Exact match
        </span>
      {:else}
        <div class="w-6 h-6 rounded-full bg-[#B91C1C] text-white flex items-center justify-center">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <span class="font-extrabold text-base tracking-tight text-[#B91C1C]">
          Watch out
        </span>
      {/if}
    </div>

    {#if isCorrect && xpAwarded > 0}
      <span class="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-[#141413] text-[#15803D] rounded-full shadow-[1px_1px_0px_#141413] tabular-nums">
        +{xpAwarded} XP
      </span>
    {/if}
  </div>

  <!-- Correct answer preview if incorrect -->
  {#if !isCorrect}
    <div class="mb-3 p-3 bg-white border-2 border-[#141413] rounded-xl">
      <span class="text-xs font-mono font-bold uppercase text-[#141413]/60 block mb-0.5">
        Correct Answer:
      </span>
      <span class="text-sm font-extrabold text-[#141413]">
        {correctAnswer}
      </span>
    </div>
  {/if}

  <!-- Translation & Explanation -->
  <div class="flex flex-col gap-1.5 mb-5 text-sm">
    <div class="text-[#141413]/80 font-medium">
      <span class="font-bold text-[#141413]">Artinya: </span>{translation}
    </div>
    <div class="text-[#141413]/90 text-xs font-medium leading-relaxed bg-white/70 p-2.5 rounded-lg border border-[#141413]/20">
      {explanation}
    </div>
  </div>

  <!-- Continue Button -->
  <button
    type="button"
    onclick={handleContinue}
    class="w-full min-h-[50px] font-extrabold text-base rounded-xl border-2 border-[#141413] shadow-[3px_3px_0px_#141413] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2
      {isCorrect
        ? 'bg-[#15803D] text-white hover:bg-[#166534]'
        : 'bg-[#141413] text-white hover:bg-[#262626]'
      }"
  >
    <span>Continue</span>
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </button>
</div>
