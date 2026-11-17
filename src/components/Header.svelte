<script lang="ts">
  interface Props {
    totalXP: number;
    onResetProgress?: () => void;
  }

  let { totalXP = 0 }: Props = $props();
</script>

<header class="flex items-center justify-between pb-4 border-b-2 border-[#141413]/10">
  <div class="flex items-center gap-2">
    <!-- Geometric ink logo icon -->
    <div class="w-8 h-8 rounded-lg bg-[#FF5A1F] border-2 border-[#141413] shadow-[2px_2px_0px_#141413] flex items-center justify-center text-white">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
        <path d="M6 6h10"></path>
        <path d="M6 10h7"></path>
      </svg>
    </div>
    <span class="text-xl font-extrabold tracking-tight text-[#141413]">LearnENG</span>
  </div>

  <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#141413] rounded-full shadow-[2px_2px_0px_#141413]">
    <svg class="w-3.5 h-3.5 text-[#FF5A1F]" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
    <span class="font-mono text-xs font-bold tabular-nums text-[#141413]">{totalXP} XP</span>
  </div>
</header>
