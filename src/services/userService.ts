import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile, UserRole } from '../types/user';
import { USER_ROLES } from '../types/user';
import {
  updateTeacherNameInLessons,
  updateStudentNameInLessons,
} from './lessonService';

const USERS_COLLECTION = 'users';

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL: string | null = null,
  role: UserRole = 'student'
): Promise<UserProfile> {
  const now = new Date();
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    role,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    } as UserProfile;
  }

  return null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'role'>>
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const currentProfile = await getUserProfile(uid);

  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });

  if (updates.displayName && currentProfile && updates.displayName !== currentProfile.displayName) {
    const role = updates.role || currentProfile.role;
    if (role === USER_ROLES.TEACHER) {
      await updateTeacherNameInLessons(uid, updates.displayName);
    } else if (role === USER_ROLES.STUDENT) {
      await updateStudentNameInLessons(uid, updates.displayName);
    }
  }
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(doc(db, USERS_COLLECTION, uid));
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    } as UserProfile;
  });
}

export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('role', '==', role),
    orderBy('displayName', 'asc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    } as UserProfile;
  });
}

export async function getTeachers(): Promise<UserProfile[]> {
  return getUsersByRole('teacher');
}

export async function getStudents(): Promise<UserProfile[]> {
  return getUsersByRole('student');
}
