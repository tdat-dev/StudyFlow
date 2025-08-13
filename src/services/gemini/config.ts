import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Lấy API key từ biến môi trường
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Khởi tạo Google Generative AI với API key
export const genAI = new GoogleGenerativeAI(apiKey);

// Cấu hình model Gemini
export const geminiConfig = {
  model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash",
  maxOutputTokens: 1000,
  temperature: 0.9,  // Tăng temperature để AI sáng tạo hơn
  topP: 0.95,
  topK: 40,
};

/**
 * Tạo instance của model
 * @returns Model instance
 */
export const getGeminiModel = () => {
  return genAI.getGenerativeModel(geminiConfig);
};

/**
 * Gọi API Gemini để tạo phản hồi
 * @param prompt Prompt chính cần gửi đến API
 * @param chatHistory Lịch sử chat để cung cấp ngữ cảnh
 * @returns Phản hồi từ API
 */
export const generateGeminiResponse = async (
  prompt: string, 
  chatHistory: Array<{role: 'user' | 'model', content: string}> = []
): Promise<string> => {
  try {
    if (!apiKey) {
      console.warn("Missing Gemini API key. Using fallback responses.");
      throw new Error("Missing API key");
    }

    // Chỉ log trong môi trường development
    if (process.env.NODE_ENV === 'development') {
      console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");
    }
    
    const model = getGeminiModel();
    
    // Tạo chat session với lịch sử cuộc hội thoại
    let result;
    
    try {
      // Sử dụng generateContent thay vì chat history để tránh lỗi
      result = await model.generateContent(prompt);
    } catch (error) {
      // Chỉ log trong môi trường development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error generating content from AI:", error);
      }
      // Không truyền lỗi gốc vì có thể chứa thông tin nhạy cảm
      throw new Error("Failed to generate AI response");
    }
    
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    // Chỉ log trong môi trường development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error generating Gemini response:", error);
    }
    // Không truyền lỗi gốc vì có thể chứa thông tin nhạy cảm
    throw new Error("Failed to generate AI response");
  }
};

/**
 * Tạo phản hồi local khi không có API key hoặc API gặp lỗi
 * @param userMessage Tin nhắn của người dùng
 * @returns Phản hồi local
 */
export const generateLocalAIResponse = (userMessage: string): string => {
  // Phản hồi mặc định khi không thể kết nối tới Gemini API
  return "Hiện tại tôi không thể kết nối tới máy chủ AI. Vui lòng kiểm tra kết nối internet hoặc thử lại sau.";
};