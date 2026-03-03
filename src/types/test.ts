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

export const ENGLISH_LEVEL_LABELS: Record<EnglishLevel, string> = {
  A1: 'Beginner (A1)',
  A2: 'Elementary (A2)',
  B1: 'Intermediate (B1)',
  B2: 'Upper-Intermediate (B2)',
  C1: 'Advanced (C1)',
  C2: 'Proficient (C2)',
};

// Question types - starting simple with yes/no
export const QUESTION_TYPES = {
  YES_NO: 'yes_no',
} as const;

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

// Single question
export interface Question {
  id: string;
  type: QuestionType;
  text: string; // The question text
  correctAnswer: boolean; // true = Yes, false = No
  level: EnglishLevel;
  // Authorship
  createdBy: {
    uid: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    uid: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Test definition
export interface Test {
  id: string;
  title: string;
  description: string;
  questionIds: string[]; // References to questions
  timeLimit?: number; // in minutes
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Test with populated questions (for taking test)
export interface TestWithQuestions extends Omit<Test, 'questionIds'> {
  questions: Question[];
}

// Answer with question details for results
export interface TestAnswer {
  questionId: string;
  questionText: string;
  userAnswer: boolean;
  correctAnswer: boolean;
  isCorrect: boolean;
}

// Test result
export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  // Test taker info
  takerName: string;
  takerEmail: string;
  takerPhone?: string;
  // Results
  answers: TestAnswer[];
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  determinedLevel?: EnglishLevel;
  // Timing
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // in seconds
}
