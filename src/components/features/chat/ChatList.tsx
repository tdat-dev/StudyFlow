import React, { useState, useEffect, useRef } from 'react';
import {
  Edit,
  Loader2,
  MessageSquare,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { ChatSession } from '../../../types/chat';

// Định nghĩa hàm formatDate trong component
function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

interface ChatListProps {
  sessions: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
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
  loading = false,
}: ChatListProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside để đóng menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Xử lý bắt đầu đổi tên
  const handleStartRename = (chatId: string, currentTitle: string) => {
    setRenamingChatId(chatId);
    setRenameValue(currentTitle);
    setShowOptionsMenu(null);

    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 50);
  };

  // Xử lý confirm đổi tên
  const handleConfirmRename = () => {
    if (renamingChatId && renameValue.trim()) {
      onRenameChat(renamingChatId, renameValue.trim());
    }
    setRenamingChatId(null);
    setRenameValue('');
  };

  // Xử lý cancel đổi tên
  const handleCancelRename = () => {
    setRenamingChatId(null);
    setRenameValue('');
  };

  // Xử lý phím Enter và Escape cho input đổi tên
  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

  return (
    <div className="chatgpt-sidebar">
      {/* Header với nút New Chat */}
      <div className="sidebar-header">
        <button onClick={onNewChat} className="new-chat-btn" disabled={loading}>
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          <span>Đoạn chat mới</span>
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-loading">
            <Loader2 className="animate-spin" size={20} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="sidebar-empty">
            <MessageSquare className="sidebar-empty-icon" />
            <div className="sidebar-empty-text">Chưa có cuộc trò chuyện</div>
            <div className="sidebar-empty-subtext">
              Bắt đầu chat mới để bắt đầu
            </div>
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className={`chat-item ${currentChatId === session.id ? 'active' : ''} ${showOptionsMenu === session.id ? 'has-open-menu' : ''}`}
            >
              <button
                onClick={() => onSelectChat(session.id)}
                className="chat-item-button"
                disabled={renamingChatId === session.id}
              >
                <MessageSquare className="chat-item-icon" />
                <div className="chat-item-content">
                  {renamingChatId === session.id ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={handleRenameKeyDown}
                      onBlur={handleConfirmRename}
                      className="chat-rename-input"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="chat-item-title">{session.title}</div>
                      <div className="chat-item-meta">
                        <span>{formatDate(session.updatedAt)}</span>
                        <span>•</span>
                        <span>{session.messageCount} tin nhắn</span>
                      </div>
                    </>
                  )}
                </div>
              </button>

              {/* Actions menu */}
              {renamingChatId !== session.id && (
                <div className="chat-item-actions">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setShowOptionsMenu(
                        showOptionsMenu === session.id ? null : session.id,
                      );
                    }}
                    className="chat-actions-btn"
                    title="Tùy chọn"
                    aria-label="Hiện thị menu tùy chọn"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showOptionsMenu === session.id && (
                    <div ref={menuRef} className="chat-actions-menu">
                      <button
                        onClick={() =>
                          handleStartRename(session.id, session.title)
                        }
                        className="chat-menu-item"
                      >
                        <Edit size={14} />
                        <span>Đổi tên</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteChat(session.id);
                          setShowOptionsMenu(null);
                        }}
                        className="chat-menu-item danger"
                      >
                        <Trash2 size={14} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
