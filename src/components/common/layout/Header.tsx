import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Logo from '../../ui/Logo';
import { useTheme } from 'next-themes';
import {
  LogOut,
  UserCircle,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';



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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
    if (typeof window !== 'undefined') {
      // Clear all localStorage data
      localStorage.clear();
      
      // Clear all sessionStorage data
      sessionStorage.clear();
      
      // Force a hard refresh
      window.location.reload();
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between relative z-50">
      {/* Left section - Logo */}
      <div className="flex items-center flex-shrink-0">
        <Logo size="small" showText={true} />
      </div>



      {/* Right section - User menu */}
      <div className="flex items-center flex-shrink-0">
        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            {/* Avatar - Larger like YouTube */}
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all">
                {getUserInitials(user)}
              </div>
            )}
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User info section */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                      {getUserInitials(user)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user?.displayName || user?.name || 'Người dùng'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                  Hồ sơ của bạn
                </button>
                
                <button
                  onClick={handleThemeToggle}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 mr-3 text-gray-500" />
                  ) : (
                    <Moon className="h-4 w-4 mr-3 text-gray-500" />
                  )}
                  {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                </button>

                <button
                  onClick={handleFullRefresh}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-3 text-gray-500" />
                  Làm mới ứng dụng
                </button>
              </div>

              <hr className="my-1 border-gray-200 dark:border-gray-600" />
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}