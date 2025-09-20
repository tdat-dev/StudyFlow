import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, ChatSession, User } from '../../../types/chat';
import { generateTutorResponse } from '../../../services/ai';
import { FileContent, formatFileForAI } from '../../.      {/* Left Sidebar - Chat Sessions */}
      {showDesktopSidebar && (
        <div
          className="hidden lg:block lg:w-80 xl:w-96"
          style={{ display: 'block', visibility: 'visible', opacity: 1 }}
        >
          <ChatSidebar
            sessions={chatSessions}
            currentSessionId={currentChatId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        </div>
      )}eProcessor';
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
  deleteChatSession,
  renameChatSession,
  saveMessage,
} from '../../../services/firebase/firestore';

import { ChatBubble } from '../../ui/ChatBubble';
import { ChatSidebar } from '../../ui/ChatSidebar';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import Button from '../../ui/button';
import { Menu } from 'lucide-react';

// Tin nhắn chào mừng mặc định
const welcomeMessage: Message = {
  id: 'welcome-message',
  content:
    'Xin chào! Tôi là AI Tutor của StudyFlow. Tôi có thể giúp bạn học từ vựng, giải thích ngữ pháp, tạo bài tập và trả lời mọi câu hỏi về tiếng Anh. Hãy bắt đầu cuộc trò chuyện nhé! 🚀',
  sender: 'ai',
  timestamp: new Date().toISOString(),
};

interface ChatScreenNewProps {
  user: User;
}

