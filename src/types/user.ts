// Roles as const object - single source of truth
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
