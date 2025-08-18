/**
 * Main AI Service for StudyFlow App
 * Centralized AI interactions with fallback system
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
          model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash',
        });
        this.isInitialized = true;
        console.log('✅ AI Service initialized with Gemini');
      } else {
        console.warn('⚠️ No Gemini API key found, using fallback responses');
      }
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error);
    }
  }

  /**
   * Generate AI response for English tutoring
   */
  async generateTutorResponse(
    userMessage: string,
    history: ChatMessage[] = [],
  ): Promise<string> {
    if (!this.isInitialized || !this.model) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      const prompt = this.buildTutorPrompt(userMessage, history);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text?.trim() || this.getFallbackResponse(userMessage);
    } catch (error) {
      console.error('🔥 AI Generation Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Generate study suggestions
   */
  async generateSuggestions(context: any = {}): Promise<
    Array<{
      id: string;
      title: string;
      prompt: string;
      category: string;
    }>
  > {
    if (!this.isInitialized || !this.model) {
      return this.getFallbackSuggestions();
    }

    try {
      const prompt = this.buildSuggestionsPrompt(context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseSuggestions(text) || this.getFallbackSuggestions();
    } catch (error) {
      console.error('🔥 Suggestions Error:', error);
      return this.getFallbackSuggestions();
    }
  }

  /**
   * Build tutor prompt with system context
   */
  private buildTutorPrompt(
    message: string,
    history: ChatMessage[] = [],
  ): string {
    const systemPrompt = `Bạn là StudyFlow AI - trợ lý học tiếng Anh thông minh và thân thiện.

🎯 VAI TRÒ:
- Giáo viên tiếng Anh nhiệt tình, kiên nhẫn 
- Luôn khuyến khích và tạo động lực
- Cung cấp phản hồi chi tiết và xây dựng

📚 CHỨC NĂNG:
1. GIẢI THÍCH TỪ VỰNG & NGỮ PHÁP
2. LUYỆN TẬP HỘI THOẠI
3. TẠO BÀI TẬP THỰC HÀNH  
4. SỬA LỖI VÀ GỢI Ý
5. ĐỘNG VIÊN HỌC TẬP

💬 PHONG CÁCH:
- Thân thiện, dễ hiểu
- Sử dụng emoji phù hợp 
- Trả lời ngắn gọn nhưng đầy đủ
- Ưu tiên tiếng Việt khi cần giải thích

🌟 LƯU Ý:
- Luôn khuyến khích thử thách mới
- Phản hồi tích cực trước khi chỉ lỗi  
- Bài tập phù hợp với trình độ
- Giải thích từ khó bằng từ đơn giản`;

    const historyText = history
      .slice(-6) // Giới hạn history để tránh token limit
      .map(
        msg =>
          `${msg.role === 'user' ? 'Học viên' : 'StudyFlow AI'}: ${msg.content}`,
      )
      .join('\n');

    return `${systemPrompt}

${historyText ? '📋 LỊCH SỬ HỘI THOẠI:\n' + historyText + '\n\n' : ''}💬 TIN NHẮN MỚI:
Học viên: ${message}

StudyFlow AI:`;
  }

  /**
   * Build suggestions prompt
   */
  private buildSuggestionsPrompt(_context: any): string {
    const timeOfDay =
      new Date().getHours() < 12
        ? 'morning'
        : new Date().getHours() < 18
          ? 'afternoon'
          : 'evening';

    return `Tạo 6 gợi ý học tập tiếng Anh cho ${timeOfDay}. Format JSON:
[{"id":"1","title":"Tiêu đề ngắn","prompt":"Câu hỏi cụ thể","category":"vocabulary|grammar|conversation|writing"}]

Yêu cầu:
- Phù hợp với thời gian ${timeOfDay}
- Đa dạng về chủ đề và mức độ
- Câu hỏi thú vị, thực tế
- Tiêu đề thu hút, dễ hiểu

Ví dụ buổi sáng: từ vựng energy, grammar present tense
Ví dụ buổi chiều: conversation topics, writing skills  
Ví dụ buổi tối: review exercises, relaxing topics`;
  }

  /**
   * Parse AI suggestions response
   */
  private parseSuggestions(response: string): Array<{
    id: string;
    title: string;
    prompt: string;
    category: string;
  }> | null {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any, index: number) => ({
          id: s.id || `suggestion-${index + 1}`,
          title: s.title || 'Gợi ý học tập',
          prompt: s.prompt || 'Hãy cùng học tiếng Anh!',
          category: s.category || 'general',
        }));
      }
      return null;
    } catch (error) {
      console.error('Parse suggestions error:', error);
      return null;
    }
  }

  /**
   * Fallback response when AI is not available
   */
  private getFallbackResponse(message: string): string {
    const responses = [
      '😊 Tôi hiểu bạn đang muốn học về: "' +
        message.slice(0, 50) +
        '...". Hãy thử hỏi cụ thể hơn nhé!',
      '🌟 Đây là câu hỏi hay! Tôi sẽ giúp bạn tìm hiểu về chủ đề này.',
      '📚 Cảm ơn bạn đã chia sẻ! Hãy cùng khám phá tiếng Anh nhé.',
      '💡 Tôi thấy bạn quan tâm đến việc học. Đó là điều tuyệt vời!',
      '🎯 Hãy cùng thực hành để cải thiện kỹ năng tiếng Anh của bạn!',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Fallback suggestions when AI is not available
   */
  private getFallbackSuggestions() {
    const timeOfDay =
      new Date().getHours() < 12
        ? 'morning'
        : new Date().getHours() < 18
          ? 'afternoon'
          : 'evening';

    const suggestions = {
      morning: [
        {
          id: '1',
          title: 'Từ vựng buổi sáng',
          prompt: 'Dạy tôi 5 từ vựng về hoạt động buổi sáng',
          category: 'vocabulary',
        },
        {
          id: '2',
          title: 'Chào hỏi tiếng Anh',
          prompt: 'Cách chào hỏi lịch sự trong tiếng Anh',
          category: 'conversation',
        },
        {
          id: '3',
          title: 'Present Simple',
          prompt: 'Giải thích thì hiện tại đơn với ví dụ',
          category: 'grammar',
        },
      ],
      afternoon: [
        {
          id: '1',
          title: 'Đàm thoại công việc',
          prompt: 'Mô phỏng cuộc trò chuyện trong môi trường làm việc',
          category: 'conversation',
        },
        {
          id: '2',
          title: 'Viết email',
          prompt: 'Hướng dẫn viết email tiếng Anh chuyên nghiệp',
          category: 'writing',
        },
        {
          id: '3',
          title: 'Từ vựng thức ăn',
          prompt: 'Dạy tôi từ vựng về món ăn phổ biến',
          category: 'vocabulary',
        },
      ],
      evening: [
        {
          id: '1',
          title: 'Ôn tập ngữ pháp',
          prompt: 'Tạo bài tập ôn tập ngữ pháp cơ bản',
          category: 'grammar',
        },
        {
          id: '2',
          title: 'Trò chuyện thư giãn',
          prompt: 'Nói về sở thích và thời gian rảnh',
          category: 'conversation',
        },
        {
          id: '3',
          title: 'Từ vựng cảm xúc',
          prompt: 'Học từ vựng diễn tả cảm xúc và tâm trạng',
          category: 'vocabulary',
        },
      ],
    };

    return suggestions[timeOfDay] || suggestions.afternoon;
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.model !== null;
  }

  /**
   * Get service status
   */
  getStatus(): { available: boolean; provider: string } {
    return {
      available: this.isAvailable(),
      provider: this.isAvailable() ? 'Gemini AI' : 'Fallback System',
    };
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export main functions for backward compatibility
export const generateTutorResponse = (
  message: string,
  history: ChatMessage[] = [],
) => aiService.generateTutorResponse(message, history);

// Export chat naming functions
export { generateChatTitle, detectMessageLanguage } from './chatNaming';

export const generateAISuggestions = (context: any = {}) =>
  aiService.generateSuggestions(context);

export default aiService;
