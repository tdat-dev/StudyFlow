import React from 'react';
import Button from '../../../components/ui/button';
import { Bot, MessageSquare, Plus } from 'lucide-react';

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export function ChatHeader({ onNewChat, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b p-2 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-2 md:hidden"
            onClick={onToggleSidebar}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-gray-900 text-sm sm:text-base truncate">AI Tutor Agent</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Giáo viên ảo hỗ trợ học tập mọi môn học</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onNewChat}
          className="hidden md:flex items-center flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Chat mới
        </Button>
      </div>
    </div>
  );
}