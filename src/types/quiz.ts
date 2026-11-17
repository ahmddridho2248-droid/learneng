export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type QuestionType = 'cloze' | 'scramble' | 'speaking' | 'multiple_choice';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  level: CEFRLevel;
  prompt: string;
  sentence: string;
  translation: string;
  answer: string;
  explanation: string;
}

export interface ClozeQuestion extends BaseQuestion {
  type: 'cloze';
  options: string[];
}

export interface ScrambleQuestion extends BaseQuestion {
  type: 'scramble';
  tokens: string[];
}

export interface SpeakingQuestion extends BaseQuestion {
  type: 'speaking';
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
}

export type Question = ClozeQuestion | ScrambleQuestion | SpeakingQuestion | MultipleChoiceQuestion;

export interface Deck {
  deckId: string;
  title: string;
  description: string;
  level: CEFRLevel;
  questions: Question[];
}

export interface SessionResult {
  deckId: string;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  accuracy: number;
}
