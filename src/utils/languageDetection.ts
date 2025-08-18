/**
 * Language Detection and Suggestion Generation
 */

interface LanguageContext {
  userLanguage?: string; // Language set by user
  detectedLanguage?: string; // Language detected from chat history
  chatHistory?: Array<{ content: string; sender: string }>;
  recentMessages?: string[];
}

/**
 * Detect primary language from chat history
 */
export function detectUserLanguage(
  chatHistory: Array<{ content: string; sender: string }>,
): string {
  if (!chatHistory || chatHistory.length === 0) {
    return 'vi'; // Default Vietnamese
  }

  // Get user messages only
  const userMessages = chatHistory
    .filter(msg => msg.sender === 'user')
    .map(msg => msg.content)
    .slice(-10); // Last 10 messages

  if (userMessages.length === 0) {
    return 'vi';
  }

  // Simple language detection based on patterns
  const text = userMessages.join(' ').toLowerCase();

  // English indicators
  const englishPatterns = [
    /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g,
    /\b(hello|hi|how|what|when|where|why|can|could|would|should)\b/g,
    /\b(please|thank|thanks|sorry|excuse|help|need|want)\b/g,
  ];

  // Vietnamese indicators
  const vietnamesePatterns = [
    /\b(và|hoặc|nhưng|trong|trên|tại|để|của|với|bởi)\b/g,
    /\b(xin|chào|làm|thế|nào|gì|khi|nào|ở|đâu|tại|sao|có|thể)\b/g,
    /\b(cảm|ơn|xin|lỗi|giúp|cần|muốn|là|được)\b/g,
  ];

  let englishScore = 0;
  let vietnameseScore = 0;

  englishPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    englishScore += matches ? matches.length : 0;
  });

  vietnamesePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    vietnameseScore += matches ? matches.length : 0;
  });

  // Also check for Vietnamese diacritics
  const vietnameseDiacritics =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g;
  const diacriticMatches = text.match(vietnameseDiacritics);
  vietnameseScore += diacriticMatches ? diacriticMatches.length * 2 : 0;

  return vietnameseScore > englishScore ? 'vi' : 'en';
}

/**
 * Get localized suggestions based on detected language
 */
