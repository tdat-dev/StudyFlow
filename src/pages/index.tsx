import React, { useState, useEffect } from 'react';
import { MainApp } from '../components/MainApp';
import { LoginForm, RegisterForm, LandingPage, AuthLayout } from '../components/features/auth';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { User } from '../types/chat';
import { auth } from '../services/firebase/config';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Người dùng đã đăng nhập
        firebaseUser.getIdToken().then((accessToken) => {
          setUser({
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            accessToken,
            photoURL: firebaseUser.photoURL || undefined
          });
        });
      } else {
        // Người dùng đã đăng xuất
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error signing out:', error);
      }
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải StudyFlow..." />;
  }

  return (
    <div className="w-full min-h-svh relative overflow-hidden">
      {user ? (
        <MainApp user={user} onLogout={handleLogout} />
      ) : showRegister ? (
        <AuthLayout type="register">
          <RegisterForm
            onSuccess={() => setShowRegister(false)}
            onLogin={() => setShowRegister(false)}
          />
        </AuthLayout>
      ) : (
        <LandingPage
          onShowLogin={() => setShowRegister(false)}
          onShowRegister={() => setShowRegister(true)}
        />
      )}
    </div>
  );
}