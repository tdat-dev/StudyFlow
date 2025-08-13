import React, { useState } from 'react';
import Button from '../../../components/ui/button';
import { Edit, Loader2, MessageSquare, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { ChatSession } from '../../../types/chat';
// Định nghĩa hàm formatDate trong component
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
}

interface ChatListProps {
  sessions: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onRenameChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  loading?: boolean;
}

export function ChatList({
  sessions,
  currentChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  loading = false
}: ChatListProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      <div className="p-2 sm:p-4 border-b flex items-center justify-between">
        <h2 className="font-medium text-sm sm:text-base">Cuộc trò chuyện</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
          onClick={onNewChat}
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <p>Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  currentChatId === session.id ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => onSelectChat(session.id)}
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
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSession(session.id);
                      setShowOptionsMenu(true);
                    }}
                  >
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  
                  {showOptionsMenu && activeSession === session.id && (
                    <div className="absolute right-0 top-8 w-48 sm:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          className="flex w-full items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRenameChat(session.id);
                            setShowOptionsMenu(false);
                          }}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Đổi tên
                        </button>
                        <button
                          className="flex w-full items-center px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100"
                          role="menuitem"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(session.id);
                            setShowOptionsMenu(false);
                          }}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
  );
}