export const BOOK_CATEGORIES = {
  GRAMMAR: 'grammar',
  VOCABULARY: 'vocabulary',
  READING: 'reading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  WRITING: 'writing',
  EXAM_PREP: 'exam_prep',
  OTHER: 'other',
} as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[keyof typeof BOOK_CATEGORIES];

export const BOOK_CATEGORY_LABELS: Record<BookCategory, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  reading: 'Reading',
  listening: 'Listening',
  speaking: 'Speaking',
  writing: 'Writing',
  exam_prep: 'Exam Prep',
  other: 'Other',
};

export const BOOK_LEVELS = {
  BEGINNER: 'beginner',
  ELEMENTARY: 'elementary',
  INTERMEDIATE: 'intermediate',
  UPPER_INTERMEDIATE: 'upper_intermediate',
  ADVANCED: 'advanced',
  ALL_LEVELS: 'all_levels',
} as const;

export type BookLevel = (typeof BOOK_LEVELS)[keyof typeof BOOK_LEVELS];

export const BOOK_LEVEL_LABELS: Record<BookLevel, string> = {
  beginner: 'Beginner (A1)',
  elementary: 'Elementary (A2)',
  intermediate: 'Intermediate (B1)',
  upper_intermediate: 'Upper-Intermediate (B2)',
  advanced: 'Advanced (C1-C2)',
  all_levels: 'All Levels',
};

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: BookCategory;
  level: BookLevel;
  googleDocsId: string;
  coverUrl: string | null;
  publishedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

export function extractGoogleDocsId(url: string): string | null {
  // https://docs.google.com/document/d/DOCUMENT_ID/...
  // https://drive.google.com/file/d/FILE_ID/...
  const docMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) return docMatch[1];

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
}

export function getGoogleDocsViewUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/view`;
}

export function getGoogleDocsEditUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/edit`;
}

export function getGoogleDocsPdfUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/export?format=pdf`;
}

export function getGoogleDocsDocxUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/export?format=docx`;
}

export function getGoogleDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getGoogleDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function getGoogleDriveThumbnailUrl(fileId: string, size = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}
