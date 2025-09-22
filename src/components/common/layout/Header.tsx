import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User, LogOut, Sun, Moon, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { hardRefresh } from '../../../utils/refresh';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  onNavigateToProfile?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Header({ user, onLogout, onNavigateToProfile }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }

    // Return undefined for the else case to satisfy TypeScript
    return undefined;
  }, [isDropdownOpen]);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const handleFullRefresh = () => {
    hardRefresh();
  };

  // Get user display name
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white dark:bg-studyflow-bg border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between relative z-50">
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Image
            alt="StudyFlow Logo"
            priority
            width={40}
            height={40}
            className="rounded-none border-0 outline-none ring-0"
            src="/images/logo.png"
          />
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
            StudyFlow
          </span>
        </div>
      </div>

      <div className="flex items-center flex-shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            {user?.photoURL ? (
              <Image
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
                src={user.photoURL}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all">
                <span className="text-white text-lg font-semibold">
                  {getUserInitials()}
                </span>
              </div>
            )}
          </button>

          {/* Dropdown menu - Compact */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-studyflow-surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {/* User info header - Compact */}
              <div className="flex items-center gap-2 px-3 py-2">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-700">
                    <span className="text-white text-sm font-semibold">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />

              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Hồ sơ của bạn</span>
              </button>

              <button
                onClick={handleThemeToggle}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span>Chế độ tối</span>
              </button>

              <button
                onClick={handleFullRefresh}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Làm mới ứng dụng</span>
              </button>

              <hr className="my-1 border-gray-200 dark:border-gray-700" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