export function getLocalizedSuggestions(language: string): Array<{
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon?: string;
}> {
  const timeOfDay = getTimeOfDay();

  if (language === 'en') {
    return getEnglishSuggestions(timeOfDay);
  } else {
    return getVietnameseSuggestions(timeOfDay);
  }
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getEnglishSuggestions(timeOfDay: string) {
  const suggestionSets = {
    morning: [
      {
        id: '1',
        title: 'Morning Grammar Boost',
        prompt: 'Help me practice English grammar with some morning exercises',
        category: 'grammar',
        icon: '📝',
      },
      {
        id: '2',
        title: 'Daily Vocabulary',
        prompt: 'Teach me 5 new English words for today',
        category: 'vocabulary',
        icon: '📚',
      },
      {
        id: '3',
        title: 'Pronunciation Practice',
        prompt: 'Help me practice English pronunciation',
        category: 'pronunciation',
        icon: '🗣️',
      },
      {
        id: '4',
        title: 'Morning Conversation',
        prompt: "Let's have a casual morning conversation in English",
        category: 'conversation',
        icon: '☕',
      },
      {
        id: '5',
        title: 'News Discussion',
        prompt: "Discuss today's news in English",
        category: 'current events',
        icon: '📰',
      },
      {
        id: '6',
        title: 'English Idioms',
        prompt: 'Teach me some common English idioms',
        category: 'idioms',
        icon: '💡',
      },
    ],
    afternoon: [
      {
        id: '1',
        title: 'Afternoon Tea Chat',
        prompt: "Let's have an afternoon tea conversation in English",
        category: 'conversation',
        icon: '🫖',
      },
      {
        id: '2',
        title: 'Describing Your Afternoon',
        prompt: 'Help me describe my afternoon activities in English',
        category: 'daily life',
        icon: '🌤️',
      },
      {
        id: '3',
        title: 'Afternoon Idioms',
        prompt: 'Teach me English idioms related to time and daily activities',
        category: 'idioms',
        icon: '⏰',
      },
      {
        id: '4',
        title: 'Past Perfect Practice',
        prompt: 'Help me practice past perfect tense with afternoon scenarios',
        category: 'grammar',
        icon: '⏪',
      },
      {
        id: '5',
        title: 'Afternoon Movie Review',
        prompt: "Let's discuss and review movies in English",
        category: 'entertainment',
        icon: '🎬',
      },
      {
        id: '6',
        title: 'Relaxing Conversation Starters',
        prompt: 'Give me some relaxing conversation topics for the afternoon',
        category: 'conversation',
        icon: '💬',
      },
    ],
    evening: [
      {
        id: '1',
        title: 'Evening Reflection',
        prompt: 'Help me reflect on my day in English',
        category: 'daily life',
        icon: '🌅',
      },
      {
        id: '2',
        title: 'Bedtime Stories',
        prompt: 'Tell me a short bedtime story in English',
        category: 'stories',
        icon: '📖',
      },
      {
        id: '3',
        title: 'Evening News',
        prompt: 'Discuss evening news and current events',
        category: 'current events',
        icon: '📺',
      },
      {
        id: '4',
        title: 'Night Vocabulary',
        prompt: 'Teach me English words related to evening and night',
        category: 'vocabulary',
        icon: '🌙',
      },
      {
        id: '5',
        title: 'Dinner Conversation',
        prompt: "Let's have a dinner conversation in English",
        category: 'food',
        icon: '🍽️',
      },
      {
        id: '6',
        title: 'Planning Tomorrow',
        prompt: "Help me plan tomorrow's activities in English",
        category: 'future plans',
        icon: '📅',
      },
    ],
  };

  return (
    suggestionSets[timeOfDay as keyof typeof suggestionSets] ||
    suggestionSets.afternoon
  );
}

function getVietnameseSuggestions(timeOfDay: string) {
  const suggestionSets = {
    morning: [
      {
        id: '1',
        title: 'Luyện ngữ pháp buổi sáng',
        prompt: 'Giúp tôi luyện ngữ pháp tiếng Anh với bài tập buổi sáng',
        category: 'grammar',
        icon: '📝',
      },
      {
        id: '2',
        title: 'Từ vựng hàng ngày',
        prompt: 'Dạy tôi 5 từ tiếng Anh mới hôm nay',
        category: 'vocabulary',
        icon: '📚',
      },
      {
        id: '3',
        title: 'Luyện phát âm',
        prompt: 'Giúp tôi luyện phát âm tiếng Anh',
        category: 'pronunciation',
        icon: '🗣️',
      },
      {
        id: '4',
        title: 'Trò chuyện buổi sáng',
        prompt: 'Hãy trò chuyện tiếng Anh thông thường buổi sáng',
        category: 'conversation',
        icon: '☕',
      },
      {
        id: '5',
        title: 'Thảo luận tin tức',
        prompt: 'Thảo luận tin tức hôm nay bằng tiếng Anh',
        category: 'current events',
        icon: '📰',
      },
      {
        id: '6',
        title: 'Thành ngữ tiếng Anh',
        prompt: 'Dạy tôi một số thành ngữ tiếng Anh phổ biến',
        category: 'idioms',
        icon: '💡',
      },
    ],
    afternoon: [
      {
        id: '1',
        title: 'Trò chuyện trà chiều',
        prompt: 'Hãy trò chuyện trà chiều bằng tiếng Anh',
        category: 'conversation',
        icon: '🫖',
      },
      {
        id: '2',
        title: 'Mô tả buổi chiều',
        prompt: 'Giúp tôi mô tả các hoạt động buổi chiều bằng tiếng Anh',
        category: 'daily life',
        icon: '🌤️',
      },
      {
        id: '3',
        title: 'Thành ngữ buổi chiều',
        prompt:
          'Dạy tôi thành ngữ tiếng Anh về thời gian và hoạt động hàng ngày',
        category: 'idioms',
        icon: '⏰',
      },
      {
        id: '4',
        title: 'Luyện quá khứ hoàn thành',
        prompt:
          'Giúp tôi luyện thì quá khứ hoàn thành với tình huống buổi chiều',
        category: 'grammar',
        icon: '⏪',
      },
      {
        id: '5',
        title: 'Review phim buổi chiều',
        prompt: 'Hãy thảo luận và review phim bằng tiếng Anh',
        category: 'entertainment',
        icon: '🎬',
      },
      {
        id: '6',
        title: 'Chủ đề thư giãn',
        prompt: 'Cho tôi một số chủ đề trò chuyện thư giãn cho buổi chiều',
        category: 'conversation',
        icon: '💬',
      },
    ],
    evening: [
      {
        id: '1',
        title: 'Suy ngẫm buổi tối',
        prompt: 'Giúp tôi suy ngẫm về ngày hôm nay bằng tiếng Anh',
        category: 'daily life',
        icon: '🌅',
      },
      {
        id: '2',
        title: 'Truyện trước khi ngủ',
        prompt: 'Kể cho tôi một câu chuyện ngắn bằng tiếng Anh',
        category: 'stories',
        icon: '📖',
      },
      {
        id: '3',
        title: 'Tin tức buổi tối',
        prompt: 'Thảo luận tin tức buổi tối và sự kiện hiện tại',
        category: 'current events',
        icon: '📺',
      },
      {
        id: '4',
        title: 'Từ vựng về đêm',
        prompt: 'Dạy tôi từ tiếng Anh liên quan đến buổi tối và ban đêm',
        category: 'vocabulary',
        icon: '🌙',
      },
      {
        id: '5',
        title: 'Trò chuyện bữa tối',
        prompt: 'Hãy trò chuyện bữa tối bằng tiếng Anh',
        category: 'food',
        icon: '🍽️',
      },
      {
        id: '6',
        title: 'Lập kế hoạch ngày mai',
        prompt: 'Giúp tôi lập kế hoạch hoạt động ngày mai bằng tiếng Anh',
        category: 'future plans',
        icon: '📅',
      },
    ],
  };

  return (
    suggestionSets[timeOfDay as keyof typeof suggestionSets] ||
    suggestionSets.afternoon
  );
}

/**
 * Generate context-aware suggestions
 */
export function generateContextualSuggestions(context: LanguageContext): Array<{
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon?: string;
}> {
  // Detect language from chat history if not explicitly set
  let language = context.userLanguage;

  if (!language && context.chatHistory) {
    language = detectUserLanguage(context.chatHistory);
  }

  // Default to Vietnamese
  language = language || 'vi';

  return getLocalizedSuggestions(language);
}
