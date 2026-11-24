<script lang="ts">
  import { onMount } from 'svelte';
  import { getLeaderboard, type LeaderboardEntry } from '../lib/supabase';
  import { playClick } from '../lib/sound';

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();

  let entries = $state<LeaderboardEntry[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      entries = await getLeaderboard(20);
    } catch (e: any) {
      error = e?.message ?? 'Failed to load';
    } finally {
      loading = false;
    }
  });

  function handleClose() {
    playClick();
    onClose();
  }

  function medalFor(rank: number): string {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}`;
  }
</script>

<div class="flex flex-col gap-5 w-full py-2 my-auto">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-extrabold tracking-tight text-[#141413]">
        Leaderboard
      </h2>
      <p class="text-xs font-medium text-[#141413]/60 mt-0.5">
        Top scores across all players
      </p>
    </div>
    <button
      type="button"
      onclick={handleClose}
      aria-label="Close leaderboard"
      class="w-9 h-9 flex items-center justify-center bg-white border-2 border-[#141413] rounded-lg shadow-[2px_2px_0px_#141413] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-75"
    >
      <svg class="w-4 h-4 text-[#141413]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>

  <!-- Table Card -->
  <div class="bg-white border-2 border-[#141413] rounded-2xl shadow-[4px_4px_0px_#141413] overflow-hidden">
    {#if loading}
      <div class="p-8 text-center">
        <span class="font-mono text-xs font-bold text-[#141413]/50 uppercase tracking-wider">Loading...</span>
      </div>
    {:else if error}
      <div class="p-6 text-center">
        <span class="font-mono text-xs font-bold text-[#B91C1C] uppercase tracking-wider">{error}</span>
        <p class="text-xs font-medium text-[#141413]/60 mt-2">Check your Supabase environment variables</p>
      </div>
    {:else if entries.length === 0}
      <div class="p-8 text-center">
        <span class="font-mono text-xs font-bold text-[#141413]/50 uppercase tracking-wider">No scores yet</span>
      </div>
    {:else}
      <!-- Table Header -->
      <div class="grid grid-cols-[40px_1fr_72px_72px] px-4 py-3 border-b-2 border-[#141413]/10 bg-[#EFECE6]">
        <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#141413]/60">#</span>
        <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#141413]/60">Player</span>
        <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 text-right">Score</span>
        <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 text-right">Acc</span>
      </div>

      <!-- Rows -->
      {#each entries as entry, i (entry.id ?? i)}
        {@const rank = i + 1}
        <div
          class="grid grid-cols-[40px_1fr_72px_72px] px-4 py-3 items-center
            {rank <= 3 ? 'bg-[#FFF7ED]' : ''}
            {i < entries.length - 1 ? 'border-b border-[#141413]/10' : ''}"
        >
          <!-- Rank -->
          <span
            class="font-mono text-xs font-extrabold tabular-nums
              {rank === 1 ? 'text-[#FF5A1F]' : rank <= 3 ? 'text-[#1D4ED8]' : 'text-[#141413]/60'}"
          >
            {medalFor(rank)}
          </span>

          <!-- Username -->
          <span class="text-sm font-bold tracking-tight text-[#141413] truncate pr-2">
            {entry.username}
          </span>

          <!-- Score -->
          <span class="font-mono text-sm font-extrabold tabular-nums text-[#141413] text-right">
            {entry.score.toLocaleString()}
          </span>

          <!-- Accuracy -->
          <span class="font-mono text-xs font-bold tabular-nums text-[#141413]/70 text-right">
            {entry.accuracy}%
          </span>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Back Button -->
  <button
    type="button"
    onclick={handleClose}
    class="w-full min-h-[50px] font-extrabold text-sm bg-white text-[#141413] rounded-xl border-2 border-[#141413] shadow-[3px_3px_0px_#141413] hover:bg-[#EFECE6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <span>Back to Decks</span>
  </button>
</div>
