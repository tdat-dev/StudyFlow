import React from 'react';
import { Bot, User, Copy } from 'lucide-react';
import { Message as MessageType } from '../../../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

// Định nghĩa hàm formatTime trong component
function formatTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface MessageProps {
  message: MessageType;
  groupedWithPrev?: boolean;
  groupedWithNext?: boolean;
}

export function Message({
  message,
  groupedWithPrev = false,
  groupedWithNext = false,
}: MessageProps) {
  const isUser = message.sender === 'user';
  const isAssistant = message.sender === 'ai';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Avatar component with improved styling
  const Avatar = () => (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-purple-500 to-purple-600'
      }`}
    >
      {isUser ? (
        <User className="h-4 w-4 text-white" />
      ) : (
        <Bot className="h-4 w-4 text-white" />
      )}
    </div>
  );

  // Message header (name + timestamp) with improved styling
  const MessageHeader = () => (
    <div className="flex items-center space-x-2 mb-3">
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {isUser ? 'Bạn' : 'AI Tutor'}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );

  return (
    <div className="group mb-6">
      <div className="flex items-start space-x-3">
        {/* Avatar - only show for first message in group */}
        <div className="w-8 h-8 flex justify-center">
          {!groupedWithPrev ? <Avatar /> : null}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* Header - only show for first message in group */}
          {!groupedWithPrev && <MessageHeader />}

          {/* Message bubble with improved styling */}
          <div
            className={`relative break-words ${
              groupedWithNext ? 'mb-1' : 'mb-0'
            } ${groupedWithPrev ? '-mt-1' : ''} ${
              isUser 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            } rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200`}
            style={{ maxWidth: 'none' }}
          >
            {/* Message content padding */}
            <div className="px-4 py-3">
              {/* Copy button for AI messages */}
              {isAssistant && (
                <button
                  onClick={handleCopyMessage}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  title="Copy tin nhắn"
                >
                  <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                </button>
              )}

              {/* Message content - render as Markdown for AI, plain text for user */}
              {isAssistant ? (
                <div className="pr-8">
                  <MarkdownRenderer content={message.content} />
                </div>
              ) : (
                <p className="whitespace-pre-line text-[15px] leading-7 pr-8">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
