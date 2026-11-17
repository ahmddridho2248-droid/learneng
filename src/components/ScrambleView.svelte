<script lang="ts">
  import type { ScrambleQuestion } from '../types/quiz';
  import { shuffle } from '../lib/shuffle';
  import { playClick } from '../lib/sound';

  interface Props {
    question: ScrambleQuestion;
    constructedAnswer: string;
    isLocked: boolean;
    onChange: (sentence: string) => void;
  }

  let { question, isLocked, onChange }: Props = $props();

  interface TokenItem {
    id: number;
    text: string;
  }

  // Shuffled tokens for the bank and placed tokens
  let placedTokens = $state<TokenItem[]>([]);
  let bankTokens = $state<TokenItem[]>([]);

  // Initialize or re-initialize when question changes
  $effect(() => {
    // Unique ID for each token instance
    const initial = question.tokens.map((text, i) => ({ id: i, text }));
    bankTokens = shuffle(initial);
    placedTokens = [];
    onChange('');
  });

  function notifyChange() {
    const text = placedTokens.map(t => t.text).join(' ');
    onChange(text);
  }

  function handleAddToPlaced(token: TokenItem) {
    if (isLocked) return;
    playClick();
    bankTokens = bankTokens.filter(t => t.id !== token.id);
    placedTokens = [...placedTokens, token];
    notifyChange();
  }

  function handleReturnToBank(token: TokenItem) {
    if (isLocked) return;
    playClick();
    placedTokens = placedTokens.filter(t => t.id !== token.id);
    bankTokens = [...bankTokens, token];
    notifyChange();
  }

  function handleReset() {
    if (isLocked) return;
    playClick();
    const all = [...placedTokens, ...bankTokens];
    placedTokens = [];
    bankTokens = shuffle(all);
    notifyChange();
  }
</script>

<div class="flex flex-col gap-5 w-full">
  <!-- Prompt Card -->
  <div class="p-5 bg-white border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413]">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-mono font-bold tracking-wider text-[#141413]/60 uppercase">
        Sentence Scramble
      </span>
      <span class="text-xs font-mono font-bold px-2 py-0.5 bg-[#EFECE6] border border-[#141413] rounded">
        [{question.level}]
      </span>
    </div>
    <p class="text-base font-bold text-[#141413] mb-1">{question.prompt}</p>
    <p class="text-sm font-medium text-[#141413]/70 italic">{question.translation}</p>
  </div>

  <!-- Constructed Answer Area (Top) -->
  <div class="min-h-[110px] p-4 bg-white border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413] flex flex-col justify-between">
    <div class="flex flex-wrap gap-2 items-center">
      {#if placedTokens.length === 0}
        <span class="text-sm font-medium text-[#141413]/40 select-none py-2">
          Tap words below to assemble the sentence...
        </span>
      {:else}
        {#each placedTokens as token (token.id)}
          <button
            type="button"
            onclick={() => handleReturnToBank(token)}
            disabled={isLocked}
            class="px-3 py-1.5 bg-[#1D4ED8] text-white text-sm font-bold rounded-lg border-2 border-[#141413] shadow-[2px_2px_0px_#141413] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-75 hover:bg-[#1e40af]"
            title="Click to remove"
          >
            {token.text}
          </button>
        {/each}
      {/if}
    </div>

    {#if placedTokens.length > 0 && !isLocked}
      <div class="flex justify-end pt-2">
        <button
          type="button"
          onclick={handleReset}
          class="text-xs font-mono font-semibold text-[#141413]/60 hover:text-[#B91C1C] underline"
        >
          Reset words
        </button>
      </div>
    {/if}
  </div>

  <!-- Word Bank (Bottom) -->
  <div class="p-4 bg-[#EFECE6] border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413]">
    <div class="text-xs font-mono font-bold uppercase tracking-wider text-[#141413]/60 mb-3">
      Word Bank ({bankTokens.length} remaining)
    </div>
    <div class="flex flex-wrap gap-2 min-h-[60px] items-center">
      {#each bankTokens as token (token.id)}
        <button
          type="button"
          onclick={() => handleAddToPlaced(token)}
          disabled={isLocked}
          class="px-3.5 py-2 bg-white text-[#141413] text-sm font-bold rounded-lg border-2 border-[#141413] shadow-[2px_2px_0px_#141413] hover:bg-white/80 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75"
        >
          {token.text}
        </button>
      {/each}
    </div>
  </div>
</div>
