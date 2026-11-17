# Project Architecture & Engineering Rules (Zero-Bloat Language App)

## 1. Core Tech Stack (Strictly Enforced)
- **Framework:** Svelte + Vite + TypeScript (Client-Side SPA, NO SSR, NO Next.js, NO React).
- **Styling:** Tailwind CSS only. Do NOT install component libraries (no DaisyUI, Flowbite, Shadcn, or Material).
- **Icons & Animations:** Use crisp, geometric inline `<svg>` (1.75px–2px stroke width) for icons and native CSS transitions (`transition-transform`, `transition-colors`). Do NOT install `lucide-svelte`, `framer-motion`, or any icon/animation packages.
- **Local Storage & Persistence:** Use `idb-keyval` (IndexedDB wrapper) for all user progress, XP, streaks, and Spaced Repetition (SM-2) states. Never store large arrays in `localStorage`.
- **PWA:** Configure `vite-plugin-pwa` for offline-first caching of static assets and JSON question decks.

## 2. Zero-Dependency Logic Rules (`src/lib/`)
Do NOT install external NLP, fuzzy-search, or utility libraries (`compromise`, `natural`, `fuse.js`, `lodash`). Write lightweight, pure TypeScript functions in `src/lib/`:
- `src/lib/sm2.ts`: Native implementation of the SuperMemo-2 (SM-2) spaced repetition algorithm.
- `src/lib/levenshtein.ts`: Native Levenshtein distance & string normalization (strip punctuation, lowercase) to score typing and speech-to-text accuracy (0–100%).
- `src/lib/speech.ts`: Wrapper around browser `window.SpeechRecognition` (STT) and `window.speechSynthesis` (TTS) with graceful fallback to text-input mode if the browser (e.g., iOS Safari) blocks or lacks SpeechRecognition.
- `src/lib/shuffle.ts`: Fisher-Yates array shuffle for randomizing options and sentence scrambles.

## 3. Data & Content Rules (`src/data/`)
- Keep question decks modular and small (`< 20 KB` per JSON file, ~20–30 questions per deck) so they load instantaneously on slow mobile networks.
- Every generated JSON deck MUST strictly conform to the interfaces defined in `src/types/quiz.ts`.
- Never fetch external paid AI APIs at runtime. All hints, explanations, and distractor options must be pre-baked into the static JSON files.

## 4. Anti-Generic & Tactile UI Design Rules (NO "AI Slop")
Design with an intentional **Tactile Editorial / Neo-Brutalist Paper** aesthetic—crisp, high-contrast, physical, and zero-fluff:

### Strictly Forbidden ("AI Slop" Anti-Patterns)
- **NO generic AI gradients:** Never use `bg-gradient-to-r from-indigo-500 to-purple-600`, violet/cyan SaaS glows, or blurred glassmorphism (`backdrop-blur`).
- **NO emoji clutter:** Never put emojis inside headings, buttons, badges, or deck titles. Use clean typographic badges or minimal inline SVGs.
- **NO generic filler copy:** Never write cheesy AI greetings like *"Welcome back, learner! Ready to master English?"* or *"Great job! Keep it up!"*. Use direct, grounded micro-copy (e.g., *"12 due today"*, *"Exact match"*, *"Watch the preposition"*).
- **NO soft, mushy SaaS cards:** Avoid `bg-gray-50` backgrounds with low-contrast `shadow-sm rounded-2xl` white cards.

### Required Visual System & Tactile Physics
- **Color Palette (High-Contrast Warm Paper):**
  - Canvas background: Warm off-white paper `#F7F5F0` (`bg-[#F7F5F0]`) with crisp ink black text `#141413` (`text-[#141413]`).
  - Card surfaces: Pure white `#FFFFFF` or warm cream `#EFECE6` framed by solid `1.5px` or `2px` ink borders (`border-2 border-[#141413]`).
  - Primary Accent: Electric Signal Orange `#FF5A1F` or Cobalt Ink `#1D4ED8` for primary CTAs and active progress bars.
  - Semantic Feedback: Crisp Emerald `#15803D` (tint `#DCFCE7`) for correct answers; Crimson `#B91C1C` (tint `#FEE2E2`) for mistakes.
- **Tactile Button & Option Physics:**
  - Interactive cards, option buttons, and scramble word tiles MUST use hard offset borders/shadows (`shadow-[3px_3px_0px_#141413]`) that physically depress when tapped (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-75`).
  - Maintain large thumb-friendly touch targets (`min-h-[50px]`, `rounded-xl`).
- **Typography & Hierarchy:**
  - Load only `Plus Jakarta Sans` (weights 500, 700, 800) and `JetBrains Mono` (weight 500) via a single `<link>` in `index.html`.
  - Use tight display tracking (`tracking-tight font-extrabold`) for prompts/sentences, and `JetBrains Mono` (`tabular-nums`) for XP counters, streak numbers, accuracy percentages, and CEFR tags (`[A2]`, `[B1]`).
- **Layout & Performance Budget:**
  - Mobile-first container (`max-w-md mx-auto min-h-screen px-4 py-5 flex flex-col justify-between`).
  - Keep initial JS bundle size under `45 KB` gzipped.
  - Synthesize subtle mechanical click/chime audio feedback via Web Audio API (`src/lib/sound.ts`) with zero external MP3 assets.