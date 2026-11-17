<script lang="ts">
  import type { Deck } from '../types/quiz';
  import Header from './Header.svelte';
  import DeckCard from './DeckCard.svelte';

  interface Props {
    decks: Deck[];
    dueCounts: Record<string, number>;
    totalXP: number;
    onSelectDeck: (deck: Deck) => void;
  }

  let { decks, dueCounts, totalXP, onSelectDeck }: Props = $props();
</script>

<div class="flex flex-col gap-6 w-full">
  <!-- Top Header with Brand & XP -->
  <Header {totalXP} />

  <!-- Section Title -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-sm font-mono font-bold tracking-wider uppercase text-[#141413]/70">
        Study Decks
      </h2>
      <p class="text-xs font-medium text-[#141413]/50 mt-0.5">
        Spaced repetition powered by SM-2
      </p>
    </div>
    <span class="font-mono text-xs font-bold text-[#141413]/60 tabular-nums">
      {decks.length} Decks
    </span>
  </div>

  <!-- Decks List -->
  <div class="flex flex-col gap-4">
    {#each decks as deck (deck.deckId)}
      <DeckCard
        {deck}
        dueCount={dueCounts[deck.deckId] ?? 0}
        onSelect={onSelectDeck}
      />
    {/each}
  </div>

  <!-- Bottom Info Footer -->
  <div class="p-4 bg-[#EFECE6] border-2 border-[#141413] rounded-2xl shadow-[2px_2px_0px_#141413] mt-2">
    <div class="flex items-start gap-3">
      <div class="w-5 h-5 rounded-md bg-[#141413] text-white flex items-center justify-center shrink-0 mt-0.5">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <p class="text-xs font-medium text-[#141413]/80 leading-relaxed">
        Cards automatically reschedule based on review difficulty. Unstudied cards are queued first.
      </p>
    </div>
  </div>
</div>
