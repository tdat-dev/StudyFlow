import React from 'react';
// Button component
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
import {
  MessageSquare,
  BookOpen,
  Calendar,
  User,
  Settings,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'home', label: 'Trang chủ', icon: Calendar },
    { id: 'chat', label: 'Trợ lý AI', icon: MessageSquare },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'habits', label: 'Thói quen', icon: Calendar },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
    { id: 'profile', label: 'Hồ sơ', icon: User },
  ];

  return (
    <div className="w-64 bg-white dark:bg-studyflow-surface dark:surface-elevated border-r h-full flex flex-col">
      <div className="p-4 border-b" />

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 dark:text-gray-300"
          onClick={() => onTabChange('settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Cài đặt
        </Button>
      </div>
    </div>
  );
}
