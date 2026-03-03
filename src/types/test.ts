// English levels
export const ENGLISH_LEVELS = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
} as const;

export type EnglishLevel = (typeof ENGLISH_LEVELS)[keyof typeof ENGLISH_LEVELS];

// Question types
export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_BLANK: 'fill_blank',
} as const;

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

// Single question
export interface TestQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for choice questions
  correctAnswer: string | string[]; // string for single, array for multiple
  points: number;
  level?: EnglishLevel; // optional level for adaptive tests
}

// Test definition
export interface Test {
  id: string;
  title: string;
  description: string;
  type: 'level_test' | 'grammar' | 'vocabulary' | 'other';
  questions: TestQuestion[];
  timeLimit?: number; // in minutes, optional
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Answer from test taker
export interface TestAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
}

// Test result
export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  // Test taker info (not authenticated)
  takerName: string;
  takerEmail: string;
  takerPhone?: string;
  // Results
  answers: TestAnswer[];
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  determinedLevel?: EnglishLevel; // for level tests
  // Timing
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // in seconds
}
