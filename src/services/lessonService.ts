import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Lesson, LessonStatus } from '../types/lesson';

const LESSONS_COLLECTION = 'lessons';

function convertTimestamps(data: Record<string, unknown>): Omit<Lesson, 'id'> {
  const result = { ...data } as Record<string, unknown>;

  if (data.createdAt instanceof Timestamp) {
    result.createdAt = data.createdAt.toDate();
  }
  if (data.updatedAt instanceof Timestamp) {
    result.updatedAt = data.updatedAt.toDate();
  }
  if (data.date instanceof Timestamp) {
    result.date = data.date.toDate();
  }

  return result as Omit<Lesson, 'id'>;
}

export async function getAllLessons(): Promise<Lesson[]> {
  const q = query(collection(db, LESSONS_COLLECTION), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  }));
}

export async function getStudentLessons(studentId: string): Promise<Lesson[]> {
  const q = query(
    collection(db, LESSONS_COLLECTION),
    where('studentId', '==', studentId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  }));
}

export async function getTeacherLessons(teacherId: string): Promise<Lesson[]> {
  const q = query(
    collection(db, LESSONS_COLLECTION),
    where('teacherId', '==', teacherId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  }));
}

export async function getLessonsInRange(
  startDate: Date,
  endDate: Date,
  studentId?: string
): Promise<Lesson[]> {
  let q = query(
    collection(db, LESSONS_COLLECTION),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  );

  if (studentId) {
    q = query(
      collection(db, LESSONS_COLLECTION),
      where('studentId', '==', studentId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'asc')
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  }));
}

export async function createLesson(
  lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date();
  const docRef = await addDoc(collection(db, LESSONS_COLLECTION), {
    ...lesson,
    date: Timestamp.fromDate(lesson.date),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return docRef.id;
}

export async function updateLesson(
  lessonId: string,
  updates: Partial<Omit<Lesson, 'id' | 'createdAt'>>
): Promise<void> {
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  };

  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date);
  }

  await updateDoc(doc(db, LESSONS_COLLECTION, lessonId), updateData);
}

export async function updateLessonStatus(
  lessonId: string,
  status: LessonStatus
): Promise<void> {
  await updateLesson(lessonId, { status });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await deleteDoc(doc(db, LESSONS_COLLECTION, lessonId));
}

export async function updateTeacherNameInLessons(
  teacherId: string,
  newName: string
): Promise<void> {
  const q = query(
    collection(db, LESSONS_COLLECTION),
    where('teacherId', '==', teacherId)
  );
  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map((docSnap) =>
    updateDoc(doc(db, LESSONS_COLLECTION, docSnap.id), {
      teacherName: newName,
      updatedAt: Timestamp.fromDate(new Date()),
    })
  );

  await Promise.all(updates);
}

export async function updateStudentNameInLessons(
  studentId: string,
  newName: string
): Promise<void> {
  const q = query(
    collection(db, LESSONS_COLLECTION),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map((docSnap) =>
    updateDoc(doc(db, LESSONS_COLLECTION, docSnap.id), {
      studentName: newName,
      updatedAt: Timestamp.fromDate(new Date()),
    })
  );

  await Promise.all(updates);
}
