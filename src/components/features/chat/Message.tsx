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

  // Avatar component
  const Avatar = () => (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        backgroundColor: isUser ? 'var(--app-primary)' : 'var(--app-surface)',
        borderColor: isUser ? 'transparent' : 'var(--app-border)',
        border: isUser ? 'none' : '1px solid',
      }}
    >
      {isUser ? (
        <User className="h-4 w-4 text-white" />
      ) : (
        <Bot className="h-4 w-4" style={{ color: 'var(--app-text-muted)' }} />
      )}
    </div>
  );

  // Message header (name + timestamp)
  const MessageHeader = () => (
    <div className="flex items-center space-x-2 mb-2">
      <span
        className="text-sm font-semibold"
        style={{ color: 'var(--app-text)' }}
      >
        {isUser ? 'Bạn' : 'AI Tutor'}
      </span>
      <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
        {formatTime(message.timestamp)}
      </span>
    </div>
  );

  return (
    <div className="group">
      <div className="flex items-start space-x-3">
        {/* Avatar - only show for first message in group */}
        <div className="w-7 h-7 flex justify-center">
          {!groupedWithPrev ? <Avatar /> : null}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* Header - only show for first message in group */}
          {!groupedWithPrev && <MessageHeader />}

          {/* Message bubble */}
          <div
            className={`relative px-4 py-3 break-words ${
              groupedWithNext ? 'mb-1' : 'mb-6'
            } ${groupedWithPrev ? '-mt-1' : ''}`}
            style={{
              backgroundColor: isUser ? 'var(--app-card)' : 'var(--app-card)',
              border: '1px solid var(--app-border)',
              borderRadius: 'var(--app-radius)',
              maxWidth: 'none',
            }}
          >
            {/* Copy button for AI messages */}
            {isAssistant && (
              <button
                onClick={handleCopyMessage}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded hover:bg-opacity-80 focus-visible:ring-2"
                style={{
                  backgroundColor: 'var(--app-surface)',
                  borderRadius: 'var(--app-radius)',
                }}
                onFocus={e => {
                  e.currentTarget.style.outline = '2px solid var(--app-ring)';
                }}
                onBlur={e => {
                  e.currentTarget.style.outline = 'none';
                }}
                title="Copy tin nhắn"
              >
                <Copy
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--app-text-muted)' }}
                />
              </button>
            )}

            {/* Message content - render as Markdown for AI, plain text for user */}
            {isAssistant ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <p
                className="whitespace-pre-line text-[15px] leading-7"
                style={{ color: 'var(--app-text)' }}
              >
                {message.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
