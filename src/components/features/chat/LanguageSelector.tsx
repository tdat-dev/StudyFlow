import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export function LanguageSelector() {
  const { userLanguage, setUserLanguage, detectedLanguage } = useLanguage();

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="relative group">
      {/* Language Button */}
      <button
        className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        title={`Ngôn ngữ hiện tại: ${userLanguage === 'vi' ? 'Tiếng Việt' : 'English'}`}
      >
        <div className="flex items-center space-x-1">
          <Globe size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm">
            {languages.find(lang => lang.code === userLanguage)?.flag}
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[180px]">
        <div className="p-1">
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => setUserLanguage(language.code)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-center space-x-2">
                <span>{language.flag}</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {language.name}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                {/* Current selection indicator */}
                {userLanguage === language.code && (
                  <Check size={14} className="text-blue-500" />
                )}

                {/* Auto-detected indicator */}
                {detectedLanguage === language.code &&
                  userLanguage !== language.code && (
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      title="Ngôn ngữ được phát hiện tự động"
                    />
                  )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {detectedLanguage && (
              <div>
                Phát hiện:{' '}
                {languages.find(lang => lang.code === detectedLanguage)?.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
