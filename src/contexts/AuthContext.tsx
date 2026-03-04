/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../services/userService';
import type { UserProfile } from '../types/user';
import { USER_ROLES } from '../types/user';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isGuest: boolean;
  canManageLessons: boolean; // admin or teacher
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (firebaseUser: User) => {
    let userProfile = await getUserProfile(firebaseUser.uid);

    if (!userProfile) {
      userProfile = await createUserProfile(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || 'User',
        firebaseUser.photoURL
      );
    }

    setProfile(userProfile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await loadProfile(firebaseUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await createUserProfile(result.user.uid, email, name, null);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const existingProfile = await getUserProfile(result.user.uid);

    if (!existingProfile) {
      await createUserProfile(
        result.user.uid,
        result.user.email || '',
        result.user.displayName || 'User',
        result.user.photoURL
      );
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  const isAdmin = profile?.role === USER_ROLES.ADMIN;
  const isTeacher = profile?.role === USER_ROLES.TEACHER;
  const isStudent = profile?.role === USER_ROLES.STUDENT;
  const isGuest = profile?.role === USER_ROLES.GUEST;
  const canManageLessons = isAdmin || isTeacher;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isTeacher,
        isStudent,
        isGuest,
        canManageLessons,
        login,
        signup,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
