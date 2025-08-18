import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { generateContextualSuggestions } from '../../../utils/languageDetection';

interface AISuggestion {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon?: string;
}

interface AISuggestionsProps {
  onPromptClick: (prompt: string) => void;
  disabled?: boolean;
  chatHistory?: Array<{ role: 'user' | 'model'; content: string }>;
}

export function AISuggestions({
  onPromptClick,
  disabled = false,
  chatHistory = [],
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userLanguage, detectedLanguage, updateDetectedLanguageFromChat } =
    useLanguage();

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Phát hiện ngôn ngữ từ chat history
      let currentLanguage = detectedLanguage;
      if (chatHistory.length > 0) {
        currentLanguage = updateDetectedLanguageFromChat(chatHistory);
      }

      const finalLanguage = userLanguage || currentLanguage || 'vi';

      // Tạo context object cho generateContextualSuggestions
      const languageContext = {
        userLanguage: finalLanguage,
        detectedLanguage: currentLanguage,
        chatHistory: chatHistory.map(msg => ({
          content: msg.content,
          sender: msg.role === 'user' ? 'user' : 'assistant',
        })),
      };

      // Tạo gợi ý contextual dựa trên ngôn ngữ
      const contextualSuggestions =
        generateContextualSuggestions(languageContext);

      // Chuyển đổi sang định dạng AISuggestion
      const formattedSuggestions: AISuggestion[] = contextualSuggestions.map(
        (suggestion, index) => ({
          id: `suggestion-${index}`,
          title: suggestion.title,
          prompt: suggestion.prompt,
          category: suggestion.category,
          icon: suggestion.icon,
        }),
      );

      setSuggestions(formattedSuggestions);
    } catch (err) {
      const errorLang = userLanguage || detectedLanguage || 'vi';
      setError(
        errorLang === 'vi'
          ? 'Không thể tải gợi ý. Đang hiển thị gợi ý mặc định.'
          : 'Unable to load suggestions. Showing default suggestions.',
      );
      console.error('Failed to load AI suggestions:', err);

      // Fallback với gợi ý mặc định
      const fallbackContext = {
        userLanguage: userLanguage || detectedLanguage || 'vi',
      };
      const fallbackSuggestions =
        generateContextualSuggestions(fallbackContext);
      const formattedFallback: AISuggestion[] = fallbackSuggestions.map(
        (suggestion, index) => ({
          id: `fallback-${index}`,
          title: suggestion.title,
          prompt: suggestion.prompt,
          category: suggestion.category,
          icon: suggestion.icon,
        }),
      );
      setSuggestions(formattedFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  // Refresh suggestions when chat history changes (có tin nhắn mới)
  useEffect(() => {
    if (chatHistory.length > 0) {
      // Debounce để tránh refresh quá nhiều lần
      const timer = setTimeout(() => {
        loadSuggestions();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [chatHistory.length]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="suggestions-tags">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="suggestion-tag animate-pulse"
              style={{ opacity: 0.6, minWidth: '80px', height: '36px' }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="text-xs p-2 rounded text-center"
          style={{
            color: 'rgb(var(--app-yellow-rgb))',
            backgroundColor: 'rgb(var(--app-yellow-rgb) / 0.1)',
            borderRadius: 'var(--app-radius)',
          }}
        >
          {error}
        </div>
      )}

      <div className="suggestions-tags">
        {suggestions.map(suggestion => (
          <button
            key={suggestion.id}
            onClick={() => onPromptClick(suggestion.prompt)}
            disabled={disabled}
            className="suggestion-tag"
          >
            <span>{suggestion.icon}</span>
            <span>{suggestion.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
