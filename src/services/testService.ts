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
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Test, TestResult, TestAnswer, EnglishLevel } from '../types/test';
import { ENGLISH_LEVELS } from '../types/test';

const TESTS_COLLECTION = 'tests';
const RESULTS_COLLECTION = 'testResults';

// Helper to convert Firestore timestamps
const convertTimestamps = <T>(data: Record<string, unknown>): Omit<T, 'id'> => {
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
};

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
  updates: Partial<Test>
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

export async function getTestResultsByTestId(
  testId: string
): Promise<TestResult[]> {
  const q = query(
    collection(db, RESULTS_COLLECTION),
    orderBy('completedAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .filter((doc) => doc.data().testId === testId)
    .map((doc) => ({
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

  // Determine level based on percentage (for level tests)
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
