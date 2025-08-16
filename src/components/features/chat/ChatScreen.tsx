import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import Button from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Message, ChatSession, User, QuickAction } from '../../../types/chat';
import {
  studyFlowWelcomeMessage,
  studyFlowQuickActions,
} from './welcome-config';
// Gemini AI Tutor service
import {
  generateTutorResponse,
  type ChatTurn,
} from '../../../services/ai/tutor';

import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ChatList } from './ChatList';
import { QuickActions } from './QuickActions';
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

const quickActions = studyFlowQuickActions;

interface ChatScreenProps {
  user: User;
}

export function ChatScreen({ user }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State cho quản lý chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(() => {
    // Lấy từ localStorage, mặc định là true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatSidebarVisible');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');

  // Auto-scroll đến tin nhắn mới nhất
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll khi messages thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Lưu trạng thái sidebar vào localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSidebarVisible', JSON.stringify(showSidebar));
    }
  }, [showSidebar]);

  // Định nghĩa các hàm trước khi sử dụng trong useEffect
  const loadChatSessions = useCallback(async () => {
    setLoadingSessions(true);

    try {
      if (!user.accessToken) {
        if (process.env.NODE_ENV === 'development') {
          console.error('User not logged in');
        }
        setLoadingSessions(false);
        return;
      }

      const sessions = await getChatSessions(user.accessToken);
      setChatSessions(sessions);

      // Nếu có sessions, chọn session đầu tiên
      if (sessions.length > 0) {
        setCurrentChatId(sessions[0].id);
      } else {
        // Nếu không có sessions, tạo mới
        createNewChat();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load chat sessions:', error);
      }
    } finally {
      setLoadingSessions(false);
    }
  }, [user?.accessToken]);

  const loadChatHistory = useCallback(
    async (chatId: string) => {
      setLoading(true);
      setMessages([]);

      try {
        if (!user.accessToken) {
          if (process.env.NODE_ENV === 'development') {
            console.error('User not logged in');
          }
          setLoading(false);
          return;
        }

        try {
          // Lấy tin nhắn từ Firestore
          const loadedMessages = await getChatMessages(chatId);

          if (loadedMessages.length === 0) {
            // Nếu không có tin nhắn, hiển thị tin nhắn chào mừng
            setMessages([welcomeMessage]);

            // Lưu tin nhắn chào mừng vào Firestore
            await saveMessage(chatId, {
              id: welcomeMessage.id,
              content: welcomeMessage.content,
              sender: welcomeMessage.sender,
              timestamp: welcomeMessage.timestamp,
            });
          } else {
            setMessages(loadedMessages);
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading chat history:', err);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load chat history:', error);
        }
      } finally {
        setLoading(false);
      }
    },
    [user?.accessToken],
  );

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
    // Chỉ chạy lại khi token người dùng thay đổi
  }, [user, loadChatSessions]);

  useEffect(() => {
    if (currentChatId) {
      loadChatHistory(currentChatId);
    }
  }, [currentChatId, loadChatHistory]);

  const generateUniqueId = (prefix: string = 'msg') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createNewChat = async () => {
    if (!user.accessToken) return;

    try {
      // Tạo chat session mới
      const newSessionId = await createChatSession(user.accessToken);

      // Cập nhật danh sách sessions
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'Cuộc trò chuyện mới',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };

      setChatSessions([newSession, ...chatSessions]);
      setCurrentChatId(newSessionId);

      // Set welcome message cho chat mới
      setMessages([welcomeMessage]);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create new chat:', error);
      }
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user.accessToken) return;

    try {
      // Xóa chat session từ Firestore
      await deleteChatSession(chatId);

      // Cập nhật danh sách sessions
      const updatedSessions = chatSessions.filter(
        session => session.id !== chatId,
      );
      setChatSessions(updatedSessions);

      // Nếu xóa session hiện tại, chọn session khác hoặc tạo mới
      if (chatId === currentChatId) {
        if (updatedSessions.length > 0) {
          setCurrentChatId(updatedSessions[0].id);
        } else {
          createNewChat();
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  const handleRenameChat = (chatId: string) => {
    // Tìm tiêu đề hiện tại của chat
    const chat = chatSessions.find(session => session.id === chatId);
    if (chat) {
      setNewChatTitle(chat.title);
      setChatToRename(chatId);
      setRenameDialogOpen(true);
    }
  };

  const confirmRenameChat = async () => {
    if (!user.accessToken || !chatToRename || !newChatTitle.trim()) return;

    try {
      // Cập nhật tiêu đề chat trong Firestore
      await renameChatSession(chatToRename, newChatTitle.trim());

      // Cập nhật danh sách sessions
      const updatedSessions = chatSessions.map(session => {
        if (session.id === chatToRename) {
          return {
            ...session,
            title: newChatTitle.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
        return session;
      });

      setChatSessions(updatedSessions);
      setRenameDialogOpen(false);
      setChatToRename(null);
      setNewChatTitle('');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to rename chat:', error);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChatId) return;

    setLoading(true);

    try {
      // Thêm tin nhắn người dùng vào UI
      const userMessage: Message = {
        id: generateUniqueId('user'),
        content,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Lưu tin nhắn người dùng vào Firestore
      await saveMessage(currentChatId, userMessage);

      try {
        // Tạo AI response từ Gemini với một phần lịch sử hội thoại gần nhất
        const recentHistory: ChatTurn[] = messages.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.content,
        }));
        const aiResponse = await generateTutorResponse(content, recentHistory);

        // Tạo tin nhắn AI
        const aiMessage: Message = {
          id: generateUniqueId('ai'),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };

        // Hiển thị tin nhắn AI
        setMessages(prev => [...prev, aiMessage]);

        // Lưu tin nhắn AI vào Firestore
        await saveMessage(currentChatId, aiMessage);

        // Cập nhật tiêu đề chat nếu là tin nhắn đầu tiên của người dùng
        if (messages.length <= 1) {
          const title =
            content.length > 30 ? content.substring(0, 30) + '...' : content;
          await renameChatSession(currentChatId, title);

          // Cập nhật danh sách sessions
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

        // Hiển thị thông báo lỗi cho người dùng
        const errorMessage: Message = {
          id: generateUniqueId('error'),
          content:
            '😅 Xin lỗi, tôi đang gặp một chút sự cố kỹ thuật!\n\n🔄 **Hãy thử:**\n• Gửi lại tin nhắn\n• Kiểm tra kết nối internet\n• Chờ vài giây rồi thử lại\n\n📚 **Trong lúc chờ bạn có thể:**\n• Tạo flashcards mới\n• Ôn tập với Pomodoro timer\n• Kiểm tra tiến độ học tập\n\n💪 Tôi sẽ sớm quay lại để tiếp tục hỗ trợ bạn!',
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

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  return (
    <div className="h-full w-full flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Dialog đổi tên chat */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newChatTitle}
              onChange={e => setNewChatTitle(e.target.value)}
              placeholder="Nhập tên mới cho cuộc trò chuyện"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false);
                setChatToRename(null);
                setNewChatTitle('');
              }}
            >
              Hủy
            </Button>
            <Button onClick={confirmRenameChat}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${showSidebar ? 'w-64' : 'w-0'} overflow-hidden`}
      >
        {showSidebar && (
          <ChatList
            sessions={chatSessions}
            currentChatId={currentChatId}
            onSelectChat={setCurrentChatId}
            onNewChat={createNewChat}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            loading={loadingSessions}
          />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 w-0">
        {/* Header */}
        <div className="flex-shrink-0">
          <ChatHeader
            onNewChat={createNewChat}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex-shrink-0">
          <QuickActions
            actions={quickActions}
            onActionClick={handleQuickAction}
            disabled={loading || !currentChatId}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[75%] sm:max-w-xs">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="bg-white dark:bg-gray-700 border shadow-sm rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            loading={loading}
            disabled={!currentChatId}
          />
        </div>
      </div>
    </div>
  );
}
