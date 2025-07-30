import React, { useState } from 'react';
import { Home, BookOpen, Target, MessageCircle, User } from 'lucide-react';
import { HomeDashboard } from './HomeDashboard';
import { FlashcardsScreen } from './FlashcardsScreen';
import { HabitTracker } from './HabitTracker';
import { AIChatScreen } from './AIChatScreen';
import { ProfileScreen } from './ProfileScreen';
import { firebase } from '../utils/firebase/client';

interface MainAppProps {
  user: any;
  onLogout: () => void;
}

type TabType = 'home' | 'flashcards' | 'habits' | 'chat' | 'profile';

export function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentUser, setCurrentUser] = useState(user);

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

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard user={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'flashcards':
        return <FlashcardsScreen user={currentUser} />;
      case 'habits':
        return <HabitTracker user={currentUser} />;
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