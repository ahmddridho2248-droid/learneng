<script lang="ts">
  import { onMount } from 'svelte';
  import type { Deck, Question, SessionResult } from './types/quiz';
  import { getTotalXP, reviewCard, getDeckDueCount } from './lib/sm2';
  import { normalize, similarityScore } from './lib/levenshtein';
  import { playClick, playCorrect, playWrong, resumeAudio } from './lib/sound';

  // Components
  import HomeView from './components/HomeView.svelte';
  import QuizTopBar from './components/QuizTopBar.svelte';
  import MultipleChoiceView from './components/MultipleChoiceView.svelte';
  import ScrambleView from './components/ScrambleView.svelte';
  import SpeakingView from './components/SpeakingView.svelte';
  import FeedbackDrawer from './components/FeedbackDrawer.svelte';
  import SessionSummaryView from './components/SessionSummaryView.svelte';
  import LeaderboardView from './components/LeaderboardView.svelte';

  // Load all question decks dynamically
  const deckModules = import.meta.glob('./data/*.json', { eager: true }) as Record<string, any>;
  const decks: Deck[] = [];
  const seenDeckIds = new Set<string>();

  for (const path in deckModules) {
    const raw = deckModules[path];
    const deck = (raw.default ?? raw) as Deck;
    if (deck && deck.deckId && !seenDeckIds.has(deck.deckId)) {
      seenDeckIds.add(deck.deckId);
      decks.push(deck);
    }
  }

  // App Navigation State
  type ViewMode = 'home' | 'quiz' | 'summary' | 'leaderboard';
  let view = $state<ViewMode>('home');

  // Persistence & XP
  let totalXP = $state(0);
  let dueCounts = $state<Record<string, number>>({});

  // Active Quiz State
  let activeDeck = $state<Deck | null>(null);
  let currentIndex = $state(0);
  let currentQuestion = $derived<Question | null>(
    activeDeck ? activeDeck.questions[currentIndex] ?? null : null
  );

  // User input states for current question
  let selectedOption = $state<string | null>(null);
  let scrambleAnswer = $state<string>('');
  let spokenTranscript = $state<string>('');
  let speakingScore = $state<number>(0);

  // Evaluation & Drawer State
  let isChecked = $state(false);
  let isCurrentCorrect = $state(false);
  let xpAwardedForCurrent = $state(0);

  // Session Statistics
  let sessionCorrect = $state(0);
  let sessionXpEarned = $state(0);
  let sessionResult = $state<SessionResult | null>(null);
  let sessionCorrectMap = $state<boolean[]>([]);

  // Refresh XP and due counts from IndexedDB
  async function refreshProgress() {
    totalXP = await getTotalXP();
    const counts: Record<string, number> = {};
    for (const d of decks) {
      const qIds = d.questions.map((q) => q.id);
      counts[d.deckId] = await getDeckDueCount(qIds);
    }
    dueCounts = counts;
  }

  onMount(() => {
    refreshProgress();
  });

  // Start a Quiz Session
  function handleSelectDeck(deck: Deck) {
    resumeAudio();
    activeDeck = deck;
    currentIndex = 0;
    sessionCorrect = 0;
    sessionXpEarned = 0;
    sessionResult = null;
    sessionCorrectMap = [];
    resetQuestionState();
    view = 'quiz';
  }

  function resetQuestionState() {
    selectedOption = null;
    scrambleAnswer = '';
    spokenTranscript = '';
    speakingScore = 0;
    isChecked = false;
    isCurrentCorrect = false;
    xpAwardedForCurrent = 0;
  }

  // Check whether an answer has been entered
  let hasAnswer = $derived.by(() => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'cloze' || currentQuestion.type === 'multiple_choice') {
      return selectedOption !== null;
    }
    if (currentQuestion.type === 'scramble') {
      return scrambleAnswer.trim().length > 0;
    }
    if (currentQuestion.type === 'speaking') {
      return spokenTranscript.trim().length > 0;
    }
    return false;
  });

  // Process checking answer
  async function handleCheckAnswer() {
    if (!currentQuestion || isChecked || !hasAnswer) return;
    await resumeAudio();

    let correct = false;
    let quality = 0;

    if (currentQuestion.type === 'cloze' || currentQuestion.type === 'multiple_choice') {
      correct = selectedOption === currentQuestion.answer;
      quality = correct ? 5 : 1;
    } else if (currentQuestion.type === 'scramble') {
      const userNorm = normalize(scrambleAnswer);
      const targetNorm = normalize(currentQuestion.answer);
      correct = userNorm === targetNorm;
      quality = correct ? 5 : 1;
    } else if (currentQuestion.type === 'speaking') {
      const score = similarityScore(spokenTranscript, currentQuestion.answer);
      speakingScore = score;
      correct = score >= 80;
      quality = score >= 95 ? 5 : score >= 80 ? 4 : score >= 50 ? 2 : 1;
    }

    isCurrentCorrect = correct;
    isChecked = true;
    sessionCorrectMap = [...sessionCorrectMap, correct];

    // Play feedback sound
    if (correct) {
      playCorrect();
      sessionCorrect += 1;
    } else {
      playWrong();
    }

    // Update SM-2 state and persist to IndexedDB
    const initialXP = await getTotalXP();
    await reviewCard(currentQuestion.id, quality);
    const newXP = await getTotalXP();
    const awarded = Math.max(0, newXP - initialXP);
    xpAwardedForCurrent = awarded;
    sessionXpEarned += awarded;
    totalXP = newXP;
  }

  // Continue after feedback drawer
  function handleContinue() {
    if (!activeDeck) return;

    if (currentIndex + 1 < activeDeck.questions.length) {
      currentIndex += 1;
      resetQuestionState();
    } else {
      // Completed deck
      const total = activeDeck.questions.length;
      const accuracy = total > 0 ? Math.round((sessionCorrect / total) * 100) : 0;
      sessionResult = {
        deckId: activeDeck.deckId,
        totalQuestions: total,
        correctAnswers: sessionCorrect,
        xpEarned: sessionXpEarned,
        accuracy,
      };
      view = 'summary';
      refreshProgress();
    }
  }

  function handleExitQuiz() {
    view = 'home';
    activeDeck = null;
    resetQuestionState();
    refreshProgress();
  }

  function handleReturnHome() {
    view = 'home';
    activeDeck = null;
    sessionResult = null;
    refreshProgress();
  }

  function handleOpenLeaderboard() {
    view = 'leaderboard';
  }

  function handleCloseLeaderboard() {
    view = 'home';
  }
