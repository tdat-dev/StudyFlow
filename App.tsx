import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { OnboardingScreen } from './components/OnboardingScreen';
import { firebase } from './utils/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase/config';

// Định nghĩa kiểu dữ liệu cho kết quả từ getSession
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface Session {
  user: FirebaseUser;
  access_token: string;
}

interface SessionResult {
  data: {
    session: Session | null;
  };
  error: Error | null;
}

// Thêm key để hỗ trợ Fast Refresh
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'onboarding' | 'login' | 'register' | 'main'>('welcome');
  interface UserProfile {
    name: string;
    email: string;
    accessToken: string;
    streak: number;
    todayProgress: number;
    dailyGoal: number;
    totalWordsLearned: number;
    photoURL?: string;
  }
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã xem onboarding chưa
    const onboardingSeen = localStorage.getItem('hasSeenOnboarding');
    if (onboardingSeen === 'true') {
      setHasSeenOnboarding(true);
    }

    // Check for existing session on app load
    checkSession();

    // Check for OAuth redirects
    const handleOAuthRedirect = async () => {
      const result = await firebase.auth.getSession() as SessionResult;
      
      if (result.data?.session && window.location.hash.includes('access_token')) {
        // User has been redirected from OAuth provider
        await handleAuthSession(result.data.session);
      }
    };
    
    handleOAuthRedirect();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true); // Force refresh token
          const session = { user: firebaseUser, access_token: token };
          await handleAuthSession(session);
        } catch (error) {
          console.error('Error getting token:', error);
          handleLogout();
        }
      } else {
        handleLogout();
      }
    });

    return () => unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const result = await firebase.auth.getSession() as SessionResult;
      const session = result.data?.session;
      const error = result.error;
      
      if (error) {
        console.error('Session check error:', error);
        setLoading(false);
        return;
      }

      if (session?.access_token) {
        await handleAuthSession(session);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      setLoading(false);
    }
  };

  const handleAuthSession = async (session: Session | any) => {
    try {
      // Get user profile from Firestore
      const userId = session.user.uid;
      const { profile, error: profileError } = await firebase.firestore.getProfile(userId);

      if (profile) {
        const userProfile: UserProfile = {
          name: profile.name || session.user.displayName || 'User',
          email: profile.email || session.user.email || '',
          accessToken: session.access_token,
          streak: profile.streak || 0,
          todayProgress: profile.todayProgress || 0,
          dailyGoal: profile.dailyGoal || 20,
          totalWordsLearned: profile.totalWordsLearned || 0,
          photoURL: profile.photoURL || session.user.photoURL
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
          photoURL: session.user?.photoURL
        };
        
        // Create profile if it doesn't exist
        await firebase.firestore.updateProfile(userId, userData);
        
        setUser(userData);
        setCurrentScreen('main');
      }
    } catch (error) {
      console.error('Failed to handle auth session:', error);
      // Still set user with minimal data
      const userData: UserProfile = {
        name: session.user?.displayName || session.user?.email?.split('@')[0] || 'User',
        email: session.user?.email || '',
        accessToken: session.access_token,
        streak: 0,
        todayProgress: 0,
        dailyGoal: 20,
        totalWordsLearned: 0,
        photoURL: session.user?.photoURL
      };
      setUser(userData);
      setCurrentScreen('main');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
    setCurrentScreen('main');
  };

  const handleLogout = async () => {
    try {
      await firebase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setCurrentScreen(hasSeenOnboarding ? 'welcome' : 'onboarding');
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-900">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  if (currentScreen === 'welcome') {
    return <WelcomeScreen onNavigate={handleNavigateFromWelcome} />;
  }

  if (currentScreen === 'login' || currentScreen === 'register') {
    return (
      <LoginScreen 
        mode={currentScreen} 
        onLogin={handleLogin}
        onBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  return <MainApp user={user} onLogout={handleLogout} />;
}