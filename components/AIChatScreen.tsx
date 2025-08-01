import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Send, Bot, User, BookOpen, FileQuestion, Headphones, Loader2, Plus, MessageSquare, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { generateGeminiResponse, generateLocalAIResponse } from '../src/services/gemini/config';
import { auth, db } from '../utils/firebase/config';
import { collection, addDoc, query, orderBy, getDocs, Timestamp, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface User {
  name: string;
  email: string;
  accessToken?: string;
  photoURL?: string;
}

interface AIChatScreenProps {
  user: User;
}

interface QuickAction {
  id: number;
  label: string;
  prompt: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// Tin nhắn chào mừng mặc định
const welcomeMessage: Message = {
  id: 'welcome-message',
  content: 'Xin chào! Tôi là AI Tutor Agent, người bạn đồng hành của bạn. Tôi có thể giúp bạn:\n\n1. Tạo flashcards cho mọi môn học\n2. Giải thích các khái niệm học tập\n3. Đặt câu hỏi ôn tập kiến thức\n4. Gợi ý phương pháp học hiệu quả\n5. Trò chuyện và lắng nghe bạn về mọi chủ đề\n6. Hỗ trợ bạn bằng nhiều ngôn ngữ khác nhau\n\nBạn muốn trò chuyện về điều gì hôm nay?',
  sender: 'ai',
  timestamp: new Date().toISOString(),
};

const quickActions: QuickAction[] = [
  {
    id: 1,
    label: 'Tạo flashcards',
    icon: BookOpen,
    prompt: 'Tạo flashcards tiếng Anh cho tôi với 5 từ vựng học thuật',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 2,
    label: 'Ôn tập kiến thức',
    icon: FileQuestion,
    prompt: 'Đặt câu hỏi để ôn tập kiến thức',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 3,
    label: 'Phương pháp học',
    icon: Headphones,
    prompt: 'Giải thích cho tôi về các phương pháp học hiệu quả như Spaced Repetition, Active Recall, Pomodoro, Feynman Technique và Mind Mapping',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 4,
    label: 'Trò chuyện tiếng Anh',
    icon: MessageSquare,
    prompt: 'Let\'s chat in English. How are you feeling today?',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export function AIChatScreen({ user }: AIChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State cho quản lý chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  // Auto-scroll đến tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll khi messages thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Đóng menu tùy chọn khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOptionsMenu(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);
  
  useEffect(() => {
    if (currentChatId) {
      loadChatHistory(currentChatId);
    }
  }, [currentChatId]);

  const generateUniqueId = (prefix: string = 'msg') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`;
  };

  const loadChatSessions = async () => {
    setLoadingSessions(true);
    
    try {
      // Kiểm tra nếu người dùng đã đăng nhập
      if (!auth.currentUser) {
        console.error('User not logged in');
        setLoadingSessions(false);
        return;
      }
      
      // Lấy danh sách các chat sessions từ Firestore
      // Sử dụng hai truy vấn riêng biệt thay vì composite index
      const sessionsRef = collection(db, "chat_sessions");
      const q = query(
        sessionsRef, 
        where("userId", "==", auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions: ChatSession[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          title: data.title || 'Cuộc trò chuyện mới',
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          messageCount: data.messageCount || 0
        });
      });
      
      // Sắp xếp theo thời gian cập nhật mới nhất
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setChatSessions(sessions);
      
      // Nếu có sessions, chọn session đầu tiên
      if (sessions.length > 0) {
        setCurrentChatId(sessions[0].id);
      } else {
        // Nếu không có sessions, tạo mới
        createNewChat();
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };
  
  const loadChatHistory = async (chatId: string) => {
    setLoading(true);
    setMessages([]);

    try {
      // Kiểm tra nếu người dùng đã đăng nhập
      if (!auth.currentUser) {
        console.error('User not logged in');
        setLoading(false);
        return;
      }

      try {
        // Lấy tin nhắn từ Firestore
        const messagesRef = collection(db, "chat_sessions", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);
      
      const loadedMessages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedMessages.push({
            id: doc.id,
              content: data.content,
              sender: data.sender,
            timestamp: data.timestamp.toDate().toISOString()
          });
      });

      if (loadedMessages.length === 0) {
          // Nếu không có tin nhắn, hiển thị tin nhắn chào mừng
          setMessages([welcomeMessage]);
          
          // Lưu tin nhắn chào mừng vào Firestore
        await saveMessage(welcomeMessage.content, 'ai');
      } else {
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!auth.currentUser) return;

    try {
      // Tạo chat session mới
      const newSessionRef = await addDoc(collection(db, "chat_sessions"), {
        userId: auth.currentUser.uid,
        title: 'Cuộc trò chuyện mới',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        messageCount: 0
      });
      
      // Cập nhật danh sách sessions
      const newSession: ChatSession = {
        id: newSessionRef.id,
        title: 'Cuộc trò chuyện mới',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      };
      
      setChatSessions([newSession, ...chatSessions]);
      setCurrentChatId(newSessionRef.id);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };
  
  const deleteChat = async (chatId: string) => {
    if (!auth.currentUser) return;

    try {
      // Xóa chat session từ Firestore
      await deleteDoc(doc(db, "chat_sessions", chatId));
      
      // Cập nhật danh sách sessions
      const updatedSessions = chatSessions.filter(session => session.id !== chatId);
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
      console.error('Failed to delete chat:', error);
    }
  };
  
  const renameChat = (chatId: string) => {
    // Tìm tiêu đề hiện tại của chat
    const chat = chatSessions.find(session => session.id === chatId);
    if (chat) {
      setNewChatTitle(chat.title);
      setChatToRename(chatId);
      setRenameDialogOpen(true);
    }
  };
  
  const handleRenameChat = async () => {
    if (!auth.currentUser || !chatToRename || !newChatTitle.trim()) return;
    
    try {
      // Cập nhật tiêu đề chat trong Firestore
      const chatRef = doc(db, "chat_sessions", chatToRename);
      await updateDoc(chatRef, {
        title: newChatTitle.trim(),
        updatedAt: Timestamp.now()
      });
      
      // Cập nhật danh sách sessions
      const updatedSessions = chatSessions.map(session => {
        if (session.id === chatToRename) {
          return {
            ...session,
            title: newChatTitle.trim(),
            updatedAt: new Date().toISOString()
          };
        }
        return session;
      });
      
      setChatSessions(updatedSessions);
      setRenameDialogOpen(false);
      setChatToRename(null);
      setNewChatTitle('');
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const saveMessage = async (content: string, sender: 'user' | 'ai') => {
    if (!auth.currentUser || !currentChatId) {
      // Không log thông tin chi tiết, chỉ log trạng thái
      console.log('Cannot save message: Authentication required');
      return null;
    }

    try {
      // Đảm bảo collection chat_sessions/chatId/messages tồn tại
      const chatMessagesRef = collection(db, "chat_sessions", currentChatId, "messages");
      
      // Thêm tin nhắn mới
      const docRef = await addDoc(chatMessagesRef, {
        content,
        sender,
        timestamp: Timestamp.now()
      });
      
      try {
        // Cập nhật thông tin session
        const sessionRef = doc(db, "chat_sessions", currentChatId);
        await updateDoc(sessionRef, {
          updatedAt: Timestamp.now(),
          messageCount: messages.length + 1,
          // Cập nhật tiêu đề nếu là tin nhắn đầu tiên của người dùng
          ...(sender === 'user' && messages.length <= 1 ? { 
            title: content.length > 30 ? content.substring(0, 30) + '...' : content 
          } : {})
        });
        
        // Cập nhật danh sách sessions
        setChatSessions(prev => {
          return prev.map(session => {
            if (session.id === currentChatId) {
              return {
                ...session,
                updatedAt: new Date().toISOString(),
                messageCount: messages.length + 1,
                ...(sender === 'user' && messages.length <= 1 ? { 
                  title: content.length > 30 ? content.substring(0, 30) + '...' : content 
                } : {})
              };
            }
            return session;
          });
        });
      } catch (updateError) {
        // Không log chi tiết lỗi vì có thể chứa thông tin nhạy cảm
        console.error('Failed to update session metadata');
        // Tin nhắn vẫn được lưu, chỉ có metadata bị lỗi
      }
      
      // Không log ID của tin nhắn, chỉ log trạng thái
      console.log('Message saved successfully');
      return docRef.id;
    } catch (error) {
      // Không log chi tiết lỗi vì có thể chứa thông tin nhạy cảm
      console.error('Failed to save message');
      return null;
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

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
      setInputMessage('');
      setIsTyping(true);

      // Lưu tin nhắn người dùng vào Firestore
      await saveMessage(content, 'user');

      try {
        // Tạo prompt cho Gemini API
        const prompt = createGeminiPrompt(content, user);
        
        let aiResponse = '';
        
          try {
          // Gọi Gemini API
            aiResponse = await generateGeminiResponse(prompt);
          } catch (apiError) {
          // Không log chi tiết lỗi API vì có thể chứa thông tin nhạy cảm
          console.error('Gemini API error occurred');
          // Fallback khi API lỗi
          aiResponse = generateLocalAIResponse(content);
        }
        
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
        await saveMessage(aiResponse, 'ai');
        
      } catch (error) {
        console.error('Error generating AI response:', error);
        
        // Hiển thị thông báo lỗi cho người dùng
        const errorMessage: Message = {
          id: generateUniqueId('error'),
          content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        await saveMessage(errorMessage.content, 'ai');
      } finally {
        setIsTyping(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setLoading(false);
    }
  };

  // Tạo prompt cho Gemini AI với hướng dẫn rõ ràng
  const createGeminiPrompt = (userMessage: string, user: User): string => {
    return `Bạn là một AI Giáo viên Ảo (AI Tutor Agent) thông minh với khả năng tư duy linh hoạt.
Tên người dùng: ${user?.name || 'Học viên'}
Câu hỏi/yêu cầu hiện tại của người dùng: ${userMessage}

Nhiệm vụ của bạn:
Hãy suy nghĩ linh hoạt và sáng tạo như ChatGPT, không bị giới hạn bởi kịch bản cứng nhắc. Tư duy độc lập và đưa ra các giải pháp phù hợp với từng tình huống cụ thể. Tạo ra các lộ trình học tập cá nhân hóa dựa trên nhu cầu của người dùng.

Khả năng đặc biệt:
1. Trò chuyện tự nhiên: Nếu người dùng tâm sự, chia sẻ cảm xúc hoặc trò chuyện về đời sống cá nhân, hãy đáp lại một cách đồng cảm, thấu hiểu và tự nhiên như một người bạn thân thiết, không chỉ giới hạn trong vai trò giáo viên.

2. Thích ứng ngôn ngữ: Nếu người dùng yêu cầu trò chuyện bằng ngôn ngữ cụ thể (ví dụ: tiếng Anh, tiếng Pháp, tiếng Nhật...), hãy chuyển sang ngôn ngữ đó và duy trì cuộc trò chuyện bằng ngôn ngữ người dùng yêu cầu.

3. Hỗ trợ đa lĩnh vực: Không chỉ giới hạn ở việc học tập, hãy sẵn sàng tư vấn, hỗ trợ về các vấn đề khác như phát triển cá nhân, sức khỏe tinh thần, kỹ năng sống, v.v.

Khi được yêu cầu:
- Tạo flashcards: Thiết kế các thẻ học phù hợp với chủ đề và cấp độ.
- Giải thích khái niệm: Cung cấp giải thích rõ ràng, dễ hiểu với ví dụ thực tế.
- Tạo bài tập: Đưa ra các bài tập phù hợp với trình độ người học.
- Đề xuất lộ trình: Thiết kế lộ trình học tập cá nhân hóa.
- Trò chuyện cá nhân: Đáp lại một cách tự nhiên, đồng cảm và thấu hiểu.
- Thay đổi ngôn ngữ: Chuyển sang ngôn ngữ mà người dùng yêu cầu.

QUAN TRỌNG - Quy tắc định dạng PHẢI tuân thủ:
- TUYỆT ĐỐI KHÔNG ĐƯỢC sử dụng dấu * hoặc ** trong bất kỳ trường hợp nào, ngay cả khi liệt kê danh sách.
- KHÔNG ĐƯỢC sử dụng bất kỳ định dạng markdown nào trong nội dung.
- Thay vì dùng dấu * để liệt kê, hãy dùng dấu gạch ngang (-) hoặc số (1., 2.) 
- KHÔNG sử dụng emoji số (1️⃣, 2️⃣, 3️⃣) mà chỉ dùng số thường (1, 2, 3).
- Sử dụng xuống dòng và khoảng cách để format text hợp lý.
- KHÔNG sử dụng các dấu gạch ngang liên tục như "---------------" trong bảng hoặc nội dung.
- Khi tạo flashcards, sử dụng định dạng đơn giản và dễ đọc:

Front: [nội dung]
Back: [nội dung]

Front: [nội dung]
Back: [nội dung]

Hãy trả lời với tư duy linh hoạt, sáng tạo và cá nhân hóa như ChatGPT, không theo kịch bản cứng nhắc.`;
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Dialog đổi tên chat */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
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
            <Button onClick={handleRenameChat}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-white border-r flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-medium">Cuộc trò chuyện</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={createNewChat}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingSessions ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chatSessions.map((session) => (
                  <div 
                    key={session.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                      currentChatId === session.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => setCurrentChatId(session.id)}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <div className="truncate">
                        <p className="truncate font-medium">{session.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(session.updatedAt)}</p>
                      </div>
                    </div>
                    
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="z-50 relative"
                    >
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          const menuOptions = [
                            {
                              label: "Đổi tên",
                              icon: <Edit className="h-4 w-4 mr-2" />,
                              action: () => renameChat(session.id)
                            },
                            {
                              label: "Xóa cuộc trò chuyện",
                              icon: <Trash2 className="h-4 w-4 mr-2" />,
                              action: () => deleteChat(session.id),
                              className: "text-red-600"
                            }
                          ];
                          
                          // Hiển thị menu tùy chọn
                          setActiveSession(session.id);
                          setShowOptionsMenu(true);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {showOptionsMenu && activeSession === session.id && (
                        <div className="absolute right-2 top-8 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation();
                                renameChat(session.id);
                                setShowOptionsMenu(false);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Đổi tên
                            </button>
                            <button
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(session.id);
                                setShowOptionsMenu(false);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa cuộc trò chuyện
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
        <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 mr-2 md:hidden"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
                <h2 className="text-gray-900">AI Tutor Agent</h2>
                <p className="text-sm text-gray-500">Giáo viên ảo hỗ trợ học tập mọi môn học</p>
              </div>
          </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={createNewChat}
              className="hidden md:flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Chat mới
            </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-white border-b">
        <p className="text-sm text-gray-600 mb-3">Thao tác nhanh:</p>
        <div className="flex space-x-2 overflow-x-auto">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleQuickAction(action)}
                className="flex-shrink-0 rounded-xl border-gray-200"
                disabled={loading}
              >
                <div className={`w-6 h-6 rounded-full ${action.bgColor} flex items-center justify-center mr-2`}>
                  <Icon className={`h-3 w-3 ${action.color}`} />
                </div>
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
              
                <div className={`rounded-2xl px-4 py-2 ${message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border shadow-sm'
              }`}>
                <p className="whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-white border shadow-sm rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Hỏi AI Tutor Agent..."
            className="flex-1 rounded-xl"
              disabled={loading || !currentChatId}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(inputMessage);
              }
            }}
          />
          <Button
            onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || loading || !currentChatId}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
}