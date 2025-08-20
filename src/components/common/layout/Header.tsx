import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  RefreshCw,
  ChevronDown 
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { hardRefresh } from '../../../utils/refresh';
import Logo from '../../ui/Logo';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  onNavigateToProfile?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Header({
  user,
  onLogout,
  onNavigateToProfile,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-14 px-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title using public image */}
        <div className="flex items-center space-x-2">
          <Logo size="large" showText={false} className="scale-110" />
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Refresh button */}
          <button
            onClick={handleFullRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Làm mới ứng dụng"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* User avatar */}
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-700">
                  <span className="text-white text-base font-semibold">
                    {getUserInitials()}
                  </span>
                </div>
              )}
              
              {/* Chevron only on md+ for cleaner look */}
              <ChevronDown className={`hidden md:block w-4 h-4 text-gray-500 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </button>
                
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}