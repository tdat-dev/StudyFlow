import React, { useState } from 'react';
import { SimpleLandingPage } from './SimpleLandingPage';
import { LoginForm, RegisterForm } from '../auth';

type LandingScreen = 'landing' | 'login' | 'register';

interface LandingWrapperProps {
  onAuthSuccess: () => void;
}

export function LandingWrapper({ onAuthSuccess }: LandingWrapperProps) {
  const [currentScreen, setCurrentScreen] = useState<LandingScreen>('landing');

  const handleGetStarted = () => {
    setCurrentScreen('register');
  };

  const handleLogin = () => {
    setCurrentScreen('login');
  };

  const handleShowRegister = () => {
    setCurrentScreen('register');
  };

  const handleShowLogin = () => {
    setCurrentScreen('login');
  };

  const handleAuthSuccess = () => {
    onAuthSuccess();
  };

  switch (currentScreen) {
    case 'login':
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <LoginForm
              onSuccess={handleAuthSuccess}
              onRegister={handleShowRegister}
              onForgotPassword={() => {}}
            />
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentScreen('landing')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      );

    case 'register':
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onLogin={handleShowLogin}
            />
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentScreen('landing')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <SimpleLandingPage
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
      );
  }
}
