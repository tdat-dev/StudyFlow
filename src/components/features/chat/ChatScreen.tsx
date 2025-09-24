import React, { useState, useEffect, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import { X, File, FileText, Image } from 'lucide-react';
import { Message, ChatSession, User } from '../../../types/chat';
import { auth } from '../../../services/firebase/config';
import { studyFlowWelcomeMessage } from './welcome-config';
import { generateTutorResponse } from '../../../services/ai';
import {
  FileContent,
  formatFileForAI,
  createFilePreviewMessage,
} from '../../../services/fileProcessor';

import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { ChatList } from './ChatList';
import { EmptyState } from './EmptyState';
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
  deleteChatSession,
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

interface ChatScreenProps {
  user: User;
}

export function ChatScreen({ user }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State quản lý chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true); // Desktop sidebar toggle

  // State quản lý file attachment
  const [attachedFile, setAttachedFile] = useState<FileContent | null>(null);

  // Hàm toggle sidebar thông minh cho cả mobile và desktop
  const handleToggleSidebar = () => {
    // Kiểm tra screen size để quyết định toggle nào
    const isDesktop = window.innerWidth >= 1024; // lg breakpoint

    if (isDesktop) {
      setShowDesktopSidebar(!showDesktopSidebar);
    } else {
      setShowSidebar(!showSidebar);
    }
  };

  // Listen for window resize để đảm bảo sidebar behavior đúng
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        // Đóng mobile sidebar khi chuyển sang desktop
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll đến tin nhắn mới nhất
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Tạo unique ID
  const generateUniqueId = (prefix: string = 'msg') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Lấy icon và class phù hợp cho file
  const getFileIcon = (file: FileContent) => {
    if (file.type.startsWith('image/')) {
      // eslint-disable-next-line jsx-a11y/alt-text
      return { icon: <Image className="h-4 w-4" />, className: 'image' };
    }
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return { icon: <File className="h-4 w-4" />, className: 'pdf' };
    }
    if (
      file.type.includes('text') ||
      file.name.match(/\.(txt|md|js|ts|css|html|json)$/i)
    ) {
      return { icon: <FileText className="h-4 w-4" />, className: 'text' };
    }
    return { icon: <File className="h-4 w-4" />, className: '' };
  };

  // Load chat sessions
  const loadChatSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        return;
      }

      const sessions = await getChatSessions(uid);
      setChatSessions(sessions);

      // Không tự động chọn chat đầu tiên - để người dùng tự chọn
      // Hiển thị giao diện chính (EmptyState) khi vào tab chat
      setCurrentChatId(null);
      setMessages([]);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  // Load tin nhắn từ chat hiện tại
  const loadChatHistory = useCallback(async (chatId: string) => {
    if (!chatId) return;

    setLoading(true);
    try {
      const loadedMessages = await getChatMessages(chatId);

      if (loadedMessages.length === 0) {
        // Nếu không có tin nhắn, hiển thị welcome message
        setMessages([welcomeMessage]);
        await saveMessage(chatId, welcomeMessage);
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([welcomeMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Về menu chính (không tạo chat session mới)
  const handleCreateNewChat = async () => {
    // Chỉ reset về trạng thái ban đầu
    setCurrentChatId(null);
    setMessages([]);
    setAttachedFile(null); // Clear attached file
  };

  // Xử lý file attachment
  const handleFileAttach = (file: FileContent | null) => {
    console.log('🔥 handleFileAttach được gọi với file:', file);
    setAttachedFile(file);
  };

  // Xóa chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChatSession(chatId);
      const updatedSessions = chatSessions.filter(
        session => session.id !== chatId,
      );
      setChatSessions(updatedSessions);

      if (chatId === currentChatId) {
        // Luôn về giao diện chính sau khi xóa chat hiện tại
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Đổi tên chat
  const handleRenameChat = async (chatId: string, newTitle: string) => {
    const chat = chatSessions.find(session => session.id === chatId);
    if (!chat || !newTitle.trim()) return;

    // Không cần prompt nữa vì đã có newTitle từ inline editing
    if (newTitle.trim() === chat.title) return;

    try {
      await renameChatSession(chatId, newTitle.trim());
      setChatSessions(sessions =>
        sessions.map(session =>
          session.id === chatId
            ? {
                ...session,
                title: newTitle.trim(),
                updatedAt: new Date().toISOString(),
              }
            : session,
        ),
      );
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (content: string) => {
    const fileContent = attachedFile; // Sử dụng file đã attach

    if ((!content.trim() && !fileContent) || loading) return;

    setLoading(true);

    try {
      let chatId = currentChatId;

      // Nếu chưa có chat nào, tạo chat mới
      if (!chatId) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const newSessionId = await createChatSession(uid);
        const newSession: ChatSession = {
          id: newSessionId,
          title: 'Cuộc trò chuyện mới',
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        };

        setChatSessions(prev => [newSession, ...prev]);
        setCurrentChatId(newSessionId);
        chatId = newSessionId;

        // Nếu đây là chat đầu tiên, xóa welcome message
        setMessages([]);
      }

      // Tạo tin nhắn user với file nếu có
      let userMessageContent = content.trim();
      let aiPrompt = content.trim();

      if (fileContent) {
        // Tạo preview message cho UI
        userMessageContent = createFilePreviewMessage(fileContent, content);
        // Tạo prompt có nội dung file cho AI
        aiPrompt = formatFileForAI(fileContent, content);
      }

      const userMessage: Message = {
        id: generateUniqueId('user'),
        content: userMessageContent,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      // Thêm vào UI ngay lập tức
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Lưu tin nhắn user
      await saveMessage(chatId, userMessage);

      try {
        // Chuẩn bị lịch sử cho AI (chuyển đổi format)
        const recentHistory = messages.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content,
        })) as Array<{ role: 'user' | 'assistant'; content: string }>;

        // Gọi AI với prompt có file content nếu có
        const aiResponse = await generateTutorResponse(aiPrompt, recentHistory);

        // Tạo tin nhắn AI
        const aiMessage: Message = {
          id: generateUniqueId('ai'),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };

        // Thêm vào UI
        setMessages(prev => [...prev, aiMessage]);

        // Lưu tin nhắn AI
        await saveMessage(chatId, aiMessage);

        // Clear attached file sau khi gửi thành công
        setAttachedFile(null);

        // Tự động đổi tên chat nếu đây là tin nhắn đầu tiên
        if (messages.length <= 1) {
          try {
            // Import function động để tránh circular dependency
            const { generateChatTitle } = await import(
              '../../../services/ai/chatNaming'
            );
            // Sử dụng nội dung gốc để tạo title, không phải aiPrompt có file content
            const titleContent =
              content.trim() ||
              (fileContent
                ? `Phân tích file ${fileContent.name}`
                : 'Cuộc trò chuyện mới');
            const title = await generateChatTitle(titleContent);

            await renameChatSession(chatId, title);

            setChatSessions(prev =>
              prev.map(session =>
                session.id === currentChatId
                  ? { ...session, title, updatedAt: new Date().toISOString() }
                  : session,
              ),
            );
          } catch (error) {
            console.error('Error generating chat title:', error);
            // Fallback về cách cũ
            const fallbackTitle =
              content.trim() ||
              (fileContent
                ? `File: ${fileContent.name}`
                : 'Cuộc trò chuyện mới');
            const finalTitle =
              fallbackTitle.length > 30
                ? fallbackTitle.substring(0, 30) + '...'
                : fallbackTitle;

            await renameChatSession(chatId, finalTitle);
            setChatSessions(prev =>
              prev.map(session =>
                session.id === currentChatId
                  ? {
                      ...session,
                      title: finalTitle,
                      updatedAt: new Date().toISOString(),
                    }
                  : session,
              ),
            );
          }
        }
      } catch (error) {
        console.error('Error generating AI response:', error);

        // Tin nhắn lỗi
        const errorMessage: Message = {
          id: generateUniqueId('error'),
          content:
            '😅 Xin lỗi, tôi đang gặp một chút sự cố kỹ thuật! Hãy thử gửi lại tin nhắn.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, errorMessage]);
        await saveMessage(chatId, errorMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user, loadChatSessions]);

  // Reset về giao diện chính khi component mount lại (khi chuyển tab)
  useEffect(() => {
    // Đảm bảo luôn bắt đầu với giao diện chính
    setCurrentChatId(null);
    setMessages([]);
    setAttachedFile(null);
  }, []);

  // Load chat history khi chuyển chat
  useEffect(() => {
    if (currentChatId) {
      loadChatHistory(currentChatId);
    }
  }, [currentChatId, loadChatHistory]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-studyflow-bg">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <div className="absolute left-0 top-0 bottom-0 w-80 shadow-xl border-r bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <ChatList
              sessions={chatSessions}
              currentChatId={currentChatId}
              onSelectChat={chatId => {
                setCurrentChatId(chatId);
                setShowSidebar(false); // Auto close on mobile
              }}
              onNewChat={handleCreateNewChat}
              onRenameChat={handleRenameChat}
              onDeleteChat={handleDeleteChat}
              loading={loadingSessions}
            />
          </div>
          <div
            className="absolute inset-0"
            onClick={() => setShowSidebar(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar - Edge to edge */}
      {showDesktopSidebar && (
        <div className="hidden lg:flex w-80 flex-shrink-0 border-r bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex-1 overflow-y-auto">
            <ChatList
              sessions={chatSessions}
              currentChatId={currentChatId}
              onSelectChat={setCurrentChatId}
              onNewChat={handleCreateNewChat}
              onRenameChat={handleRenameChat}
              onDeleteChat={handleDeleteChat}
              loading={loadingSessions}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-studyflow-bg h-full">
        {/* Header with glass effect */}
        <div className="flex-shrink-0 px-4 lg:px-6 py-4 border-b glass-surface border-gray-200 dark:border-gray-700">
          <ChatHeader
            onToggleSidebar={handleToggleSidebar}
            messages={messages}
          />
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {!currentChatId || (messages.length === 0 && !loading) ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                onPromptClick={handleSendMessage}
                chatHistory={messages.map(msg => ({
                  role:
                    msg.sender === 'user'
                      ? ('user' as const)
                      : ('model' as const),
                  content: msg.content,
                }))}
              />
            </div>
          ) : (
            <div className="flex-1 py-6">
              <MessageList messages={messages} />

              {/* Typing Indicator */}
              {isTyping && (
                <div className="content-column">
                  <div className="flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        AI
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500 dark:bg-gray-400"></div>
                        <div
                          className="w-2 h-2 rounded-full animate-bounce bg-gray-500 dark:bg-gray-400"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area with glass effect */}
        <div className="flex-shrink-0 py-4 border-t glass-surface border-gray-200 dark:border-gray-700">
          {/* File Preview - Show right above input */}
          {attachedFile && (
            <div className="px-4 lg:px-6 mb-3">
              <div className="content-column">
                <div className="attached-file-preview">
                  <div className="attached-file-content">
                    {attachedFile.preview ? (
                      <NextImage
                        src={attachedFile.preview}
                        alt={attachedFile.name}
                        width={100}
                        height={100}
                        className="attached-file-image"
                      />
                    ) : (
                      (() => {
                        const fileIconData = getFileIcon(attachedFile);
                        return (
                          <div
                            className={`attached-file-icon ${fileIconData.className}`}
                          >
                            {fileIconData.icon}
                          </div>
                        );
                      })()
                    )}
                    <div className="attached-file-info">
                      <div className="attached-file-name">
                        {attachedFile.name}
                      </div>
                      <div className="attached-file-size">
                        {(attachedFile.size / 1024).toFixed(1)}KB
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="attached-file-remove"
                      title="Xóa file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="composer-container px-4 lg:px-6">
            <ChatInput
              onSendMessage={handleSendMessage}
              onFileAttach={handleFileAttach}
              loading={loading}
              attachedFile={attachedFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
