import { useState, useEffect, useCallback } from 'react';
import { Message, ChatSession, User } from '../types/chat';
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
  deleteChatSession,
  renameChatSession,
  saveMessage as saveChatMessage,
} from '../services/firebase/firestore';

// Định nghĩa hàm generateAIResponse trong hook
async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    // Trong môi trường development, log prompt
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Generating AI response for:',
        userMessage.substring(0, 100) + '...',
      );
    }

    // Giả lập phản hồi từ AI
    return 'Xin chào! Tôi là AI Tutor Agent, người bạn đồng hành của bạn. Tôi có thể giúp bạn học tập hiệu quả hơn.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Tin nhắn chào mừng mặc định
const welcomeMessage: Message = {
  id: 'welcome-message',
  content:
    'Xin chào! Tôi là AI Tutor Agent, người bạn đồng hành của bạn. Tôi có thể giúp bạn:\n\n1. Tạo flashcards cho mọi môn học\n2. Giải thích các khái niệm học tập\n3. Đặt câu hỏi ôn tập kiến thức\n4. Gợi ý phương pháp học hiệu quả\n5. Trò chuyện và lắng nghe bạn về mọi chủ đề\n6. Hỗ trợ bạn bằng nhiều ngôn ngữ khác nhau\n\nBạn muốn trò chuyện về điều gì hôm nay?',
  sender: 'ai',
  timestamp: new Date().toISOString(),
};

export function useChat(user: User) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Hàm tạo ID duy nhất
  const generateUniqueId = (prefix: string = 'msg') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Định nghĩa hàm loadChatSessions với useCallback
  const loadChatSessions = useCallback(async () => {
    if (!user?.accessToken) return;

    setLoadingSessions(true);

    try {
      const sessions = await getChatSessions(user.accessToken);
      setChatSessions(sessions);

      // Nếu có sessions, chọn session đầu tiên
      if (sessions.length > 0) {
        setCurrentChatId(sessions[0].id);
      } else {
        // Nếu không có sessions, tạo mới
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Định nghĩa hàm loadChatHistory với useCallback
  const loadChatHistory = useCallback(
    async (chatId: string) => {
      if (!user?.accessToken) return;

      setLoading(true);
      setMessages([]);

      try {
        // Lấy tin nhắn từ Firestore
        const loadedMessages = await getChatMessages(chatId);

        if (loadedMessages.length === 0) {
          // Nếu không có tin nhắn, hiển thị tin nhắn chào mừng
          setMessages([welcomeMessage]);

          // Lưu tin nhắn chào mừng vào Firestore
          await saveChatMessage(chatId, {
            id: welcomeMessage.id,
            content: welcomeMessage.content,
            sender: welcomeMessage.sender,
            timestamp: welcomeMessage.timestamp,
          });
        } else {
          setMessages(loadedMessages);
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

  // Định nghĩa hàm createNewChat
  const createNewChat = useCallback(async () => {
    if (!user?.accessToken) return;

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

      setChatSessions(prev => [newSession, ...prev]);
      setCurrentChatId(newSessionId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create new chat:', error);
      }
    }
  }, [user?.accessToken]);

  // Định nghĩa hàm deleteChat
  const deleteChat = async (chatId: string) => {
    if (!user?.accessToken) return;

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

  // Định nghĩa hàm renameChat
  const renameChat = async (chatId: string, newTitle: string) => {
    if (!user?.accessToken || !newTitle.trim()) return;

    try {
      // Cập nhật tiêu đề chat trong Firestore
      await renameChatSession(chatId, newTitle.trim());

      // Cập nhật danh sách sessions
      const updatedSessions = chatSessions.map(session => {
        if (session.id === chatId) {
          return {
            ...session,
            title: newTitle.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
        return session;
      });

      setChatSessions(updatedSessions);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to rename chat:', error);
      }
    }
  };

  // Định nghĩa hàm sendMessage
  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentChatId || !user) return;

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
      await saveChatMessage(currentChatId, userMessage);

      try {
        // Tạo AI response
        const aiResponse = await generateAIResponse(content);

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
        await saveChatMessage(currentChatId, aiMessage);

        // Cập nhật tiêu đề chat nếu là tin nhắn đầu tiên của người dùng
        if (messages.length <= 1) {
          const title =
            content.length > 30 ? content.substring(0, 30) + '...' : content;
          await renameChat(currentChatId, title);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error generating AI response:', error);
        }

        // Hiển thị thông báo lỗi cho người dùng
        const errorMessage: Message = {
          id: generateUniqueId('error'),
          content:
            'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, errorMessage]);
        await saveChatMessage(currentChatId, errorMessage);
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

  // Gọi loadChatSessions khi user thay đổi
  useEffect(() => {
    if (user?.accessToken) {
      loadChatSessions();
    }
  }, [user, loadChatSessions]);

  // Gọi loadChatHistory khi currentChatId thay đổi
  useEffect(() => {
    if (currentChatId) {
      loadChatHistory(currentChatId);
    }
  }, [currentChatId, loadChatHistory]);

  return {
    messages,
    chatSessions,
    currentChatId,
    loading,
    loadingSessions,
    isTyping,
    setCurrentChatId,
    loadChatSessions,
    createNewChat,
    deleteChat,
    renameChat,
    sendMessage,
  };
}
