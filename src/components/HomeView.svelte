<script lang="ts">
  import type { Deck } from '../types/quiz';
  import Header from './Header.svelte';
  import DeckCard from './DeckCard.svelte';
  import { playClick } from '../lib/sound';

  interface Props {
    decks: Deck[];
    dueCounts: Record<string, number>;
    totalXP: number;
    nickname: string | null;
    onSelectDeck: (deck: Deck) => void;
    onOpenLeaderboard?: () => void;
    onSaveNickname: (name: string) => void;
  }

  let { decks, dueCounts, totalXP, nickname, onSelectDeck, onOpenLeaderboard, onSaveNickname }: Props = $props();

  let inputValue = $state('');
  let shakeError = $state(false);

  function handleSave() {
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      shakeError = true;
      setTimeout(() => (shakeError = false), 500);
      return;
    }
    playClick();
    onSaveNickname(trimmed);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
  }
</script>

<div class="flex flex-col gap-6 w-full">
  <!-- Top Header with Brand & XP -->
  <Header {totalXP} {onOpenLeaderboard} />

  {#if !nickname}
    <!-- Nickname Input Screen -->
    <div class="flex flex-col items-center justify-center gap-6 py-12 my-auto">
      <!-- Icon -->
      <div class="w-14 h-14 rounded-2xl bg-[#FF5A1F] border-2 border-[#141413] shadow-[3px_3px_0px_#141413] flex items-center justify-center text-white">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>

      <div class="text-center">
        <h2 class="text-xl font-extrabold tracking-tight text-[#141413] mb-1">
          Join the Leaderboard
        </h2>
        <p class="text-sm font-medium text-[#141413]/60">
          Enter your nickname to get started.
        </p>
      </div>

      <!-- Input Card -->
      <div class="w-full p-5 bg-white border-2 border-[#141413] rounded-2xl shadow-[4px_4px_0px_#141413]">
        <label for="nickname-input" class="block mb-2">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-[#141413]/60">
            Nickname
          </span>
        </label>
        <input
          id="nickname-input"
          type="text"
          bind:value={inputValue}
          onkeydown={handleKeydown}
          maxlength={20}
          placeholder="e.g. SiPalingInggris"
          class="w-full px-4 py-3 bg-[#F7F5F0] border-2 border-[#141413] rounded-xl text-base font-bold text-[#141413] placeholder:text-[#141413]/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:border-[#FF5A1F] transition-colors
            {shakeError ? 'animate-[shake_0.3s_ease-in-out]' : ''}"
        />
        <p class="mt-2 text-[10px] font-mono font-bold text-[#141413]/40 uppercase tracking-wider">
          2–20 characters. Shown on the leaderboard.
        </p>
      </div>

      <!-- Save Button -->
      <button
        type="button"
        onclick={handleSave}
        class="w-full min-h-[52px] font-extrabold text-base bg-[#FF5A1F] text-white rounded-xl border-2 border-[#141413] shadow-[3px_3px_0px_#141413] hover:bg-[#e04f1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2"
      >
        <span>Save & Start</span>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  {:else}
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
  {/if}
</div>

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
</style>
