import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MessageSquare, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { Message, ChatSession, User } from '../../../types/chat';
import { FileContent } from '../../../services/fileProcessor';
import { studyFlowWelcomeMessage } from './welcome-config';
import { generateTutorResponse } from '../../../services/ai';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
  renameChatSession,
  saveMessage,
} from '../../../services/firebase/firestore';

// Tin nhắn chào mừng mặc định
const welcomeMessage: Message = {
  id: 'welcome-message',
  content: studyFlowWelcomeMessage,
  sender: 'ai',
  timestamp: new Date().toISOString(),
};

interface ChatWidgetProps {
  user: User;
}

type ChatWidgetState = 'closed' | 'minimized' | 'open' | 'fullscreen';

export function ChatWidget({ user }: ChatWidgetProps) {
  const [widgetState, setWidgetState] = useState<ChatWidgetState>('closed');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Auto-scroll đến tin nhắn mới nhất
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll khi messages thay đổi
  useEffect(() => {
    if (widgetState === 'open' || widgetState === 'fullscreen') {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, widgetState]);

  const generateUniqueId = (prefix: string = 'msg') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const loadChatSessions = useCallback(async () => {
    try {
      if (!user.accessToken) return;

      const sessions = await getChatSessions(user.accessToken);
      setChatSessions(sessions);

      // Nếu có sessions, chọn session đầu tiên, nếu không thì tạo mới
      if (sessions.length > 0) {
        setCurrentChatId(sessions[0].id);
      } else {
        createNewChat();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load chat sessions:', error);
      }
    }
  }, [user?.accessToken]);

  const loadChatHistory = useCallback(
    async (chatId: string) => {
      try {
        if (!user.accessToken) return;

        const loadedMessages = await getChatMessages(chatId);
        setMessages(loadedMessages);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load chat history:', error);
        }
      }
    },
    [user?.accessToken],
  );

  const createNewChat = async () => {
    if (!user.accessToken) return;

    try {
      const newSessionId = await createChatSession(user.accessToken);
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'Cuộc trò chuyện mới',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };

      setChatSessions([newSession, ...chatSessions]);
      setCurrentChatId(newSessionId);
      setMessages([welcomeMessage]);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create new chat:', error);
      }
    }
  };

  useEffect(() => {
    if (user && (widgetState === 'open' || widgetState === 'fullscreen')) {
      loadChatSessions();
    }
  }, [user, widgetState, loadChatSessions]);

  useEffect(() => {
    if (
      currentChatId &&
      (widgetState === 'open' || widgetState === 'fullscreen')
    ) {
      loadChatHistory(currentChatId);
    }
  }, [currentChatId, widgetState, loadChatHistory]);

  const handleFileAttach = (file: FileContent | null) => {
    // TODO: Implement file handling logic
    console.log('File attached:', file);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChatId) return;

    setLoading(true);

    try {
      const userMessage: Message = {
        id: generateUniqueId('user'),
        content,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      await saveMessage(currentChatId, userMessage);

      try {
        // Chuẩn bị lịch sử cho AI
        const recentHistory = messages.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content,
        })) as Array<{ role: 'user' | 'assistant'; content: string }>;
        const aiResponse = await generateTutorResponse(content, recentHistory);

        const aiMessage: Message = {
          id: generateUniqueId('ai'),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(currentChatId, aiMessage);

        // Nếu widget đang đóng/minimize, hiển thị thông báo có tin nhắn mới
        if (widgetState === 'closed' || widgetState === 'minimized') {
          setHasUnreadMessages(true);
        }

        if (messages.length <= 1) {
          const title =
            content.length > 30 ? content.substring(0, 30) + '...' : content;
          await renameChatSession(currentChatId, title);

          setChatSessions(prev => {
            return prev.map(session => {
              if (session.id === currentChatId) {
                return {
                  ...session,
                  title,
                  updatedAt: new Date().toISOString(),
                };
              }
              return session;
            });
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error generating AI response:', error);
        }

        const errorMessage: Message = {
          id: generateUniqueId('error'),
          content:
            '😅 Xin lỗi, tôi đang gặp một chút sự cố kỹ thuật! Hãy thử gửi lại tin nhắn.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, errorMessage]);
        await saveMessage(currentChatId, errorMessage);
      } finally {
        setIsTyping(false);
        setLoading(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      setIsTyping(false);
      setLoading(false);
    }
  };

  const toggleWidget = () => {
    if (widgetState === 'closed') {
      setWidgetState('open');
      setHasUnreadMessages(false);
    } else {
      setWidgetState('closed');
    }
  };

  const minimizeWidget = () => {
    setWidgetState('minimized');
  };

  const toggleFullscreen = () => {
    if (widgetState === 'fullscreen') {
      setWidgetState('open');
    } else {
      setWidgetState('fullscreen');
    }
  };

  // Floating Action Button
  if (widgetState === 'closed') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleWidget}
          className="relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageSquare size={24} />
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  // Minimized state
  if (widgetState === 'minimized') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-[#0B0F14] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl w-80 h-16">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageSquare size={16} className="text-white" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                StudyFlow AI
              </span>
              {hasUnreadMessages && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setWidgetState('open')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setWidgetState('closed')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Open or Fullscreen state
  const isFullscreen = widgetState === 'fullscreen';

  return (
    <div
      className={`fixed z-50 ${
        isFullscreen ? 'inset-0' : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <div className="bg-white dark:bg-[#0B0F14] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                StudyFlow AI
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Trợ lý học tập thông minh
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-gray-400"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={minimizeWidget}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-gray-400"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => setWidgetState('closed')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-gray-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0B0F14]">
          {messages.length === 0 ? (
            <EmptyState onPromptClick={handleSendMessage} />
          ) : (
            <>
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[75%] sm:max-w-xs">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="h-4 w-4 text-gray-500 dark:text-zinc-300" />
                    </div>
                    <div className="bg-white dark:bg-white/5 shadow-sm rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-white/10">
          <ChatInput
            onSendMessage={handleSendMessage}
            onFileAttach={handleFileAttach}
            loading={loading}
            disabled={!currentChatId}
          />
        </div>
      </div>
    </div>
  );
}
