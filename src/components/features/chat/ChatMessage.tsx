import React from 'react';
import { Bot, User, Copy } from 'lucide-react';
import { Message } from '../../../types/chat';

// Định nghĩa hàm formatTime trong component
function formatTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex items-start space-x-3 max-w-[85%] lg:max-w-2xl ${
          message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.sender === 'user' ? 'text-white' : ''
          }`}
          style={{
            backgroundColor:
              message.sender === 'user'
                ? 'var(--app-primary)'
                : 'var(--app-surface)',
            borderRadius: 'var(--app-radius)',
          }}
        >
          {message.sender === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot
              className="h-4 w-4"
              style={{ color: 'var(--app-text-muted)' }}
            />
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <div
            className={`px-4 py-3 break-words relative group ${
              message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
            }`}
            style={{
              borderRadius:
                message.sender === 'user'
                  ? 'var(--app-radius) var(--app-radius) 6px var(--app-radius)'
                  : 'var(--app-radius) var(--app-radius) var(--app-radius) 6px',
            }}
          >
            <p
              className="whitespace-pre-line text-[15px] leading-6"
              style={{
                color: message.sender === 'user' ? 'white' : 'var(--app-text)',
              }}
            >
              {message.content}
            </p>

            {/* Copy button - chỉ hiển thị cho tin nhắn AI */}
            {message.sender === 'ai' && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:opacity-80 focus-visible:ring-2"
                style={{
                  borderRadius: 'var(--app-radius)',
                  backgroundColor: 'var(--app-surface)',
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
                  className="h-3 w-3"
                  style={{ color: 'var(--app-text-muted)' }}
                />
              </button>
            )}
          </div>

          <p
            className={`text-xs px-2 ${
              message.sender === 'user' ? 'text-right' : ''
            }`}
            style={{
              color:
                message.sender === 'user'
                  ? 'rgb(var(--app-blue-rgb) / 0.7)'
                  : 'var(--app-text-muted)',
            }}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}
