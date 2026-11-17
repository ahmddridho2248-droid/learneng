<script lang="ts">
  import type { Deck } from '../types/quiz';
  import { playClick } from '../lib/sound';

  interface Props {
    deck: Deck;
    dueCount: number;
    onSelect: (deck: Deck) => void;
  }

  let { deck, dueCount, onSelect }: Props = $props();

  function handleClick() {
    playClick();
    onSelect(deck);
  }
</script>

<div
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
  class="w-full text-left p-5 bg-white border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413] hover:bg-[#EFECE6]/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 cursor-pointer flex flex-col justify-between gap-4"
>
  <div>
    <!-- Top badge row -->
    <div class="flex items-center justify-between mb-2">
      <span class="font-mono text-xs font-extrabold px-2 py-0.5 bg-[#FF5A1F] text-white border-2 border-[#141413] rounded shadow-[1px_1px_0px_#141413]">
        [{deck.level}]
      </span>
      <span class="font-mono text-xs font-semibold text-[#141413]/70 tabular-nums">
        {deck.questions.length} questions
      </span>
    </div>

    <!-- Title & Description -->
    <h3 class="text-lg font-extrabold tracking-tight text-[#141413] mb-1.5 leading-snug">
      {deck.title}
    </h3>
    <p class="text-xs font-medium text-[#141413]/70 leading-relaxed">
      {deck.description}
    </p>
  </div>

  <!-- Bottom status row -->
  <div class="pt-3 border-t-2 border-[#141413]/10 flex items-center justify-between">
    <div class="flex items-center gap-1.5">
      <span
        class="w-2.5 h-2.5 rounded-full border border-[#141413] {dueCount > 0 ? 'bg-[#FF5A1F]' : 'bg-[#15803D]'}"
      ></span>
      <span class="font-mono text-xs font-bold text-[#141413] tabular-nums">
        {dueCount > 0 ? `${dueCount} due today` : 'All caught up'}
      </span>
    </div>

    <span class="text-xs font-mono font-bold text-[#1D4ED8] flex items-center gap-1">
      Start
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </span>
  </div>
</div>