export default function ChatScreenNew({ user }: ChatScreenNewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State quản lý chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);

  // File attachment state
  const [attachedFile, setAttachedFile] = useState<FileContent | null>(null);

  // Hàm toggle sidebar thông minh cho cả mobile và desktop
  const handleToggleSidebar = () => {
    // Kiểm tra screen size để quyết định toggle nào
    const isDesktop = window.innerWidth >= 1024; // lg breakpoint

    if (isDesktop) {
      setShowDesktopSidebar(!showDesktopSidebar);
    } else {
      setShowMobileSidebar(!showMobileSidebar);
    }
  };

  // Listen for window resize để đảm bảo sidebar behavior đúng
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        // Đóng mobile sidebar khi chuyển sang desktop
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load chat sessions
  const loadChatSessions = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const sessions = await getChatSessions(user?.uid || '');
      setChatSessions(sessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  }, [user.uid]);

  // Load messages for current chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const chatMessages = await getChatMessages(chatId);
      setMessages(chatMessages.length > 0 ? chatMessages : [welcomeMessage]);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([welcomeMessage]);
    }
  }, []);

  // Create new chat
  const handleNewChat = async () => {
    if (!user?.uid) return;

    try {
      const newSessionId = await createChatSession(user?.uid || '');
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'Cuộc trò chuyện mới',
        userId: user?.uid || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentChatId(newSessionId);
      setMessages([welcomeMessage]);
      setShowMobileSidebar(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  // Select chat session
  const handleSelectSession = async (sessionId: string) => {
    setCurrentChatId(sessionId);
    await loadMessages(sessionId);
    setShowMobileSidebar(false);
  };

  // Delete chat session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));

      if (currentChatId === sessionId) {
        setCurrentChatId(null);
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  // Rename chat session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await renameChatSession(sessionId, newTitle);
      setChatSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, title: newTitle } : s)),
      );
    } catch (error) {
      console.error('Error renaming chat session:', error);
    }
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    setIsTyping(true);

    try {
      let chatId = currentChatId;

      // Nếu chưa có chat, tạo chat mới
      if (!chatId) {
        if (!user?.uid) return;

        const newSessionId = await createChatSession(user?.uid || '');
        const newSession: ChatSession = {
          id: newSessionId,
          title: 'Cuộc trò chuyện mới',
          userId: user?.uid || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        };
        setChatSessions(prev => [newSession, ...prev]);
        setCurrentChatId(newSessionId);
        chatId = newSessionId;
        setMessages([]); // Clear welcome message
      }

      const userMessage: Message = {
        id: generateUniqueId('user'),
        content,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      await saveMessage(chatId, userMessage);

      // Prepare AI prompt with file content if attached
      let aiPrompt = content;
      if (attachedFile) {
        const fileContent = formatFileForAI(attachedFile, content);
        aiPrompt = `${content}\n\nFile đính kèm:\n${fileContent}`;
      }

      // Prepare recent history for AI
      const recentHistory = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      })) as Array<{ role: 'user' | 'assistant'; content: string }>;

      // Generate AI response
      const aiResponse = await generateTutorResponse(aiPrompt, recentHistory);

      const aiMessage: Message = {
        id: generateUniqueId('ai'),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(chatId, aiMessage);

      // Clear attached file
      setAttachedFile(null);

      // Auto-rename chat if first message
      if (messages.length <= 1) {
        const title =
          content.length > 30 ? content.substring(0, 30) + '...' : content;
        await handleRenameSession(chatId, title);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Handle file attachment
  const handleFileAttach = (file: FileContent | null) => {
    setAttachedFile(file);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  // Generate unique ID
  const generateUniqueId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <div
      className="h-full w-full bg-gradient-to-b from-slate-950 to-slate-900 flex chat-container"
      style={{ height: '100%', display: 'flex', flexDirection: 'row' }}
    >
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative w-80 h-full">
            <ChatSidebar
              sessions={chatSessions}
              currentSessionId={currentChatId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              onRenameSession={handleRenameSession}
            />
          </div>
        </div>
      )}

      {/* Left Sidebar - Chat Sessions */}
      <div
        className="hidden lg:block lg:w-80 xl:w-96"
        style={{ display: 'block', visibility: 'visible', opacity: 1 }}
      >
        <ChatSidebar
          sessions={chatSessions}
          currentSessionId={currentChatId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
        />
      </div>

      {/* Main Chat Area */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Header */}
        <div
          className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between"
          style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">AI Tutor</h1>
              <p className="text-sm text-white/60">
                {currentChatId
                  ? 'Đang trò chuyện'
                  : 'Chọn cuộc trò chuyện để bắt đầu'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto scrollbar-custom min-h-0"
          style={{
            flex: 1,
            minHeight: 0,
            display: 'block',
            visibility: 'visible',
            opacity: 1,
          }}
        >
          {messages.length === 0 ? (
            <EmptyState onPromptClick={handleSendMessage} />
          ) : (
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  groupedWithPrev={
                    index > 0 && messages[index - 1].sender === message.sender
                  }
                  groupedWithNext={
                    index < messages.length - 1 &&
                    messages[index + 1].sender === message.sender
                  }
                />
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                      <div className="w-4 h-4 text-white">🤖</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className="bg-white/5 backdrop-blur-md border-t border-white/10 p-4 flex-shrink-0"
          style={{
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
            minHeight: '80px',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px',
            boxSizing: 'border-box',
            margin: 0,
            overflow: 'visible',
            clear: 'both',
            float: 'none',
            top: 'auto',
            bottom: 'auto',
            left: 'auto',
            right: 'auto',
            transform: 'none',
            clip: 'auto',
            filter: 'none',
            mask: 'none',
            isolation: 'auto',
            contain: 'none',
            willChange: 'auto',
            backfaceVisibility: 'visible',
            perspective: 'none',
            mixBlendMode: 'normal',
            objectFit: 'fill',
            objectPosition: '50% 50%',
            textRendering: 'auto',
            fontSmooth: 'auto',
            fontKerning: 'auto',
            fontVariantLigatures: 'normal',
            fontVariantCaps: 'normal',
            fontVariantNumeric: 'normal',
            fontVariantEastAsian: 'normal',
            fontVariantAlternates: 'normal',
            fontVariantPosition: 'normal',
            fontVariantEmoji: 'normal',
            fontVariationSettings: 'normal',
            fontOpticalSizing: 'auto',
            fontPalette: 'normal',
            fontSynthesis: 'auto',
            fontSynthesisWeight: 'auto',
            fontSynthesisStyle: 'auto',
            fontSynthesisSmallCaps: 'auto',
          }}
        >
          <ChatInput
            onSendMessage={handleSendMessage}
            onFileAttach={handleFileAttach}
            loading={loading}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}
