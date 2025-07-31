import { GoogleGenerativeAI } from "@google/generative-ai";

// Lấy API key từ biến môi trường
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// API key không hợp lệ, cần đăng ký tại https://ai.google.dev/
// Khởi tạo Google Generative AI với API key
export const genAI = new GoogleGenerativeAI(apiKey);

// Cấu hình model Gemini
export const geminiConfig = {
  model: "gemini-pro", // Sử dụng model gemini-pro thay vì gemini-1.5-pro
  maxOutputTokens: 1000,
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
};

// Tạo instance của model
export const getGeminiModel = () => {
  return genAI.getGenerativeModel(geminiConfig);
};

// Hàm gọi API Gemini
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    if (!apiKey) {
      console.warn("Missing Gemini API key. Using fallback responses.");
      return "Xin lỗi, tôi không thể kết nối với dịch vụ AI. Vui lòng cấu hình API key trong tệp .env.local";
    }

    console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");
    
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log("Received response from Gemini API");
    return text;
  } catch (error: any) {
    console.error("Error generating Gemini response:", error);
    
    // Xử lý các lỗi cụ thể
    if (error.message?.includes("API key")) {
      return "Xin lỗi, API key không hợp lệ. Vui lòng kiểm tra lại cấu hình API key trong tệp .env.local";
    } else if (error.message?.includes("network")) {
      return "Xin lỗi, tôi đang gặp sự cố kết nối mạng. Vui lòng thử lại sau.";
    } else {
      return `Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.`;
    }
  }
};