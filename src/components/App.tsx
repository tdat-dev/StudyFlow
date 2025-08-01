import React, { useState, useEffect } from 'react';
import { firebase } from '../services/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase/config';
import { FirebaseUser, Session, UserProfile } from '../types';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Loader2 } from 'lucide-react';

// Lazy load components
import { WelcomeScreen } from '../../components/WelcomeScreen';
import { LoginScreen } from '../../components/LoginScreen';
import { MainApp } from '../../components/MainApp';
import { OnboardingScreen } from '../../components/OnboardingScreen';

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
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'onboarding' | 'login' | 'register' | 'main'>('welcome');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);
  
  const { handleError, withErrorHandling } = useErrorHandler();

  useEffect(() => {
    // Kiểm tra xem người dùng đã xem onboarding chưa
    if (typeof window !== 'undefined') {
      const onboardingSeen = localStorage.getItem('hasSeenOnboarding');
      if (onboardingSeen === 'true') {
        setHasSeenOnboarding(true);
      }
    }

    // Check for existing session on app load
    checkSession();

    // Check for OAuth redirects
      const handleOAuthRedirect = withErrorHandling(async () => {
    const result = await firebase.auth.getSession() as any;
    
    if (result?.data?.session && window.location.hash.includes('access_token')) {
      // User has been redirected from OAuth provider
      await handleAuthSession(result.data.session);
    }
  });
    
    handleOAuthRedirect();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true); // Force refresh token
          const session = { 
            user: firebaseUser as FirebaseUser, 
            access_token: token 
          };
          await handleAuthSession(session);
        } catch (error) {
          handleError(error);
          handleLogout();
        }
      } else {
        handleLogout();
      }
    });

    return () => unsubscribe();
  }, []);

  const checkSession = withErrorHandling(async () => {
    const result = await firebase.auth.getSession() as any;
    const session = result?.data?.session;
    const error = result?.error;
    
    if (error) {
      handleError(error);
      setLoading(false);
      return;
    }

    if (session?.access_token) {
      await handleAuthSession(session);
    } else {
      setLoading(false);
    }
  });

  const handleAuthSession = withErrorHandling(async (session: Session) => {
    // Get user profile from Firestore
    const userId = session.user.uid;
    const { profile, error: profileError } = await firebase.firestore.getProfile(userId);

    if (profileError) {
      handleError(profileError);
    }

    if (profile) {
      const userProfile: UserProfile = {
        name: profile.name || session.user.displayName || 'User',
        email: profile.email || session.user.email || '',
        accessToken: session.access_token,
        streak: profile.streak || 0,
        todayProgress: profile.todayProgress || 0,
        dailyGoal: profile.dailyGoal || 20,
        totalWordsLearned: profile.totalWordsLearned || 0,
        photoURL: profile.photoURL || session.user.photoURL || undefined
      };
      setUser(userProfile);
      setCurrentScreen('main');
    } else {
      // Fallback user data if profile fetch fails
      const userData: UserProfile = {
        name: session.user?.displayName || session.user?.email?.split('@')[0] || 'User',
        email: session.user?.email || '',
        accessToken: session.access_token,
        streak: 0,
        todayProgress: 0,
        dailyGoal: 20,
        totalWordsLearned: 0,
        photoURL: session.user?.photoURL || undefined
      };
      
      // Create profile if it doesn't exist
      await firebase.firestore.updateProfile(userId, userData);
      
      setUser(userData);
      setCurrentScreen('main');
    }
    setLoading(false);
  });

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
    setCurrentScreen('main');
  };

  const handleLogout = withErrorHandling(async () => {
    await firebase.auth.signOut();
    setUser(null);
    setCurrentScreen(hasSeenOnboarding ? 'welcome' : 'onboarding');
  });

  const handleCompleteOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    setHasSeenOnboarding(true);
    setCurrentScreen('welcome');
  };

  const handleNavigateFromWelcome = (screen: 'login' | 'register' | 'onboarding') => {
    if (screen === 'onboarding') {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen(screen);
    }
  };

  // Show loading screen while checking session
  if (loading) {
    return <LoadingScreen />;
  }

  // Render appropriate screen based on current state
  return (
    <>
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onComplete={handleCompleteOnboarding} />
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen onNavigate={handleNavigateFromWelcome} />
      )}

      {(currentScreen === 'login' || currentScreen === 'register') && (
        <LoginScreen 
          mode={currentScreen} 
          onLogin={handleLogin}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'main' && user && (
        <MainApp user={user} onLogout={handleLogout} />
      )}
    </>
  );
}