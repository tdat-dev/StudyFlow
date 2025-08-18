import { generateTutorResponse } from './index';

/**
 * Tạo tên chat thông minh dựa trên nội dung tin nhắn đầu tiên
 */
export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const prompt = `Phân tích tin nhắn sau và tạo một tiêu đề ngắn gọn (tối đa 50 ký tự) cho cuộc trò chuyện. Tiêu đề nên thể hiện chủ đề chính hoặc ý định của người dùng. Chỉ trả về tiêu đề, không cần giải thích thêm:

"${firstMessage}"

Một số ví dụ:
- "How to learn English?" → "Học tiếng Anh"
- "Tôi muốn cải thiện phát âm" → "Cải thiện phát âm"  
- "What is the difference between..." → "So sánh ngữ pháp"
- "Can you help me with homework?" → "Giúp bài tập"

Tiêu đề cho tin nhắn trên:`;

    const response = await generateTutorResponse(prompt, []);

    // Làm sạch response - loại bỏ dấu ngoặc kép và ký tự không cần thiết
    let title = response
      .replace(/^["']|["']$/g, '') // Loại bỏ dấu ngoặc kép ở đầu/cuối
      .replace(/\n[\s\S]*$/, '') // Chỉ lấy dòng đầu tiên (không dùng flag s)
      .trim();

    // Đảm bảo không quá dài
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    // Fallback nếu AI không tạo được tên hợp lý
    if (!title || title.length < 3) {
      title =
        firstMessage.length > 30
          ? firstMessage.substring(0, 30) + '...'
          : firstMessage;
    }

    return title;
  } catch (error) {
    console.error('Error generating chat title:', error);

    // Fallback về cách cũ
    return firstMessage.length > 30
      ? firstMessage.substring(0, 30) + '...'
      : firstMessage;
  }
}

/**
 * Phát hiện ngôn ngữ chính của tin nhắn để tạo tên phù hợp
 */
export function detectMessageLanguage(message: string): 'vi' | 'en' {
  // Kiểm tra ký tự tiếng Việt (có dấu)
  const vietnameseRegex =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  if (vietnameseRegex.test(message)) {
    return 'vi';
  }

  // Kiểm tra từ khóa tiếng Việt không dấu phổ biến
  const vietnameseWords = [
    'toi',
    'ban',
    'la',
    'co',
    'khong',
    'gi',
    'nao',
    'nhu',
    'voi',
    'cua',
    'trong',
    'ngoai',
    'tren',
    'duoi',
    'hay',
    'hoac',
    'neu',
    'ma',
    'vi',
    'de',
  ];

  const lowerMessage = message.toLowerCase();
  const hasVietnameseWords = vietnameseWords.some(
    word =>
      lowerMessage.includes(' ' + word + ' ') ||
      lowerMessage.startsWith(word + ' ') ||
      lowerMessage.endsWith(' ' + word),
  );

  return hasVietnameseWords ? 'vi' : 'en';
}
