import React, { useState } from 'react';
import { ChatScreen } from './features/chat/ChatScreen';
import { FlashcardScreen } from './features/flashcards/FlashcardScreen';
import { HabitTracker } from './features/habits/HabitTracker';
import { HomeDashboard } from './features/home/HomeDashboard';
import { PomodoroTimer } from './features/pomodoro/PomodoroTimer';
import ProfileScreen from './features/profile/ProfileScreen';
import { User } from '../types/chat';
import { Header } from './common/layout/Header';
import BottomNav from './common/layout/BottomNav';

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

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onTabChange={handleTabChange}
          />
        );
      case 'chat':
        return <ChatScreen key="chat" user={currentUser} />;
      case 'flashcards':
        return <FlashcardScreen user={currentUser} />;
      case 'habits':
        return <HabitTracker user={currentUser} />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'profile':
        return <ProfileScreen user={currentUser} onLogout={onLogout} />;
      default:
        return (
          <HomeDashboard
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onTabChange={handleTabChange}
          />
        );
    }
  };

  const handleNavigateToProfile = () => {
    setActiveTab('profile');
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#0d1117]">
      <Header
        user={currentUser}
        onLogout={onLogout}
        onNavigateToProfile={handleNavigateToProfile}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      {/* Content area với full width */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0d1117] pb-16 md:pb-0 min-h-0 overflow-hidden">
        <div className="flex-1 w-full min-h-0">{renderScreen()}</div>
      </div>
      {/* Bottom nav hiển thị trên mobile, ẩn trên desktop */}
      <div className="md:hidden">
        <BottomNav
          activeTab={activeTab as any}
          onTabChange={t => setActiveTab(t as TabType)}
        />
      </div>
    </div>
  );
}
