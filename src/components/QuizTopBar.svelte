<script lang="ts">
  import { speak, isTTSSupported } from '../lib/speech';
  import { playClick } from '../lib/sound';

  interface Props {
    currentIndex: number;
    total: number;
    sentenceToSpeak?: string;
    onExit: () => void;
  }

  let { currentIndex, total, sentenceToSpeak = '', onExit }: Props = $props();

  let isSpeaking = $state(false);

  let progressPercent = $derived(
    total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0
  );

  async function handleSpeak() {
    if (!sentenceToSpeak || isSpeaking || !isTTSSupported) return;
    playClick();
    isSpeaking = true;
    try {
      await speak({ text: sentenceToSpeak, lang: 'en-US', rate: 0.95 });
    } catch {
      // Ignored if user stopped or not allowed
    } finally {
      isSpeaking = false;
    }
  }

  function handleExit() {
    playClick();
    onExit();
  }
</script>

<div class="flex items-center gap-3 w-full mb-6">
  <!-- Exit Button -->
  <button
    type="button"
    onclick={handleExit}
    class="w-10 h-10 rounded-xl bg-white border-2 border-[#141413] shadow-[2px_2px_0px_#141413] flex items-center justify-center text-[#141413] hover:bg-[#EFECE6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 shrink-0"
    aria-label="Exit quiz"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>

  <!-- Progress Bar Container -->
  <div class="flex-1 h-3.5 bg-white border-2 border-[#141413] rounded-full p-0.5 overflow-hidden shadow-[2px_2px_0px_#141413]">
    <div
      class="h-full bg-[#FF5A1F] rounded-full transition-all duration-300"
      style="width: {progressPercent}%"
    ></div>
  </div>

  <!-- Speaker TTS Button -->
  {#if sentenceToSpeak}
    <button
      type="button"
      onclick={handleSpeak}
      disabled={isSpeaking}
      class="w-10 h-10 rounded-xl bg-white border-2 border-[#141413] shadow-[2px_2px_0px_#141413] flex items-center justify-center text-[#141413] hover:bg-[#EFECE6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 shrink-0 disabled:opacity-50"
      aria-label="Listen to sentence"
      title="Listen to pronunciation"
    >
      <svg class="w-4 h-4 {isSpeaking ? 'text-[#FF5A1F] animate-pulse' : 'text-[#141413]'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
    </button>
  {/if}
</div>
