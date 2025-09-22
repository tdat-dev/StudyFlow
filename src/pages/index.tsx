import React, { useState, useEffect } from 'react';
import { MainApp } from '../components/MainApp';
import {
  RegisterForm,
  LandingPage,
  AuthLayout,
} from '../components/features/auth';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentAccessToken } from '../utils/auth-helpers';

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [componentUser, setComponentUser] = useState<any>(null);
  const { user, loading, signOut } = useAuth();

  // Convert AuthContext user to component user format when user changes
  useEffect(() => {
    const updateComponentUser = async () => {
      if (user) {
        const accessToken = await getCurrentAccessToken();
        setComponentUser({
          uid: user.uid,
          name: user.name,
          email: user.email,
          accessToken: accessToken || '',
          photoURL: user.photoURL,
        });
      } else {
        setComponentUser(null);
      }
    };

    updateComponentUser();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
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
    <div className="w-full min-h-svh relative">
      {componentUser ? (
        <MainApp user={componentUser} onLogout={handleLogout} />
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
