import { GoogleGenerativeAI } from '@google/generative-ai';

// Lấy API key từ biến môi trường
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Khởi tạo Google Generative AI với API key
export const genAI = new GoogleGenerativeAI(apiKey);

// Cấu hình model Gemini
export const geminiConfig = {
  // Sử dụng model công khai khuyến nghị (latest) nếu không cấu hình ENV
  model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash',
  maxOutputTokens: 1000,
  temperature: 0.9, // Tăng temperature để AI sáng tạo hơn
  topP: 0.95,
  topK: 40,
} as const;

// Preamble hệ thống: hướng dẫn AI luôn hỗ trợ mọi môn học, tiếng Việt, tuân thủ StudyFlow
const SYSTEM_PROMPT = `Bạn là trợ lý học tập của StudyFlow.
- Hỗ trợ TẤT CẢ môn học/kiến thức (ngôn ngữ, STEM, xã hội, kỹ năng mềm, v.v.).
- Luôn trả lời bằng tiếng Việt, rõ ràng, ngắn gọn, có cấu trúc, ưu tiên từng bước dễ hiểu cho sinh viên năm 1.
- Tuân thủ quy tắc UI/UX của ứng dụng khi cần tạo dữ liệu (không dùng markdown không cần thiết khi yêu cầu dữ liệu máy đọc).
- Khi người dùng yêu cầu tạo flashcards hoặc dữ liệu có cấu trúc, trả về đúng định dạng mà client mong đợi.`;

/**
 * Tạo instance của model
 * @returns Model instance
 */
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: geminiConfig.model });
};

/**
 * Gọi API Gemini để tạo phản hồi
 * @param prompt Prompt chính cần gửi đến API
 * @param chatHistory Lịch sử chat để cung cấp ngữ cảnh
 * @returns Phản hồi từ API
 */
export const generateGeminiResponse = async (
  prompt: string,
  _chatHistory: Array<{ role: 'user' | 'model'; content: string }> = [],
): Promise<string> => {
  try {
    if (!apiKey) {
      // Không có API key: trả về fallback ngay để UI vẫn hoạt động
      return generateLocalAIResponse(prompt);
    }

    // Không log nội dung prompt để bảo mật system prompt và dữ liệu người dùng
    if (process.env.NODE_ENV === 'development') {
      console.log('Calling Gemini API');
    }

    // Gọi đúng một model đã cấu hình (hoặc default). Nếu lỗi, rơi về local ngay để tránh spam 404
    const modelId = geminiConfig.model || 'gemini-1.5-flash';
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const combinedPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;
      const result = await model.generateContent(combinedPrompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `Error generating content with model "${modelId}":`,
          error,
        );
      }
      return generateLocalAIResponse(prompt);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating Gemini response:', error);
    }
    // Luôn trả fallback để không chặn luồng UX
    return generateLocalAIResponse(prompt);
  }
};

/**
 * Tạo phản hồi local khi không có API key hoặc API gặp lỗi
 * @param userMessage Tin nhắn của người dùng
 * @returns Phản hồi local
 */
export const generateLocalAIResponse = (userMessage: string): string => {
  // Nếu người dùng yêu cầu tạo flashcards, trả về JSON chuẩn để UI có thể parse sử dụng luôn
  const lower = userMessage.toLowerCase();
  if (lower.includes('flashcard')) {
    const items = Array.from({ length: 10 }).map((_, i) => ({
      front: `Grammar Tip ${i + 1}`,
      back: `Basic English grammar rule #${i + 1}.`,
      example: `This is example sentence #${i + 1}.`,
      exampleTranslation: `Đây là câu ví dụ số ${i + 1}.`,
    }));
    return JSON.stringify({ flashcards: items });
  }

  const responses = [
    '🔌 Hiện tại tôi không thể kết nối tới máy chủ AI. Trong lúc chờ đợi, bạn có thể:\n\n📚 Ôn tập flashcards đã tạo\n⏰ Sử dụng Pomodoro timer để học tập\n✅ Hoàn thành thói quen học tập hàng ngày\n\n🔄 Vui lòng kiểm tra kết nối internet và thử lại sau!',
    '💡 Tôi đang gặp sự cố kỹ thuật tạm thời. Đây là một số gợi ý học tiếng Anh bạn có thể thử:\n\n🎧 Nghe podcast tiếng Anh 15-20 phút/ngày\n📖 Đọc tin tức trên BBC Learning English\n✍️ Viết nhật ký bằng tiếng Anh\n🗣️ Nói chuyện với bản thân bằng tiếng Anh\n\n⚡ Hãy thử lại sau vài phút nhé!',
    '🚧 Đường truyền tới AI server đang được bảo trì. Trong khi chờ đợi:\n\n📱 Hãy thử các chức năng khác trong app\n📝 Tạo flashcards thủ công\n⏲️ Luyện tập với Pomodoro timer\n📊 Kiểm tra tiến độ học tập của bạn\n\n🔄 Tôi sẽ quay lại sớm thôi!',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};
