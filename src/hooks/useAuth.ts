import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase/config';
import { User } from '../types/chat';
import { getUserProfile, updateUserProfile } from '../services/firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        if (firebaseUser) {
          // Người dùng đã đăng nhập
          const token = await firebaseUser.getIdToken();
          
          // Lấy thông tin profile từ Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          
          if (profile) {
            // Nếu đã có profile
            setUser({
              name: profile.name || firebaseUser.displayName || 'User',
              email: profile.email || firebaseUser.email || '',
              accessToken: token,
              photoURL: profile.photoURL || firebaseUser.photoURL || undefined
            });
          } else {
            // Nếu chưa có profile, tạo mới
            const newUser = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              accessToken: token,
              photoURL: firebaseUser.photoURL || undefined,
              streak: 0,
              level: 1,
              experience: 0,
              totalWordsLearned: 0,
              todayProgress: 0,
              dailyGoal: 20,
              totalStudyTime: 0,
              isPremium: false,
              createdAt: new Date().toISOString()
            };
            
            await updateUserProfile(firebaseUser.uid, newUser);
            
            setUser({
              name: newUser.name,
              email: newUser.email,
              accessToken: token,
              photoURL: newUser.photoURL
            });
          }
        } else {
          // Người dùng đã đăng xuất
          setUser(null);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in auth state change:', err);
        }
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  };

  return {
    user,
    loading,
    error,
    updateUser
  };
}