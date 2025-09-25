import React from 'react';
import { ChatSession } from '../../types/chat';
import { MessageSquare, Plus, Trash2, Edit3 } from 'lucide-react';
import Button from './button';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  className?: string;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  className = '',
}: ChatSidebarProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const handleStartEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`bg-white/5 backdrop-blur-md border-r border-white/10 h-full flex flex-col chat-sidebar ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Cuộc trò chuyện
          </h2>
          <Button
            onClick={onNewChat}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-white/60">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
            <p className="text-xs mt-1">Tạo cuộc trò chuyện mới để bắt đầu</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group relative rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                  currentSessionId === session.id
                    ? 'bg-white/10 border border-white/20'
                    : 'hover:bg-white/5'
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleSaveEdit}
                        className="w-full bg-transparent text-white text-sm border-none outline-none"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-sm font-medium text-white truncate">
                        {session.title}
                      </h3>
                    )}
                    <p className="text-xs text-white/60 mt-1">
                      {new Date(session.updatedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId !== session.id && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                          onClick={e => {
                            e.stopPropagation();
                            handleStartEdit(session);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/10"
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/60 text-center">
          StudyFlow AI Tutor v1.0
        </div>
      </div>
    </div>
  );
}
