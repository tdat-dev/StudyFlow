import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Send, Bot, User, BookOpen, FileQuestion, Headphones, Loader2 } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface AIChatScreenProps {
  user: any;
}

const quickActions = [
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

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    if (!user.accessToken) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1d3b8ecf/chat`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const { messages: chatHistory } = await response.json();
        if (chatHistory.length === 0) {
          // Add welcome message if no history
          const welcomeMessage: Message = {
            id: 1,
            content: 'Xin chào! Tôi là AI Coach của bạn. Tôi có thể giúp bạn học tiếng Anh hiệu quả hơn. Bạn muốn hỏi gì?',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        } else {
          setMessages(chatHistory);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Add welcome message as fallback
      const welcomeMessage: Message = {
        id: 1,
        content: 'Xin chào! Tôi là AI Coach của bạn. Tôi có thể giúp bạn học tiếng Anh hiệu quả hơn. Bạn muốn hỏi gì?',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const saveMessage = async (message: string, sender: 'user' | 'ai') => {
    if (!user.accessToken) return;

    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1d3b8ecf/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ message, sender }),
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Save user message
    await saveMessage(content, 'user');

    // Simulate AI response
    setTimeout(async () => {
      const aiResponse = generateAIResponse(content);
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setLoading(false);

      // Save AI message
      await saveMessage(aiResponse, 'ai');
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    // Simple mock responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('on monday') || lowerMessage.includes('in monday')) {
      return 'Câu hỏi hay! Chúng ta dùng "on Monday" thay vì "in Monday" vì:\n\n📅 Với các ngày trong tuần, chúng ta luôn dùng giới từ "ON"\n- On Monday (vào thứ Hai)\n- On Friday (vào thứ Sáu)\n\n🗓️ "IN" được dùng với:\n- Tháng: in January\n- Năm: in 2024\n- Thời gian dài: in the morning\n\nVí dụ:\n✅ I have a meeting on Monday\n❌ I have a meeting in Monday';
    }
    
    if (lowerMessage.includes('ôn tập') || lowerMessage.includes('review')) {
      return '📚 Tuyệt! Hãy cùng ôn tập những từ quan trọng:\n\n🔸 Beautiful - đẹp\n🔸 Interesting - thú vị\n🔸 Difficult - khó\n🔸 Airport - sân bay\n🔸 Meeting - cuộc họp\n\nBạn muốn tôi tạo câu ví dụ cho từ nào?';
    }
    
    if (lowerMessage.includes('quiz')) {
      return '🎯 Quiz nhanh cho bạn!\n\n❓ Từ nào có nghĩa là "thú vị"?\nA) Beautiful\nB) Interesting\nC) Difficult\nD) Important\n\nHãy trả lời và tôi sẽ giải thích!';
    }
    
    if (lowerMessage.includes('audio') || lowerMessage.includes('nghe')) {
      return '🎧 Gợi ý audio cho bạn:\n\n📻 BBC Learning English (5-10 phút)\n🎙️ English Pod (Beginner level)\n📱 Duolingo Podcast (Interesting stories)\n🎬 TED-Ed videos (Short & engaging)\n\nBắt đầu với 10 phút mỗi ngày nhé!';
    }

    if (lowerMessage.includes('b') && (lowerMessage.includes('quiz') || lowerMessage.includes('interesting'))) {
      return '🎉 Chính xác! "Interesting" có nghĩa là "thú vị, hấp dẫn".\n\n✨ Cách sử dụng:\n- This movie is interesting (Bộ phim này thú vị)\n- An interesting story (Một câu chuyện thú vị)\n\n📖 Từ đồng nghĩa: fascinating, engaging, captivating\n\nBạn có muốn thử câu hỏi khác không?';
    }
    
    return 'Tôi hiểu! Đây là một câu hỏi thú vị về tiếng Anh. Bạn có thể chia sẻ thêm chi tiết để tôi giúp bạn tốt hơn không? 😊\n\nTôi có thể giúp bạn:\n📚 Giải thích ngữ pháp\n📖 Học từ vựng mới\n🎯 Tạo quiz luyện tập\n🎧 Gợi ý tài liệu nghe';
  };

  const handleQuickAction = (action: any) => {
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