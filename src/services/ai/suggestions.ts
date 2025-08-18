import { generateTutorResponse } from './tutor';
import { ChatTurn } from './prompts';

export interface AISuggestion {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon?: string;
}

/**
 * Generates AI-powered suggestions based on context
 */
export async function generateAISuggestions(
  context: {
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
    recentTopics?: string[];
    chatHistory?: ChatTurn[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    studyGoals?: string[];
  } = {},
): Promise<AISuggestion[]> {
  const suggestionsPrompt = buildSuggestionsPrompt(context);

  try {
    const response = await generateTutorResponse(suggestionsPrompt, []);
    return parseSuggestionsResponse(response);
  } catch (error) {
    console.error('Failed to generate AI suggestions:', error);
    return getFallbackSuggestions();
  }
}

function buildSuggestionsPrompt(_context: any): string {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const basePrompt = `🤖 Bạn là AI Suggestion Generator cho StudyFlow - ứng dụng học tập thông minh.

🎯 NHIỆM VỤ: Tạo 6 gợi ý học tập thông minh và phù hợp với thời điểm hiện tại.

⏰ BỐI CẢNH:
- Thời gian: ${timeOfDay === 'morning' ? 'Buổi sáng - năng lượng cao' : timeOfDay === 'afternoon' ? 'Buổi chiều - tập trung học tập' : 'Buổi tối - ôn tập và củng cố'}
- Ngày: ${currentTime.toLocaleDateString('vi-VN', { weekday: 'long' })}

📋 YÊU CẦU FORMAT (JSON):
Trả về CHÍNH XÁC format JSON sau (không thêm text gì khác):

{
  "suggestions": [
    {
      "id": "unique-id",
      "title": "Tiêu đề ngắn gọn (tối đa 30 ký tự)",
      "prompt": "Câu prompt chi tiết để gửi cho AI",
      "category": "math|literature|science|english|history|other",
      "icon": "📚|🧮|🔬|🇬🇧|📜|💡"
    }
  ]
}

🎨 NGUYÊN TẮC TẠO GỢI Ý:
1. ĐA DẠNG chủ đề: Toán, Văn, Anh, Khoa học, Lịch sử
2. PHÙ HỢP thời gian: ${timeOfDay === 'morning' ? 'Bài tập khởi động trí não' : timeOfDay === 'afternoon' ? 'Luyện tập chuyên sâu' : 'Ôn tập kiến thức'}
3. THỰC TẾ và HỮU ÍCH: Giải bài tập cụ thể, giải thích khái niệm
4. NGẮN GỌN: Title tối đa 30 ký tự
5. CHI TIẾT: Prompt rõ ràng, cụ thể

💡 VÍ DỤ THEO THỜI GIAN:
${getTimeBasedExamples(timeOfDay)}`;

  return basePrompt;
}

function getTimeBasedExamples(timeOfDay: string): string {
  switch (timeOfDay) {
    case 'morning':
      return `- "Bài toán khởi động" → "Cho tôi 3 bài toán đố vui để khởi động trí não buổi sáng"
- "Từ vựng mới hôm nay" → "Dạy tôi 5 từ vựng tiếng Anh mới về chủ đề công nghệ"
- "Câu hỏi khoa học" → "Tại sao bầu trời màu xanh? Giải thích đơn giản"`;

    case 'afternoon':
      return `- "Giải phương trình" → "Hướng dẫn giải phương trình bậc 2: x² - 5x + 6 = 0"
- "Phân tích văn bản" → "Phân tích đoạn thơ đầu trong 'Tràng giang' của Huy Cận"
- "Luyện speaking" → "Tạo cuộc hội thoại tiếng Anh về chủ đề môi trường"`;

    case 'evening':
      return `- "Ôn lại ngữ pháp" → "Tóm tắt các thì trong tiếng Anh với ví dụ"
- "Công thức vật lý" → "Liệt kê và giải thích 5 công thức vật lý quan trọng lớp 10"
- "Tóm tắt lịch sử" → "Tóm tắt sự kiện quan trọng trong chiến tranh Việt Nam"`;

    default:
      return '';
  }
}

function parseSuggestionsResponse(response: string): AISuggestion[] {
  try {
    // Tìm JSON trong response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      throw new Error('Invalid suggestions format');
    }

    return parsed.suggestions
      .slice(0, 6)
      .map((suggestion: any, index: number) => ({
        id: suggestion.id || `ai-suggestion-${index}`,
        title: suggestion.title || 'Câu hỏi thú vị',
        prompt: suggestion.prompt || suggestion.title,
        category: suggestion.category || 'other',
        icon: suggestion.icon || '💡',
      }));
  } catch (error) {
    console.error('Failed to parse AI suggestions:', error);
    return getFallbackSuggestions();
  }
}

