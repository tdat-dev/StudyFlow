import React from 'react';
import { Message } from '../../types/chat';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  groupedWithPrev?: boolean;
  groupedWithNext?: boolean;
}

export function ChatBubble({ 
  message, 
  groupedWithPrev = false, 
  groupedWithNext = false 
}: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${groupedWithPrev ? 'invisible' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-gradient-to-br from-green-500 to-teal-600'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Sender Name */}
          {!groupedWithPrev && (
            <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 px-1`}>
              {isUser ? 'Bạn' : 'StudyFlow AI'}
            </div>
          )}

          {/* Message Bubble */}
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md'
              : 'bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-bl-md'
          } ${groupedWithNext ? 'rounded-b-none' : ''} ${groupedWithPrev ? 'rounded-t-none' : ''}`}>
            
            {/* Message Text */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Timestamp */}
            <div className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-400'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
