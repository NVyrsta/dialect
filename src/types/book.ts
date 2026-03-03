// Book categories
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

// Book levels
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
  googleDocsId: string; // Just the document ID from Google Docs URL
  coverUrl: string | null; // Firebase Storage URL
  publishedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to extract Google Docs ID from URL
export function extractGoogleDocsId(url: string): string | null {
  // Matches patterns like:
  // https://docs.google.com/document/d/DOCUMENT_ID/...
  // https://drive.google.com/file/d/FILE_ID/...
  const docMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) return docMatch[1];

  // Also try ?id= parameter
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
}

// Generate Google Docs URLs from ID
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

// For Google Drive files (PDFs, etc.)
export function getGoogleDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getGoogleDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Generate thumbnail URL from Google Drive file ID
export function getGoogleDriveThumbnailUrl(fileId: string, size = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}
