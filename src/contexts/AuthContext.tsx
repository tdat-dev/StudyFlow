import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase/config';
import { firebase } from '../services/firebase/client';
import { FirebaseUser, UserProfile } from '../types';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError, withErrorHandling } = useErrorHandler();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          await loadUserProfile(firebaseUser as FirebaseUser);
        } catch (error) {
          handleError(error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [handleError]);

  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    // Sử dụng as any để tránh lỗi TypeScript với getIdToken
    const token = await (firebaseUser as any).getIdToken(true);
    const { profile } = await firebase.firestore.getProfile(firebaseUser.uid);

    if (profile) {
      setUser({
        uid: firebaseUser.uid,
        name: profile.name || firebaseUser.displayName || 'User',
        email: profile.email || firebaseUser.email || '',
        accessToken: token,
        streak: profile.streak || 0,
        todayProgress: profile.todayProgress || 0,
        dailyGoal: profile.dailyGoal || 20,
        totalWordsLearned: profile.totalWordsLearned || 0,
        photoURL: profile.photoURL || firebaseUser.photoURL || undefined,
      });
    } else {
      // Create default profile if it doesn't exist
      const defaultProfile: UserProfile = {
        uid: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'User',
        email: firebaseUser.email || '',
        accessToken: token,
        streak: 0,
        todayProgress: 0,
        dailyGoal: 20,
        totalWordsLearned: 0,
        photoURL: firebaseUser.photoURL || undefined,
      };

      await firebase.firestore.updateProfile(firebaseUser.uid, defaultProfile);
      setUser(defaultProfile);
    }
  };

  const signIn = withErrorHandling(async (email: string, password: string) => {
    setLoading(true);
    const result = await firebase.auth.signInWithPassword(email, password);

    if (result.error) {
      throw result.error;
    }
  });

  const signUp = withErrorHandling(async (email: string, password: string) => {
    setLoading(true);
    const result = await firebase.auth.signUp(email, password);

    if (result.error) {
      throw result.error;
    }
  });

  const signInWithGoogle = withErrorHandling(async () => {
    setLoading(true);
    const result = await firebase.auth.signInWithOAuth({ provider: 'google' });

    if (result.error) {
      throw result.error;
    }
  });

  const signOut = withErrorHandling(async () => {
    await firebase.auth.signOut();
    setUser(null);
  });

  const updateUserProfile = withErrorHandling(
    async (data: Partial<UserProfile>) => {
      if (!user) return;

      await firebase.firestore.updateProfile(auth.currentUser!.uid, data);

      setUser(prev => (prev ? { ...prev, ...data } : null));
    },
  );

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