</script>

<main class="max-w-md mx-auto min-h-screen px-4 py-6 flex flex-col justify-between selection:bg-[#FF5A1F] selection:text-white">
  {#if view === 'home'}
    <HomeView
      {decks}
      {dueCounts}
      {totalXP}
      onSelectDeck={handleSelectDeck}
      onOpenLeaderboard={handleOpenLeaderboard}
    />
  {:else if view === 'quiz' && currentQuestion && activeDeck}
    <div class="flex flex-col gap-4 w-full">
      <!-- Quiz Top Bar (Exit, Progress, TTS) -->
      <QuizTopBar
        currentIndex={currentIndex}
        total={activeDeck.questions.length}
        sentenceToSpeak={currentQuestion.sentence}
        onExit={handleExitQuiz}
      />

      <!-- Question View by Type -->
      {#if currentQuestion.type === 'cloze' || currentQuestion.type === 'multiple_choice'}
        <MultipleChoiceView
          question={currentQuestion}
          selectedAnswer={selectedOption}
          isLocked={isChecked}
          onSelect={(opt) => (selectedOption = opt)}
        />
      {:else if currentQuestion.type === 'scramble'}
        <ScrambleView
          question={currentQuestion}
          constructedAnswer={scrambleAnswer}
          isLocked={isChecked}
          onChange={(val) => (scrambleAnswer = val)}
        />
      {:else if currentQuestion.type === 'speaking'}
        <SpeakingView
          question={currentQuestion}
          userAnswer={spokenTranscript}
          score={speakingScore}
          isLocked={isChecked}
          onAnswerUpdate={(ans, sc) => {
            spokenTranscript = ans;
            speakingScore = sc;
          }}
        />
      {/if}
    </div>

    <!-- Bottom Actions Container -->
    <div class="w-full pt-6">
      {#if !isChecked}
        <button
          type="button"
          onclick={handleCheckAnswer}
          disabled={!hasAnswer}
          class="w-full min-h-[52px] font-extrabold text-base rounded-xl border-2 border-[#141413] shadow-[3px_3px_0px_#141413] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2
            {hasAnswer
              ? 'bg-[#FF5A1F] text-white hover:bg-[#e04f1a] cursor-pointer'
              : 'bg-[#EFECE6] text-[#141413]/40 cursor-not-allowed border-[#141413]/30 shadow-none'
            }"
        >
          <span>Check Answer</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      {:else}
        <FeedbackDrawer
          isCorrect={isCurrentCorrect}
          correctAnswer={currentQuestion.answer}
          translation={currentQuestion.translation}
          explanation={currentQuestion.explanation}
          xpAwarded={xpAwardedForCurrent}
          onContinue={handleContinue}
        />
      {/if}
    </div>
  {:else if view === 'summary' && sessionResult}
    <SessionSummaryView
      result={sessionResult}
      correctMap={sessionCorrectMap}
      onHome={handleReturnHome}
    />
  {:else if view === 'leaderboard'}
    <LeaderboardView
      onClose={handleCloseLeaderboard}
    />
  {/if}
</main>
