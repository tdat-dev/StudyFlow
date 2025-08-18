import React, { useState } from 'react';
import { MessageSquare, Copy, Download } from 'lucide-react';
import Logo from '../../ui/Logo';
import { Message } from '../../../types/chat';
import { copyTranscript } from '../../../utils/transcript';
import { LanguageSelector } from './LanguageSelector';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  messages?: Message[];
}

export function ChatHeader({
  onToggleSidebar,
  messages = [],
}: ChatHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>(
    'idle',
  );

  const handleCopyTranscript = async (format: 'markdown' | 'plain') => {
    if (messages.length === 0) return;

    setCopyStatus('copying');
    const success = await copyTranscript(messages, format);

    if (success) {
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else {
      setCopyStatus('idle');
    }
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            color: 'var(--app-text-muted)',
            borderRadius: 'var(--app-radius)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--app-card)';
            e.currentTarget.style.color = 'var(--app-text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--app-text-muted)';
          }}
          onFocus={e => {
            e.currentTarget.style.outline = '2px solid var(--app-ring)';
          }}
          onBlur={e => {
            e.currentTarget.style.outline = 'none';
          }}
          title="Ẩn/hiện lịch sử cuộc trò chuyện"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <Logo size="small" />
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--app-text)' }}
            >
              StudyFlow AI Tutor
            </h2>
            <p
              className="text-xs truncate"
              style={{ color: 'var(--app-text-muted)' }}
            >
              Trợ lý học tập thông minh
            </p>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Copy Transcript Actions */}
        {messages.length > 0 && (
          <>
            <button
              onClick={() => handleCopyTranscript('markdown')}
              disabled={copyStatus === 'copying'}
              className="p-2 rounded-lg transition-all duration-200 focus-visible:ring-2"
              style={{
                color: 'var(--app-text-muted)',
                borderRadius: 'var(--app-radius)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--app-card)';
                e.currentTarget.style.color = 'var(--app-text)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--app-text-muted)';
              }}
              onFocus={e => {
                e.currentTarget.style.outline = '2px solid var(--app-ring)';
              }}
              onBlur={e => {
                e.currentTarget.style.outline = 'none';
              }}
              title="Copy toàn bộ hội thoại (Markdown)"
            >
              <Copy className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleCopyTranscript('plain')}
              disabled={copyStatus === 'copying'}
              className="p-2 rounded-lg transition-all duration-200 focus-visible:ring-2"
              style={{
                color: 'var(--app-text-muted)',
                borderRadius: 'var(--app-radius)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--app-card)';
                e.currentTarget.style.color = 'var(--app-text)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--app-text-muted)';
              }}
              onFocus={e => {
                e.currentTarget.style.outline = '2px solid var(--app-ring)';
              }}
              onBlur={e => {
                e.currentTarget.style.outline = 'none';
              }}
              title="Copy toàn bộ hội thoại (Plain text)"
            >
              <Download className="h-4 w-4" />
            </button>

            {copyStatus === 'success' && (
              <span className="text-xs" style={{ color: 'var(--app-primary)' }}>
                Đã copy!
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
