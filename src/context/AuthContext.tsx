import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured, firebaseConfig } from '../firebase';
import { ensureUserProfile, updateUserProfile, UserProfile } from '../services/userService';
import { seedDemoTasks } from '../services/taskService';

export interface AuthErrorDetails {
  code: string;
  message: string;
  isProviderDisabled?: boolean;
  consoleUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  authError: AuthErrorDetails | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string,
    seedInitialDemo?: boolean
  ) => Promise<void>;
  loginWithGoogle: (seedInitialDemoIfNew?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (
    updates: Partial<Pick<UserProfile, 'displayName' | 'theme' | 'notificationsEnabled' | 'demoSeeded'>>
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function formatFirebaseAuthError(error: unknown): AuthErrorDetails {
  const err = error as { code?: string; message?: string };
  const code = err?.code || 'auth/unknown';
  const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

  switch (code) {
    case 'auth/operation-not-allowed':
      return {
        code,
        message:
          'Email/Password sign-in is not enabled yet in your Firebase project. Enable it in the Firebase Console or continue immediately with Google Sign-In.',
        isProviderDisabled: true,
        consoleUrl,
      };
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return {
        code,
        message: 'Invalid email or password. Please check your credentials and try again.',
      };
    case 'auth/email-already-in-use':
      return {
        code,
        message: 'An account with this email already exists. Try signing in instead.',
      };
    case 'auth/weak-password':
      return {
        code,
        message: 'Password must be at least 6 characters long.',
      };
    case 'auth/invalid-email':
      return {
        code,
        message: 'Please enter a valid email address.',
      };
    case 'auth/popup-closed-by-user':
      return {
        code,
        message: 'Sign-in popup was closed before completing authentication.',
      };
    default:
      return {
        code,
        message: err?.message || 'An unexpected authentication error occurred.',
      };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(!isFirebaseConfigured);
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        document.documentElement.classList.remove('dark');
        setAuthReady(true);
        return;
      }

      setUser(firebaseUser);
      try {
        const userProfile = await ensureUserProfile(firebaseUser);
        setProfile(userProfile);
        document.documentElement.classList.toggle('dark', userProfile.theme === 'dark');
      } catch (err) {
        console.error('Failed to initialize user profile:', err);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const loginWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userProfile = await ensureUserProfile(credential.user);
      setProfile(userProfile);
      document.documentElement.classList.toggle('dark', userProfile.theme === 'dark');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err);
      setAuthError(formatted);
      throw formatted;
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    seedInitialDemo = true
  ) => {
    setAuthError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const cleanName = displayName.trim() || email.split('@')[0] || 'TaskFlow User';
      await updateProfile(credential.user, { displayName: cleanName });
      const userProfile = await ensureUserProfile(credential.user, cleanName);

      if (seedInitialDemo && !userProfile.demoSeeded) {
        await seedDemoTasks(credential.user.uid);
        userProfile.demoSeeded = true;
      }

      setProfile({ ...userProfile });
      document.documentElement.classList.toggle('dark', userProfile.theme === 'dark');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err);
      setAuthError(formatted);
      throw formatted;
    }
  };

  const loginWithGoogle = async (seedInitialDemoIfNew = true) => {
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const userProfile = await ensureUserProfile(credential.user);

      if (seedInitialDemoIfNew && !userProfile.demoSeeded) {
        await seedDemoTasks(credential.user.uid);
        userProfile.demoSeeded = true;
      }

      setProfile({ ...userProfile });
      document.documentElement.classList.toggle('dark', userProfile.theme === 'dark');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err);
      setAuthError(formatted);
      throw formatted;
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
    setUser(null);
    setProfile(null);
    document.documentElement.classList.remove('dark');
  };

  const updatePreferences = async (
    updates: Partial<Pick<UserProfile, 'displayName' | 'theme' | 'notificationsEnabled' | 'demoSeeded'>>
  ) => {
    if (!user || !profile) return;
    await updateUserProfile(user.uid, updates);
    const updated: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };
    setProfile(updated);
    if (updates.theme) {
      document.documentElement.classList.toggle('dark', updates.theme === 'dark');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authReady,
        authError,
        clearAuthError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
