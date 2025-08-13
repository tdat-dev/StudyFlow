import React, { useState, useEffect } from 'react';
import { MainApp } from '../components/MainApp';
import { LoginForm, RegisterForm } from '../components/features/auth';
import { User } from '../types/chat';
import { auth } from '../services/firebase';

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
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        <MainApp user={user} onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4">
          {showRegister ? (
            <RegisterForm
              onSuccess={() => setShowRegister(false)}
              onLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              onSuccess={() => {}}
              onRegister={() => setShowRegister(true)}
              onForgotPassword={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}