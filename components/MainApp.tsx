import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Target, MessageCircle, User, Clock } from 'lucide-react';
import { HomeDashboard } from './HomeDashboard';
import { FlashcardsScreen } from './FlashcardsScreen';
import { HabitTracker } from './HabitTracker';
import { AIChatScreen } from './AIChatScreen';
import { ProfileScreen } from './ProfileScreen';
import { PomodoroScreen } from './PomodoroScreen';
import { firebase } from '../utils/firebase/client';

interface MainAppProps {
  user: any;
  onLogout: () => void;
}

type TabType = 'home' | 'flashcards' | 'habits' | 'pomodoro' | 'chat' | 'profile';

export function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentUser, setCurrentUser] = useState(user);
  
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  
  // State để lưu trữ thông tin bổ sung khi chuyển tab
  const [tabParams, setTabParams] = useState<Record<string, any>>({});
  
  // Lắng nghe sự kiện chuyển tab từ các component con
  useEffect(() => {
    const handleNavigateTab = (event: CustomEvent) => {
      const { tab, ...params } = event.detail;
      if (tab && tabs.some(t => t.id === tab)) {
        setActiveTab(tab as TabType);
        
        // Lưu các thông số bổ sung (như habitId)
        if (Object.keys(params).length > 0) {
          setTabParams(params);
        }
      }
    };
    
    window.addEventListener('navigate-tab', handleNavigateTab as EventListener);
    
    return () => {
      window.removeEventListener('navigate-tab', handleNavigateTab as EventListener);
    };
  }, [tabs]);

  const handleLogout = async () => {
    try {
      await firebase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Still logout even if there's an error
    }
  };

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard user={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'flashcards':
        return <FlashcardsScreen user={currentUser} />;
      case 'habits':
        return <HabitTracker user={currentUser} />;
      case 'pomodoro':
        return <PomodoroScreen user={currentUser} habitId={tabParams.habitId} />;
      case 'chat':
        return <AIChatScreen user={currentUser} />;
      case 'profile':
        return <ProfileScreen user={currentUser} onLogout={handleLogout} />;
      default:
        return <HomeDashboard user={currentUser} onUpdateUser={handleUpdateUser} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>

      {/* Bottom Tab Navigation */}
      <div className="bg-white border-t shadow-lg">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-3 px-2 flex flex-col items-center justify-center transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}