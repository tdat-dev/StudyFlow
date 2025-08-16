import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Loader2 } from 'lucide-react';
import { useAuth, useErrorHandler } from '../hooks';
import { MainApp } from './MainApp';
import { LoginForm, RegisterForm } from './features/auth';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
      <p className="text-blue-900">Đang tải...</p>
    </div>
  </div>
);

export default function App() {
  const { user, loading, error } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (error) {
      handleError(new Error(error));
    }
  }, [error, handleError]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>StudyFlow - Smart Learning Platform</title>
        <meta
          name="description"
          content="Học tiếng Anh thông minh với AI, Flashcards, Pomodoro Timer và theo dõi thói quen"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Favicon */}
        <link rel="icon" href="/images/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/logo-32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/logo-16.png"
        />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/images/logo-180.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/images/logo-152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/images/logo-144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/images/logo-120.png"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Color */}
        <meta name="theme-color" content="#4F46E5" />
        <meta name="msapplication-TileColor" content="#4F46E5" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="StudyFlow - Smart Learning Platform"
        />
        <meta
          property="og:description"
          content="Học tiếng Anh thông minh với AI, Flashcards & Pomodoro"
        />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {user ? (
          <MainApp user={user} onLogout={() => {}} />
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
    </>
  );
}
