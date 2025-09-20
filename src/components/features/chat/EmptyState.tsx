import React from 'react';
import { AISuggestions } from './AISuggestions';

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
  chatHistory?: Array<{ role: 'user' | 'model'; content: string }>;
}

export function EmptyState({
  onPromptClick,
  chatHistory = [],
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      {/* Welcome message with improved styling */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
          Khi bạn sẵn sàng là chúng ta có thể bắt đầu.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Tôi là AI Tutor của bạn, sẵn sàng giúp bạn học tập và phát triển. Hãy chọn một chủ đề bên dưới hoặc đặt câu hỏi bất kỳ!
        </p>
      </div>

      {/* AI Suggestions with improved layout */}
      <div className="w-full max-w-4xl">
        <AISuggestions
          onPromptClick={onPromptClick}
          chatHistory={chatHistory}
        />
      </div>

      {/* Footer hint with better styling */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">💡 Mẹo:</span>
          <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded">
            Enter
          </kbd>
          <span className="text-sm text-gray-600 dark:text-gray-400">để gửi</span>
          <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded">
            Shift + Enter
          </kbd>
          <span className="text-sm text-gray-600 dark:text-gray-400">để xuống dòng</span>
        </div>
      </div>
    </div>
  );
}
