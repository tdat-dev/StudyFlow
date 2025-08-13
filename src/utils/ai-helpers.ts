// Utility functions for AI integration
export async function generateAIResponse(
  userMessage: string,
  user: any
): Promise<string> {
  try {
    // Trong môi trường development, log prompt
    if (process.env.NODE_ENV === "development") {
      console.log("User message:", userMessage);
      console.log("User context:", user);
    }

    // Import GoogleGenerativeAI dynamically để tránh lỗi server-side
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Tạo prompt context dựa trên thông tin user
    const userContext = user
      ? `
    Thông tin người dùng:
    - Tên: ${user.displayName || "Người dùng"}
    - Email: ${user.email || "Không có"}
    - Trình độ hiện tại: ${user.level || "Mới bắt đầu"}
    - Mục tiêu học tập: ${
      user.goals?.join(", ") || "Cải thiện tiếng Anh tổng quát"
    }
    `
      : "Người dùng chưa đăng nhập";

    const systemPrompt = `
    Bạn là một trợ lý AI chuyên về học tiếng Anh. Hãy trả lời bằng tiếng Việt một cách thân thiện và hữu ích.
    
    ${userContext}
    
    Nhiệm vụ của bạn:
    1. Trả lời các câu hỏi về tiếng Anh
    2. Giúp người dùng học từ vựng, ngữ pháp
    3. Tạo bài tập và flashcards phù hợp
    4. Đưa ra lời khuyên học tập
    5. Khuyến khích và động viên người học
    
    Hãy trả lời câu hỏi sau một cách chi tiết và hữu ích:
    `;

    const prompt = `${systemPrompt}\n\nCâu hỏi: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.";
  }
}

export async function generateFlashcardsAI(
  prompt: string,
  user: any
): Promise<string> {
  try {
    // Import GoogleGenerativeAI dynamically để tránh lỗi server-side
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Tạo prompt context dựa trên thông tin user
    const userContext = user
      ? `
    Thông tin người dùng:
    - Tên: ${user.displayName || "Người dùng"}
    - Trình độ hiện tại: ${user.level || "Mới bắt đầu"}
    - Mục tiêu học tập: ${
      user.goals?.join(", ") || "Cải thiện tiếng Anh tổng quát"
    }
    `
      : "Người dùng chưa đăng nhập";

    const systemPrompt = `
    Bạn là một trợ lý AI chuyên tạo flashcards học tiếng Anh.
    
    ${userContext}
    
    Hãy tạo flashcards dựa trên yêu cầu của người dùng. Trả về dữ liệu JSON với format:
    {
      "flashcards": [
        {
          "front": "Từ tiếng Anh hoặc câu hỏi",
          "back": "Nghĩa tiếng Việt hoặc câu trả lời",
          "category": "Loại từ (noun, verb, adjective, etc.)",
          "difficulty": "easy|medium|hard"
        }
      ]
    }
    
    Yêu cầu tạo flashcards:
    `;

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return JSON.stringify({
      flashcards: [
        {
          front: "Error",
          back: "Không thể tạo flashcards lúc này",
          category: "error",
          difficulty: "easy",
        },
      ],
    });
  }
}
