import {
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType, VALIDATION_CONSTANTS } from '../firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  demoSeeded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function sanitizeDisplayName(raw: string | null | undefined, fallbackEmail?: string | null): string {
  const base = (raw || fallbackEmail?.split('@')[0] || 'TaskFlow User').trim();
  const safe = base.length > 0 ? base : 'TaskFlow User';
  return safe.slice(0, VALIDATION_CONSTANTS.DISPLAY_NAME_MAX_LENGTH);
}

function sanitizeEmail(raw: string | null | undefined): string {
  const base = (raw || 'user@taskflow.app').trim();
  const safe = base.length >= VALIDATION_CONSTANTS.EMAIL_MIN_LENGTH ? base : 'user@taskflow.app';
  return safe.slice(0, VALIDATION_CONSTANTS.EMAIL_MAX_LENGTH);
}

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  if (val instanceof Date) {
    return val;
  }
  return new Date();
}

export async function ensureUserProfile(
  user: User,
  customDisplayName?: string
): Promise<UserProfile> {
  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/info`;
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'info');

  try {
    const userSnap = await getDoc(userRef);
    const displayName = sanitizeDisplayName(customDisplayName || user.displayName, user.email);
    const email = sanitizeEmail(user.email);

    if (!userSnap.exists()) {
      const batch = writeBatch(db);
      batch.set(userRef, {
        uid: user.uid,
        displayName,
        theme: 'light',
        notificationsEnabled: true,
        demoSeeded: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(privateRef, {
        uid: user.uid,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      return {
        uid: user.uid,
        displayName,
        email,
        theme: 'light',
        notificationsEnabled: true,
        demoSeeded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const data = userSnap.data();
    let storedEmail = email;
    try {
      const privSnap = await getDoc(privateRef);
      if (privSnap.exists() && typeof privSnap.data().email === 'string') {
        storedEmail = privSnap.data().email;
      } else {
        const batch = writeBatch(db);
        batch.set(privateRef, {
          uid: user.uid,
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      }
    } catch {
      // Fallback to auth email if private doc doesn't exist yet
    }

    return {
      uid: data.uid || user.uid,
      displayName: data.displayName || displayName,
      email: storedEmail,
      theme: data.theme === 'dark' ? 'dark' : 'light',
      notificationsEnabled:
        typeof data.notificationsEnabled === 'boolean' ? data.notificationsEnabled : true,
      demoSeeded: Boolean(data.demoSeeded),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'theme' | 'notificationsEnabled' | 'demoSeeded'>>
): Promise<void> {
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.displayName !== undefined) {
    payload.displayName = sanitizeDisplayName(updates.displayName);
  }
  if (updates.theme !== undefined) {
    payload.theme = updates.theme === 'dark' ? 'dark' : 'light';
  }
  if (updates.notificationsEnabled !== undefined) {
    payload.notificationsEnabled = Boolean(updates.notificationsEnabled);
  }
  if (updates.demoSeeded !== undefined) {
    payload.demoSeeded = Boolean(updates.demoSeeded);
  }

  try {
    await updateDoc(userRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}
