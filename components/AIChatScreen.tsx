import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Send, Bot, User, BookOpen, FileQuestion, Headphones, Loader2 } from 'lucide-react';
import { firebase } from '../utils/firebase/client';
import { auth, db } from '../utils/firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { generateGeminiResponse } from '../utils/gemini/config';

interface Message {
  id: number;
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

const quickActions: QuickAction[] = [
  {
    id: 1,
    label: 'Ôn tập từ hôm nay',
    icon: BookOpen,
    prompt: 'Giúp tôi ôn tập lại những từ vựng đã học hôm nay',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 2,
    label: 'Sinh quiz nhanh',
    icon: FileQuestion,
    prompt: 'Tạo cho tôi một bài quiz nhanh về từ vựng đã học',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 3,
    label: 'Gợi ý nghe audio',
    icon: Headphones,
    prompt: 'Gợi ý cho tôi một số audio ngắn để luyện nghe',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

export function AIChatScreen({ user }: AIChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'model', content: string}>>([]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    // Luôn hiển thị tin nhắn chào mừng trước
    const welcomeMessage: Message = {
      id: Date.now(),
      content: 'Xin chào! Tôi là AI Coach của bạn. Tôi có thể giúp bạn học tiếng Anh hiệu quả hơn. Bạn muốn hỏi gì?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    
    // Thêm tin nhắn chào mừng vào lịch sử chat cho Gemini API
    setChatHistory([{ role: 'model' as const, content: welcomeMessage.content }]);
    
    if (!auth.currentUser) return;

    try {
      // Tạo reference đến collection messages của user
      const messagesRef = collection(db, "chats", auth.currentUser.uid, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);
      
      const loadedMessages: Message[] = [];
      const loadedChatHistory: Array<{role: 'user' | 'model', content: string}> = [];
      
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          // Chỉ thêm tin nhắn hợp lệ
          if (data.content && data.sender && data.timestamp) {
            const message: Message = {
              id: parseInt(doc.id) || Date.now() + Math.random(),
              content: data.content,
              sender: data.sender,
              timestamp: data.timestamp.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            };
            
            loadedMessages.push(message);
            
            // Thêm vào lịch sử chat cho Gemini API
            loadedChatHistory.push({
              role: data.sender === 'user' ? 'user' as const : 'model' as const,
              content: data.content
            });
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      });

      if (loadedMessages.length === 0) {
        // Nếu không có lịch sử, lưu tin nhắn chào mừng
        await saveMessage(welcomeMessage.content, 'ai');
      } else {
        // Nếu có lịch sử, hiển thị lịch sử và tin nhắn chào mừng
        setMessages([...loadedMessages, welcomeMessage]);
        
        // Cập nhật lịch sử chat cho Gemini API, thêm tin nhắn chào mừng mới nhất
        setChatHistory([...loadedChatHistory, { role: 'model' as const, content: welcomeMessage.content }]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Tin nhắn chào mừng đã được hiển thị ở trên
    }
  };

  const saveMessage = async (content: string, sender: 'user' | 'ai') => {
    if (!auth.currentUser) return;

    try {
      // Đảm bảo collection chats/uid/messages tồn tại
      const userChatRef = collection(db, "chats", auth.currentUser.uid, "messages");
      
      // Thêm tin nhắn mới
      const docRef = await addDoc(userChatRef, {
        content,
        sender,
        timestamp: Timestamp.now()
      });
      
      console.log('Message saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to save message:', error);
      return null;
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);

    try {
      // Thêm tin nhắn người dùng vào UI
      const userMessage: Message = {
        id: Date.now(),
        content,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsTyping(true);

      // Lưu tin nhắn người dùng vào Firestore
      await saveMessage(content, 'user');
      
      // Cập nhật lịch sử chat cho Gemini API
      const updatedChatHistory = [
        ...chatHistory,
        { role: 'user' as const, content }
      ];
      setChatHistory(updatedChatHistory);

      try {
        // Tạo prompt cho Gemini API
        const prompt = createGeminiPrompt(content, user);
        
        let aiResponse = '';
        
        // Kiểm tra xem có API key Gemini hợp lệ không
        if (process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY.length > 10) {
          try {
            // Gọi Gemini API với lịch sử chat để duy trì ngữ cảnh
            aiResponse = await generateGeminiResponse(prompt, updatedChatHistory);
          } catch (apiError) {
            console.error('Error calling Gemini API:', apiError);
            // Fallback to local response if API call fails
            aiResponse = generateLocalAIResponse(content);
          }
        } else {
          console.log('No valid Gemini API key found, using local responses');
          aiResponse = generateLocalAIResponse(content);
        }
        
        // Tạo tin nhắn AI
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        
        // Hiển thị tin nhắn AI
        setMessages(prev => [...prev, aiMessage]);
        
        // Lưu tin nhắn AI vào Firestore
        await saveMessage(aiResponse, 'ai');
        
        // Cập nhật lịch sử chat với phản hồi của AI
        setChatHistory(prev => [...prev, { role: 'model' as const, content: aiResponse }]);
        
      } catch (error) {
        console.error('Error generating AI response:', error);
        
        // Hiển thị thông báo lỗi cho người dùng
        const errorMessage: Message = {
          id: Date.now() + 1,
          content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        await saveMessage(errorMessage.content, 'ai');
        
        // Cập nhật lịch sử chat với thông báo lỗi
        setChatHistory(prev => [...prev, { role: 'model' as const, content: errorMessage.content }]);
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
    return `Bạn là một AI Coach tiếng Anh, giúp người dùng học tiếng Anh hiệu quả.
Tên người dùng: ${user?.name || 'Học viên'}
Câu hỏi/yêu cầu hiện tại của người dùng: ${userMessage}

Hướng dẫn trả lời:
1. Trả lời bằng tiếng Việt một cách ngắn gọn, dễ hiểu và thân thiện.
2. Nếu câu hỏi liên quan đến tiếng Anh, hãy giải thích rõ ràng và đưa ra ví dụ cụ thể.
3. Luôn duy trì ngữ cảnh của cuộc hội thoại, tham chiếu đến các tin nhắn trước đó khi cần thiết.
4. Nếu người dùng hỏi về nội dung đã đề cập trước đó, hãy nhớ và trả lời dựa trên thông tin đã chia sẻ.
5. Sử dụng emoji phù hợp để làm cho câu trả lời sinh động hơn.

Các chủ đề bạn có thể giúp:
- Ngữ pháp tiếng Anh
- Từ vựng và cách sử dụng
- Phát âm và ngữ điệu
- Cách học tiếng Anh hiệu quả
- Luyện tập và kiểm tra kiến thức`;
  };

  // Phản hồi cục bộ khi không có kết nối API
  const generateLocalAIResponse = (userMessage: string): string => {
    // Simple mock responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    // Giới từ
    if (lowerMessage.includes('on monday') || lowerMessage.includes('in monday')) {
      return 'Câu hỏi hay! Chúng ta dùng "on Monday" thay vì "in Monday" vì:\n\n📅 Với các ngày trong tuần, chúng ta luôn dùng giới từ "ON"\n- On Monday (vào thứ Hai)\n- On Friday (vào thứ Sáu)\n\n🗓️ "IN" được dùng với:\n- Tháng: in January\n- Năm: in 2024\n- Thời gian dài: in the morning\n\nVí dụ:\n✅ I have a meeting on Monday\n❌ I have a meeting in Monday';
    }
    
    // Ôn tập
    if (lowerMessage.includes('ôn tập') || lowerMessage.includes('review')) {
      return '📚 Tuyệt! Hãy cùng ôn tập những từ quan trọng:\n\n🔸 Beautiful - đẹp\n🔸 Interesting - thú vị\n🔸 Difficult - khó\n🔸 Airport - sân bay\n🔸 Meeting - cuộc họp\n\nBạn muốn tôi tạo câu ví dụ cho từ nào?';
    }
    
    // Quiz
    if (lowerMessage.includes('quiz')) {
      return '🎯 Quiz nhanh cho bạn!\n\n❓ Từ nào có nghĩa là "thú vị"?\nA) Beautiful\nB) Interesting\nC) Difficult\nD) Important\n\nHãy trả lời và tôi sẽ giải thích!';
    }
    
    // Audio
    if (lowerMessage.includes('audio') || lowerMessage.includes('nghe')) {
      return '🎧 Gợi ý audio cho bạn:\n\n📻 BBC Learning English (5-10 phút)\n🎙️ English Pod (Beginner level)\n📱 Duolingo Podcast (Interesting stories)\n🎬 TED-Ed videos (Short & engaging)\n\nBắt đầu với 10 phút mỗi ngày nhé!';
    }

    // Trả lời quiz
    if (lowerMessage.includes('b') && (lowerMessage.includes('quiz') || lowerMessage.includes('interesting'))) {
      return '🎉 Chính xác! "Interesting" có nghĩa là "thú vị, hấp dẫn".\n\n✨ Cách sử dụng:\n- This movie is interesting (Bộ phim này thú vị)\n- An interesting story (Một câu chuyện thú vị)\n\n📖 Từ đồng nghĩa: fascinating, engaging, captivating\n\nBạn có muốn thử câu hỏi khác không?';
    }
    
    // Thì hiện tại đơn
    if (lowerMessage.includes('present simple') || lowerMessage.includes('hiện tại đơn')) {
      return '📝 Thì hiện tại đơn (Present Simple)\n\n🔹 Công thức: S + V(s/es) + O\n\n🔹 Cách dùng:\n- Diễn tả thói quen, sự thật hiển nhiên\n- Lịch trình, thời gian biểu\n\n🔹 Dấu hiệu nhận biết:\n- Always, usually, often, sometimes, rarely, never\n- Every day/week/month/year\n\n🔹 Ví dụ:\n- I go to school every day\n- She works in a bank\n- The sun rises in the east';
    }
    
    // Từ vựng du lịch
    if (lowerMessage.includes('du lịch') || lowerMessage.includes('travel')) {
      return '✈️ Từ vựng du lịch cơ bản:\n\n🔸 Airport - Sân bay\n🔸 Passport - Hộ chiếu\n🔸 Luggage/Baggage - Hành lý\n🔸 Check-in - Làm thủ tục\n🔸 Flight - Chuyến bay\n🔸 Departure - Khởi hành\n🔸 Arrival - Đến nơi\n🔸 Hotel - Khách sạn\n🔸 Reservation - Đặt chỗ\n🔸 Sightseeing - Tham quan\n\nBạn muốn học thêm từ vựng nào?';
    }
    
    // Cách học từ vựng
    if (lowerMessage.includes('cách học') || lowerMessage.includes('how to learn')) {
      return '📚 5 cách học từ vựng hiệu quả:\n\n1️⃣ Học từ trong ngữ cảnh (câu, đoạn văn)\n2️⃣ Sử dụng flashcards và ứng dụng học từ vựng\n3️⃣ Tạo liên kết hình ảnh với từ mới\n4️⃣ Thực hành sử dụng từ mới trong câu\n5️⃣ Ôn tập theo lịch trình (spaced repetition)\n\nHãy thử áp dụng phương pháp nào phù hợp với bạn nhé!';
    }
    
    // Chào hỏi
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('chào')) {
      return 'Xin chào! Rất vui được gặp bạn. Tôi là AI Coach tiếng Anh của bạn. Hôm nay bạn muốn học gì? 😊\n\n- Từ vựng mới?\n- Ngữ pháp?\n- Luyện tập hội thoại?\n- Kiểm tra kiến thức?';
    }
    
    // Mặc định
    return 'Tôi hiểu! Đây là một câu hỏi thú vị về tiếng Anh. Bạn có thể chia sẻ thêm chi tiết để tôi giúp bạn tốt hơn không? 😊\n\nTôi có thể giúp bạn:\n📚 Giải thích ngữ pháp\n📖 Học từ vựng mới\n🎯 Tạo quiz luyện tập\n🎧 Gợi ý tài liệu nghe';
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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-gray-900">AI Coach</h2>
            <p className="text-sm text-gray-500">Luôn sẵn sàng giúp bạn học tập</p>
          </div>
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
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
              
              <div className={`rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border shadow-sm'
              }`}>
                <p className="whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

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
            placeholder="Hỏi AI Coach..."
            className="flex-1 rounded-xl"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(inputMessage);
              }
            }}
          />
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || loading}
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
  );
}