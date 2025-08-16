import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Logo from '../../ui/Logo';
import {
  LogOut,
  Settings,
  UserCircle,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

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
  activeTab,
  onTabChange,
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug user object
  console.log('Header user object:', user);

  // Đóng dropdown khi click bên ngoài hoặc nhấn ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown]);

  const handleProfileClick = () => {
    setShowDropdown(false);
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const handleSettingsClick = () => {
    // TODO: Navigate to settings page or show settings modal
    setShowDropdown(false);
    console.log('Navigate to settings');
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  // Hàm refresh hoàn toàn (xóa tất cả cache và state)
  const handleFullRefresh = () => {
    setShowDropdown(false);

    // Xóa tất cả localStorage
    localStorage.clear();

    // Xóa tất cả sessionStorage
    sessionStorage.clear();

    // Xóa service worker cache nếu có
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }

    // Xóa tất cả cookies
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });

    // Force reload với cache bypass
    window.location.reload();
  };

  // Get user initials for fallback avatar
  const getUserInitials = (user: any) => {
    if (user?.displayName || user?.name) {
      const name = user.displayName || user.name;
      return name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const userInitials = getUserInitials(user);

  // Debug: Log user object to see what properties are available
  useEffect(() => {
    if (user) {
      console.log('User object in Header:', user);
      console.log('photoURL:', user.photoURL);
      console.log('avatar:', user.avatar);
      console.log('picture:', user.picture);
      console.log('displayName:', user.displayName);
    }
  }, [user]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
      <div className="px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Logo size="xlarge" />

          {/* Desktop Navigation */}
          {onTabChange && (
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: 'home', label: 'Trang chủ', icon: '🏠' },
                { id: 'chat', label: 'AI Tutor', icon: '💬' },
                { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
                { id: 'habits', label: 'Thói quen', icon: '📈' },
                { id: 'pomodoro', label: 'Pomodoro', icon: '🍅' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Quick Refresh Button */}
            <button
              onClick={handleFullRefresh}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              title="Làm mới hoàn toàn (xóa cache và state)"
            >
              <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Mobile backdrop */}
                {showDropdown && (
                  <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setShowDropdown(false)}
                  />
                )}

                {/* Avatar Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="relative w-10 h-10">
                    {/* Always show fallback first */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-gray-200 shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {userInitials}
                      </span>
                    </div>

                    {/* Overlay with actual photo if available */}
                    {(user?.photoURL || user?.avatar || user?.picture) && (
                      <Image
                        src={user.photoURL || user.avatar || user.picture || ''}
                        alt={
                          user?.displayName ||
                          user?.name ||
                          user?.email ||
                          'User'
                        }
                        width={40}
                        height={40}
                        className="absolute inset-0 w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                        onLoad={() => {
                          // Image loaded successfully, keep it visible
                          console.log('Avatar loaded successfully');
                        }}
                        onError={() => {
                          // Hide broken image, show fallback
                          console.log('Avatar failed to load');
                        }}
                      />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-all duration-200 ${
                        showDropdown
                          ? 'rotate-180 text-blue-500'
                          : 'hover:text-gray-600'
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={user.name || user.email}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={() => {
                              console.log('Dropdown avatar failed to load');
                            }}
                          />
                        ) : null}

                        {/* Fallback avatar with initials */}
                        {!user.photoURL && (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {userInitials}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.name || user.displayName || 'Người dùng'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <UserCircle className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                        Xem hồ sơ
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                        Cài đặt
                      </button>

                      <button
                        onClick={handleFullRefresh}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/50 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                        Làm mới hoàn toàn
                      </button>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm">
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