function getFallbackSuggestions(): AISuggestion[] {
  const currentTime = new Date();
  const hour = currentTime.getHours();

  if (hour < 12) {
    // Buổi sáng - khởi động
    return [
      {
        id: 'morning-1',
        title: 'Bài toán khởi động',
        prompt: 'Cho tôi 3 bài toán đố vui để khởi động trí não buổi sáng',
        category: 'math',
        icon: '🧮',
      },
      {
        id: 'morning-2',
        title: 'Từ vựng mới hôm nay',
        prompt: 'Dạy tôi 5 từ vựng tiếng Anh mới về chủ đề công nghệ',
        category: 'english',
        icon: '🇬🇧',
      },
      {
        id: 'morning-3',
        title: 'Tại sao...?',
        prompt: 'Tại sao bầu trời màu xanh? Giải thích một cách đơn giản',
        category: 'science',
        icon: '🔬',
      },
      {
        id: 'morning-4',
        title: 'Thành ngữ hay',
        prompt:
          'Giải thích ý nghĩa và cách dùng thành ngữ "Nước đến chân mới nhảy"',
        category: 'literature',
        icon: '📚',
      },
      {
        id: 'morning-5',
        title: 'Sự kiện lịch sử',
        prompt: 'Kể về một sự kiện lịch sử thú vị diễn ra vào ngày hôm nay',
        category: 'history',
        icon: '📜',
      },
      {
        id: 'morning-6',
        title: 'Mẹo học tập',
        prompt: 'Chia sẻ 3 mẹo học tập hiệu quả cho buổi sáng',
        category: 'other',
        icon: '💡',
      },
    ];
  } else if (hour < 18) {
    // Buổi chiều - học tập chuyên sâu
    return [
      {
        id: 'afternoon-1',
        title: 'Giải phương trình',
        prompt: 'Hướng dẫn giải phương trình bậc 2: x² - 5x + 6 = 0 từng bước',
        category: 'math',
        icon: '🧮',
      },
      {
        id: 'afternoon-2',
        title: 'Grammar Focus',
        prompt:
          'Giải thích sự khác biệt giữa Present Perfect và Past Simple với ví dụ',
        category: 'english',
        icon: '🇬🇧',
      },
      {
        id: 'afternoon-3',
        title: 'Phân tích văn bản',
        prompt: 'Phân tích đoạn thơ đầu trong "Tràng giang" của Huy Cận',
        category: 'literature',
        icon: '📚',
      },
      {
        id: 'afternoon-4',
        title: 'Thí nghiệm khoa học',
        prompt: 'Giải thích nguyên lý hoạt động của pin lithium-ion',
        category: 'science',
        icon: '🔬',
      },
      {
        id: 'afternoon-5',
        title: 'Chiến tranh thế giới',
        prompt:
          'Phân tích nguyên nhân và hậu quả của Chiến tranh thế giới thứ 2',
        category: 'history',
        icon: '📜',
      },
      {
        id: 'afternoon-6',
        title: 'Kỹ năng tư duy',
        prompt: 'Hướng dẫn áp dụng tư duy phê phán trong học tập',
        category: 'other',
        icon: '💡',
      },
    ];
  } else {
    // Buổi tối - ôn tập
    return [
      {
        id: 'evening-1',
        title: 'Ôn công thức toán',
        prompt: 'Tóm tắt các công thức toán quan trọng lớp 12 kèm ví dụ',
        category: 'math',
        icon: '🧮',
      },
      {
        id: 'evening-2',
        title: 'Review ngữ pháp',
        prompt: 'Ôn tập tất cả các thì trong tiếng Anh với ví dụ cụ thể',
        category: 'english',
        icon: '🇬🇧',
      },
      {
        id: 'evening-3',
        title: 'Ôn văn học',
        prompt: 'Tóm tắt đặc điểm của các trào lưu văn học Việt Nam',
        category: 'literature',
        icon: '📚',
      },
      {
        id: 'evening-4',
        title: 'Công thức vật lý',
        prompt: 'Liệt kê 10 công thức vật lý quan trọng nhất lớp 11',
        category: 'science',
        icon: '🔬',
      },
      {
        id: 'evening-5',
        title: 'Timeline lịch sử',
        prompt: 'Tạo timeline các sự kiện quan trọng trong lịch sử Việt Nam',
        category: 'history',
        icon: '📜',
      },
      {
        id: 'evening-6',
        title: 'Kế hoạch ngày mai',
        prompt: 'Tư vấn lập kế hoạch học tập hiệu quả cho ngày mai',
        category: 'other',
        icon: '💡',
      },
    ];
  }
}
