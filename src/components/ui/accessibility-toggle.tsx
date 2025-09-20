import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AccessibilityToggleProps {
  className?: string;
}

export function AccessibilityToggle({ className = '' }: AccessibilityToggleProps) {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Check if user prefers high contrast
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    setHighContrast(prefersHighContrast);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Save preference to localStorage
    localStorage.setItem('highContrast', newValue.toString());
  };

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('highContrast');
    if (saved !== null) {
      const isHighContrast = saved === 'true';
      setHighContrast(isHighContrast);
      if (isHighContrast) {
        document.documentElement.classList.add('high-contrast');
      }
    }
  }, []);

  return (
    <button
      onClick={toggleHighContrast}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        highContrast
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      } ${className}`}
      title={highContrast ? 'Tắt chế độ tương phản cao' : 'Bật chế độ tương phản cao'}
      aria-label={highContrast ? 'Tắt chế độ tương phản cao' : 'Bật chế độ tương phản cao'}
    >
      {highContrast ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {highContrast ? 'Tương phản cao' : 'Tương phản thường'}
      </span>
    </button>
  );
}
