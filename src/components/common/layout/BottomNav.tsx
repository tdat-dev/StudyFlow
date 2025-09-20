import React from 'react';
import { BookOpen, Calendar, Clock, Home, MessageSquare } from 'lucide-react';

type TabType =
  | 'home'
  | 'chat'
  | 'flashcards'
  | 'habits'
  | 'pomodoro'
  | 'profile'
  | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

const tabs: Array<{
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Trang chủ', icon: Home },
  { id: 'chat', label: 'Trợ lý AI', icon: MessageSquare },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'habits', label: 'Thói quen', icon: Calendar },
  { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
];

function BottomNav({ activeTab, onTabChange, className = '' }: BottomNavProps) {
  return (
    <nav
      className={
        'fixed bottom-0 inset-x-0 z-50 border-t bg-white/95 dark:bg-studyflow-bg/95 dark:header-elevated backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-studyflow-bg/80 shadow-lg h-[var(--tabbar-h)] ' +
        className
      }
      aria-label="Bottom navigation"
    >
      <div className="max-w-screen-xl mx-auto px-2">
        <ul className="grid grid-cols-5 gap-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onTabChange(id)}
                  className={
                    'relative w-full flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg text-xs font-medium transition-all duration-200 ' +
                    (isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800')
                  }
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active indicator */}
                  <span
                    className={
                      'absolute top-1 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-all duration-200 ' +
                      (isActive
                        ? 'bg-blue-600 dark:bg-blue-400 opacity-100'
                        : 'bg-transparent opacity-0')
                    }
                    aria-hidden="true"
                  />
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="leading-none text-center">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default BottomNav;
