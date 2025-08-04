import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Lấy API key từ biến môi trường
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Khởi tạo Google Generative AI với API key
export const genAI = new GoogleGenerativeAI(apiKey);

// Cấu hình model Gemini
export const geminiConfig = {
  model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
  maxOutputTokens: 4000,
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

    console.log("Calling Gemini API with chat history length:", chatHistory.length);
    
    const model = getGeminiModel();
    
    // Tạo chat session với lịch sử cuộc hội thoại
    let result;
    
    try {
      // Sử dụng startChat để duy trì ngữ cảnh trò chuyện
      const chat = model.startChat({
        history: chatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: geminiConfig.maxOutputTokens,
          temperature: geminiConfig.temperature,
          topP: geminiConfig.topP,
          topK: geminiConfig.topK,
        },
      });
      
      // Gửi tin nhắn mới và nhận phản hồi
      result = await chat.sendMessage(prompt);
    } catch (error) {
      console.error("Error using chat API, falling back to direct generation");
      
      try {
        // Fallback: Tạo prompt bao gồm lịch sử trò chuyện
        let fullPrompt = "";
        
        // Thêm lịch sử trò chuyện vào prompt
        if (chatHistory.length > 0) {
          fullPrompt += "Lịch sử trò chuyện:\n\n";
          chatHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Người dùng' : 'AI';
            fullPrompt += `${role}: ${msg.content}\n\n`;
          });
          fullPrompt += "Tin nhắn hiện tại:\n\n";
        }
        
        fullPrompt += prompt;
        
        // Sử dụng generateContent với prompt đầy đủ
        result = await model.generateContent(fullPrompt);
      } catch (fallbackError) {
        console.error("Error with fallback generation");
        throw new Error("Failed to generate AI response");
      }
    }
    
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating Gemini response");
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