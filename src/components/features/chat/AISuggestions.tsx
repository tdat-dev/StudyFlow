import React, { useState, useEffect, useCallback } from 'react';
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

  const loadSuggestions = useCallback(async () => {
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
  }, [
    chatHistory,
    userLanguage,
    detectedLanguage,
    updateDetectedLanguageFromChat,
  ]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  // Refresh suggestions when chat history changes (có tin nhắn mới)
  useEffect(() => {
    if (chatHistory.length > 0) {
      // Debounce để tránh refresh quá nhiều lần
      const timer = setTimeout(() => {
        loadSuggestions();
      }, 1000);

      return () => clearTimeout(timer);
    }
    // Return undefined khi không có cleanup function
    return undefined;
  }, [chatHistory.length, loadSuggestions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Đang tải gợi ý...
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse border border-gray-200 dark:border-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ {error}
            </span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Chọn chủ đề để bắt đầu
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Hoặc bạn có thể đặt câu hỏi bất kỳ ở ô nhập bên dưới
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map(suggestion => (
          <button
            key={suggestion.id}
            onClick={() => onPromptClick(suggestion.prompt)}
            disabled={disabled}
            className="group p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                <span className="text-lg">{suggestion.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {suggestion.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                  {suggestion.category}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
