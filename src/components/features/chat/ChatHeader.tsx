import React, { useState } from 'react';
import { MessageSquare, Copy, Download } from 'lucide-react';
import Logo from '../../ui/Logo';
import { Message } from '../../../types/chat';
import { copyTranscript } from '../../../utils/transcript';
import { LanguageSelector } from './LanguageSelector';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  messages?: Message[];
}

export function ChatHeader({
  onToggleSidebar,
  messages = [],
}: ChatHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>(
    'idle',
  );

  const handleCopyTranscript = async (format: 'markdown' | 'plain') => {
    if (messages.length === 0) return;

    setCopyStatus('copying');
    const success = await copyTranscript(messages, format);

    if (success) {
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else {
      setCopyStatus('idle');
    }
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Ẩn/hiện lịch sử cuộc trò chuyện"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">🤖</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate text-gray-900 dark:text-gray-100">
              StudyFlow AI Tutor
            </h2>
            <p className="text-sm truncate text-gray-500 dark:text-gray-400">
              Trợ lý học tập thông minh
            </p>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-3">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Copy Transcript Actions */}
        {messages.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopyTranscript('markdown')}
              disabled={copyStatus === 'copying'}
              className="p-2 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Copy toàn bộ hội thoại (Markdown)"
            >
              <Copy className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleCopyTranscript('plain')}
              disabled={copyStatus === 'copying'}
              className="p-2 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Copy toàn bộ hội thoại (Plain text)"
            >
              <Download className="h-4 w-4" />
            </button>

            {copyStatus === 'success' && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Đã copy!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
