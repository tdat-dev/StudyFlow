import React from 'react';
import { Message } from '../../types/chat';
import {
  Bot,
  Clock,
  MessageSquare,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
  Star,
  Lightbulb,
} from 'lucide-react';

interface ChatInfoPanelProps {
  messages: Message[];
  currentSessionTitle?: string;
  className?: string;
}

export function ChatInfoPanel({
  messages,
  currentSessionTitle = 'Cuộc trò chuyện mới',
  className = '',
}: ChatInfoPanelProps) {
  const userMessages = messages.filter(m => m.sender === 'user');
  const totalMessages = messages.length;
  const sessionDuration =
    messages.length > 0
      ? Math.round(
          (new Date().getTime() - new Date(messages[0].timestamp).getTime()) /
            (1000 * 60),
        )
      : 0;

  const quickActions = [
    {
      icon: BookOpen,
      title: 'Học từ vựng',
      description: 'Hỏi về nghĩa và cách sử dụng từ',
      prompt: 'Giải thích nghĩa của từ "serendipity" và cách sử dụng trong câu',
    },
    {
      icon: Target,
      title: 'Luyện tập',
      description: 'Làm bài tập và quiz',
      prompt: 'Tạo cho tôi một bài quiz về thì hiện tại hoàn thành',
    },
    {
      icon: Zap,
      title: 'Thử thách',
      description: 'Thử thách nhanh 5 phút',
      prompt: 'Tạo thử thách 5 phút về từ vựng tiếng Anh',
    },
    {
      icon: Lightbulb,
      title: 'Mẹo học',
      description: 'Mẹo và kỹ thuật học tập',
      prompt: 'Chia sẻ mẹo ghi nhớ từ vựng hiệu quả',
    },
  ];

  const stats = [
    {
      icon: MessageSquare,
      label: 'Tin nhắn',
      value: totalMessages,
      color: 'text-blue-400',
    },
    {
      icon: Clock,
      label: 'Thời gian',
      value: `${sessionDuration}m`,
      color: 'text-green-400',
    },
    {
      icon: TrendingUp,
      label: 'Tương tác',
      value: userMessages.length,
      color: 'text-purple-400',
    },
  ];

  return (
    <div
      className={`bg-white/5 backdrop-blur-md border-l border-white/10 h-full flex flex-col chat-info-panel ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Tutor</h3>
            <p className="text-sm text-white/60">{currentSessionTitle}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-sm font-medium text-white mb-3">Thống kê phiên</h4>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-white/10 flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="text-lg font-semibold text-white">
                {stat.value}
              </div>
              <div className="text-xs text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-4">
          <h4 className="text-sm font-medium text-white mb-3">
            Hành động nhanh
          </h4>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                      {action.title}
                    </h5>
                    <p className="text-xs text-white/60 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-white mb-1">
                Mẹo sử dụng
              </h5>
              <p className="text-xs text-white/80 leading-relaxed">
                Sử dụng Shift + Enter để xuống dòng, Enter để gửi tin nhắn. Đính
                kèm file để AI phân tích nội dung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
