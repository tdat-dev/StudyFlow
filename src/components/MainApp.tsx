import React, { useState } from 'react';
import { ChatScreen } from './features/chat/ChatScreen';
import { FlashcardScreen } from './features/flashcards/FlashcardScreen';
import { HabitTracker } from './features/habits/HabitTracker';
import { HomeDashboard } from './features/home/HomeDashboard';
import { PomodoroTimerWithHabits } from './features/pomodoro/PomodoroTimerWithHabitsContext';
import { PomodoroIndicator } from './features/pomodoro/PomodoroIndicator';
import ProfileScreen from './features/profile/ProfileScreen';
import { User } from '../types/chat';
import { Header } from './common/layout/Header';
import BottomNav from './common/layout/BottomNav';
import { PomodoroProvider } from '../contexts/PomodoroContext';

type TabType =
  | 'home'
  | 'chat'
  | 'flashcards'
  | 'habits'
  | 'pomodoro'
  | 'profile';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

export function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentUser, setCurrentUser] = useState(user);
  const [startQuickReview, setStartQuickReview] = useState(false);

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    // Reset startQuickReview khi chuyển tab
    if (tab !== 'flashcards') {
      setStartQuickReview(false);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onTabChange={handleTabChange}
            onStartQuickReview={handleStartQuickReview}
            onMarkQuickReviewUsed={handleMarkQuickReviewUsed}
          />
        );
      case 'chat':
        return <ChatScreen key="chat" user={currentUser} />;
      case 'flashcards':
        return (
          <FlashcardScreen
            user={currentUser}
            onTabChange={handleTabChange}
            startQuickReview={startQuickReview}
            onMarkQuickReviewUsed={handleMarkQuickReviewUsed}
          />
        );
      case 'habits':
        return (
          <HabitTracker user={currentUser} onTabChange={handleTabChange} />
        );
      case 'pomodoro':
        return <PomodoroTimerWithHabits user={currentUser} />;
      case 'profile':
        return <ProfileScreen user={currentUser} onLogout={onLogout} />;
      default:
        return (
          <HomeDashboard
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onTabChange={handleTabChange}
            onStartQuickReview={handleStartQuickReview}
          />
        );
    }
  };

  const handleNavigateToProfile = () => {
    setActiveTab('profile');
  };

  const handleStartQuickReview = () => {
    setActiveTab('flashcards');
    setStartQuickReview(true);
  };

  const handleMarkQuickReviewUsed = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`quickReviewUsed_${today}`, 'true');
  };

  return (
    <PomodoroProvider>
      <div className="flex flex-col h-screen bg-white dark:bg-studyflow-bg">
        <Header
          user={currentUser}
          onLogout={onLogout}
          onNavigateToProfile={handleNavigateToProfile}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {/* Content area với full width */}
        <main className="flex-1 flex flex-col bg-white dark:bg-studyflow-bg pb-[calc(var(--tabbar-h)+var(--safe-bottom))] min-h-0 overflow-y-auto scrollbar-modern">
          <div className="flex-1 w-full h-full overflow-y-auto scrollbar-modern">
            {renderScreen()}
          </div>
        </main>

        {/* Pomodoro Indicator - hiển thị khi timer đang chạy */}
        <PomodoroIndicator
          onNavigateToPomodoro={() => handleTabChange('pomodoro')}
        />
        {/* Bottom nav hiển thị cho cả mobile và desktop */}
        <BottomNav
          activeTab={activeTab as any}
          onTabChange={t => setActiveTab(t as TabType)}
        />
      </div>
    </PomodoroProvider>
  );
}
