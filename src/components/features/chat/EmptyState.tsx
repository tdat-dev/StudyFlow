import React from 'react';
import { AISuggestions } from './AISuggestions';

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
  chatHistory?: Array<{ role: 'user' | 'model'; content: string }>;
}

export function EmptyState({
  onPromptClick,
  chatHistory = [],
}: EmptyStateProps) {
  return (
    <div className="content-column space-y-8">
      {/* Welcome message */}
      <div className="text-center">
        <h1 className="hero-title mb-4">
          Khi bạn sẵn sàng là chúng ta có thể bắt đầu.
        </h1>
      </div>

      {/* AI Suggestions as tags */}
      <div>
        <AISuggestions
          onPromptClick={onPromptClick}
          chatHistory={chatHistory}
        />
      </div>

      {/* Footer hint */}
      <div
        className="text-xs text-center"
        style={{ color: 'var(--app-text-muted)' }}
      >
        💡 Mẹo: Nhấn{' '}
        <kbd
          className="px-1.5 py-0.5 rounded text-xs"
          style={{
            backgroundColor: 'var(--app-card)',
            color: 'var(--app-text)',
            borderRadius: 'var(--app-radius)',
            border: '1px solid var(--app-border)',
          }}
        >
          Enter
        </kbd>{' '}
        để gửi,{' '}
        <kbd
          className="px-1.5 py-0.5 rounded text-xs"
          style={{
            backgroundColor: 'var(--app-card)',
            color: 'var(--app-text)',
            borderRadius: 'var(--app-radius)',
            border: '1px solid var(--app-border)',
          }}
        >
          Shift + Enter
        </kbd>{' '}
        để xuống dòng
      </div>
    </div>
  );
}
