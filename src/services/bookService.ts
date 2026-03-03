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
import type { Book } from '../types/book';

const BOOKS_COLLECTION = 'books';

// Helper to convert Firestore timestamps
const convertTimestamps = <T>(data: Record<string, unknown>): Omit<T, 'id'> => {
  const result = { ...data } as Record<string, unknown>;

  if (data.createdAt instanceof Timestamp) {
    result.createdAt = data.createdAt.toDate();
  }
  if (data.updatedAt instanceof Timestamp) {
    result.updatedAt = data.updatedAt.toDate();
  }

  return result as Omit<T, 'id'>;
};

// ============ BOOKS CRUD ============

export async function getAllBooks(): Promise<Book[]> {
  const q = query(
    collection(db, BOOKS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps<Book>(doc.data())
  }));
}

export async function getBookById(bookId: string): Promise<Book | null> {
  const docRef = doc(db, BOOKS_COLLECTION, bookId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...convertTimestamps<Book>(docSnap.data())
  };
}

export async function createBook(
  book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
    ...book,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  return docRef.id;
}

export async function updateBook(
  bookId: string,
  updates: Partial<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, BOOKS_COLLECTION, bookId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function deleteBook(bookId: string): Promise<void> {
  const docRef = doc(db, BOOKS_COLLECTION, bookId);
  await deleteDoc(docRef);
}
