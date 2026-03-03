import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Test, TestWithQuestions, TestResult, TestAnswer, Question, EnglishLevel } from '../types/test';
import { ENGLISH_LEVELS } from '../types/test';

const TESTS_COLLECTION = 'tests';
const QUESTIONS_COLLECTION = 'questions';
const RESULTS_COLLECTION = 'testResults';

// Helper to convert Firestore timestamps
function convertTimestamps<T>(data: Record<string, unknown>): Omit<T, 'id'> {
  const result = { ...data } as Record<string, unknown>;

  if (data.createdAt instanceof Timestamp) {
    result.createdAt = data.createdAt.toDate();
  }
  if (data.updatedAt instanceof Timestamp) {
    result.updatedAt = data.updatedAt.toDate();
  }
  if (data.startedAt instanceof Timestamp) {
    result.startedAt = data.startedAt.toDate();
  }
  if (data.completedAt instanceof Timestamp) {
    result.completedAt = data.completedAt.toDate();
  }

  return result as Omit<T, 'id'>;
}

// ============ QUESTIONS ============

export async function getAllQuestions(): Promise<Question[]> {
  const q = query(
    collection(db, QUESTIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps<Question>(doc.data())
  }));
}

export async function getQuestionsByLevel(level: EnglishLevel): Promise<Question[]> {
  const q = query(
    collection(db, QUESTIONS_COLLECTION),
    where('level', '==', level),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps<Question>(doc.data())
  }));
}

export async function getQuestionById(questionId: string): Promise<Question | null> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...convertTimestamps<Question>(docSnap.data())
  };
}

export async function createQuestion(
  question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>,
  author: { uid: string; name: string; email: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
    ...question,
    createdBy: author,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  return docRef.id;
}

export async function updateQuestion(
  questionId: string,
  updates: Partial<Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
  author: { uid: string; name: string; email: string }
): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  await updateDoc(docRef, {
    ...updates,
    updatedBy: author,
    updatedAt: Timestamp.now()
  });
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  await deleteDoc(docRef);
}

// ============ TESTS ============

export async function getAllTests(): Promise<Test[]> {
  const q = query(
    collection(db, TESTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps<Test>(doc.data())
  }));
}

export async function getTestById(testId: string): Promise<Test | null> {
  const docRef = doc(db, TESTS_COLLECTION, testId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...convertTimestamps<Test>(docSnap.data())
  };
}

// Get test with all questions populated
export async function getTestWithQuestions(testId: string): Promise<TestWithQuestions | null> {
  const test = await getTestById(testId);
  if (!test) return null;

  // Fetch all questions for this test
  const questions: Question[] = [];
  for (const qId of test.questionIds) {
    const question = await getQuestionById(qId);
    if (question) {
      questions.push(question);
    }
  }

  return {
    id: test.id,
    title: test.title,
    description: test.description,
    timeLimit: test.timeLimit,
    isPublished: test.isPublished,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
    questions
  };
}

export async function createTest(
  test: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, TESTS_COLLECTION), {
    ...test,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  return docRef.id;
}

export async function updateTest(
  testId: string,
  updates: Partial<Omit<Test, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, TESTS_COLLECTION, testId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function deleteTest(testId: string): Promise<void> {
  const docRef = doc(db, TESTS_COLLECTION, testId);
  await deleteDoc(docRef);
}

// ============ TEST RESULTS ============

export async function getAllTestResults(): Promise<TestResult[]> {
  const q = query(
    collection(db, RESULTS_COLLECTION),
    orderBy('completedAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps<TestResult>(doc.data())
  }));
}

export async function submitTestResult(
  testId: string,
  testTitle: string,
  takerInfo: { name: string; email: string; phone?: string },
  answers: TestAnswer[],
  startedAt: Date
): Promise<string> {
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalQuestions = answers.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const determinedLevel = determineLevel(percentage);

  const result: Omit<TestResult, 'id'> = {
    testId,
    testTitle,
    takerName: takerInfo.name,
    takerEmail: takerInfo.email,
    takerPhone: takerInfo.phone,
    answers,
    correctCount,
    totalQuestions,
    percentage,
    determinedLevel,
    startedAt,
    completedAt: new Date(),
    timeSpent: Math.round((Date.now() - startedAt.getTime()) / 1000)
  };

  const docRef = await addDoc(collection(db, RESULTS_COLLECTION), {
    ...result,
    startedAt: Timestamp.fromDate(startedAt),
    completedAt: Timestamp.now()
  });

  return docRef.id;
}

// Determine English level based on test percentage
function determineLevel(percentage: number): EnglishLevel {
  if (percentage >= 90) return ENGLISH_LEVELS.C2;
  if (percentage >= 80) return ENGLISH_LEVELS.C1;
  if (percentage >= 70) return ENGLISH_LEVELS.B2;
  if (percentage >= 60) return ENGLISH_LEVELS.B1;
  if (percentage >= 50) return ENGLISH_LEVELS.A2;
  return ENGLISH_LEVELS.A1;
}

// Generate shareable test link
export function generateTestLink(testId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/dialect/test/${testId}`;
}
