<script lang="ts">
  import type { ClozeQuestion, MultipleChoiceQuestion } from '../types/quiz';
  import { playClick } from '../lib/sound';

  interface Props {
    question: ClozeQuestion | MultipleChoiceQuestion;
    selectedAnswer: string | null;
    isLocked: boolean;
    onSelect: (option: string) => void;
  }

  let { question, selectedAnswer, isLocked, onSelect }: Props = $props();

  const optionLetters = ['A', 'B', 'C', 'D'];

  function handleSelect(option: string) {
    if (isLocked) return;
    playClick();
    onSelect(option);
  }

  // Cloze sentence display with highlighted blank
  let clozeParts = $derived.by(() => {
    if (question.type !== 'cloze') return null;
    const parts = question.sentence.split('___');
    return {
      before: parts[0] ?? '',
      after: parts[1] ?? '',
    };
  });

  let showSentence = $derived(
    question.type === 'cloze' || question.sentence !== question.answer
  );
</script>

<div class="flex flex-col gap-5 w-full">
  <!-- Prompt & Sentence Card -->
  <div class="p-5 bg-white border-2 border-[#141413] rounded-2xl shadow-[3px_3px_0px_#141413]">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-mono font-bold tracking-wider text-[#141413]/60 uppercase">
        {question.type === 'cloze' ? 'Fill in the blank' : 'Multiple Choice'}
      </span>
      <span class="text-xs font-mono font-bold px-2 py-0.5 bg-[#EFECE6] border border-[#141413] rounded">
        [{question.level}]
      </span>
    </div>

    <p class="text-sm font-medium text-[#141413]/80 {showSentence ? 'mb-3' : ''}">{question.prompt}</p>

    {#if clozeParts}
      <div class="text-lg font-extrabold tracking-tight text-[#141413] leading-relaxed">
        <span>{clozeParts.before}</span>
        <span class="inline-block px-2.5 py-0.5 mx-1 font-mono font-bold border-b-2 border-[#FF5A1F] bg-[#FF5A1F]/15 text-[#FF5A1F] rounded">
          {selectedAnswer || '___'}
        </span>
        <span>{clozeParts.after}</span>
      </div>
    {:else if question.sentence !== question.answer}
      <div class="text-lg font-extrabold tracking-tight text-[#141413] leading-relaxed">
        <span>{question.sentence}</span>
      </div>
    {/if}
  </div>

  <!-- Options List -->
  <div class="flex flex-col gap-3">
    {#each question.options as option, idx}
      {@const isSelected = selectedAnswer === option}
      <button
        type="button"
        onclick={() => handleSelect(option)}
        disabled={isLocked}
        class="w-full min-h-[52px] px-4 py-3 text-left rounded-xl border-2 border-[#141413] flex items-center gap-3 transition-all duration-75
          {isSelected
            ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#141413] translate-x-[1px] translate-y-[1px]'
            : 'bg-white text-[#141413] shadow-[3px_3px_0px_#141413] hover:bg-[#EFECE6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
          }
          {isLocked ? 'cursor-default opacity-95' : 'cursor-pointer'}
        "
      >
        <span
          class="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center font-mono text-xs font-bold shrink-0
            {isSelected ? 'bg-white text-[#1D4ED8]' : 'bg-[#EFECE6] text-[#141413]'}"
        >
          {optionLetters[idx] ?? idx + 1}
        </span>
        <span class="text-base font-semibold leading-snug break-words">
          {option}
        </span>
      </button>
    {/each}
  </div>
</div>
