import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Lấy API key từ biến môi trường
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Khởi tạo Google Generative AI với API key
export const genAI = new GoogleGenerativeAI(apiKey);

// Cấu hình model Gemini
export const geminiConfig = {
  model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-pro",
  maxOutputTokens: 1000,
  temperature: 0.7,
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

    console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");
    
    const model = getGeminiModel();
    
    // Tạo chat session với lịch sử cuộc hội thoại
    let result;
    
    if (chatHistory.length > 0) {
      try {
        // Chuyển đổi định dạng lịch sử chat để phù hợp với API
        const formattedHistory = chatHistory.map(msg => ({
          parts: [{ text: msg.content }],
          role: msg.role === 'user' ? 'user' : 'model'
        }));
        
        // Sử dụng lịch sử chat nếu có
        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: {
            maxOutputTokens: geminiConfig.maxOutputTokens,
            temperature: geminiConfig.temperature,
            topP: geminiConfig.topP,
            topK: geminiConfig.topK,
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
            }
          ]
        });
        
        result = await chat.sendMessage(prompt);
      } catch (chatError) {
        console.error("Error using chat history:", chatError);
        // Fallback to simple content generation if chat fails
        result = await model.generateContent(prompt);
      }
    } else {
      // Nếu không có lịch sử, gọi API bình thường
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    throw error;
  }
};

/**
 * Tạo phản hồi local khi không có API key hoặc API gặp lỗi
 * @param userMessage Tin nhắn của người dùng
 * @returns Phản hồi local
 */
export const generateLocalAIResponse = (userMessage: string): string => {
  // Simple mock responses based on keywords
  const lowerMessage = userMessage.toLowerCase();
  
  // Giới từ
  if (lowerMessage.includes('on monday') || lowerMessage.includes('in monday')) {
    return 'Câu hỏi hay! Chúng ta dùng "on Monday" thay vì "in Monday" vì:\n\n📅 Với các ngày trong tuần, chúng ta luôn dùng giới từ "ON"\n- On Monday (vào thứ Hai)\n- On Friday (vào thứ Sáu)\n\n🗓️ "IN" được dùng với:\n- Tháng: in January\n- Năm: in 2024\n- Thời gian dài: in the morning\n\nVí dụ:\n✅ I have a meeting on Monday\n❌ I have a meeting in Monday';
  }
  
  // Ôn tập
  if (lowerMessage.includes('ôn tập') || lowerMessage.includes('review')) {
    return '📚 Tuyệt! Hãy cùng ôn tập những từ quan trọng:\n\n🔸 Beautiful - đẹp\n🔸 Interesting - thú vị\n🔸 Difficult - khó\n🔸 Airport - sân bay\n🔸 Meeting - cuộc họp\n\nBạn muốn tôi tạo câu ví dụ cho từ nào?';
  }
  
  // Quiz
  if (lowerMessage.includes('quiz')) {
    return '🎯 Quiz nhanh cho bạn!\n\n❓ Từ nào có nghĩa là "thú vị"?\nA) Beautiful\nB) Interesting\nC) Difficult\nD) Important\n\nHãy trả lời và tôi sẽ giải thích!';
  }
  
  // Audio
  if (lowerMessage.includes('audio') || lowerMessage.includes('nghe')) {
    return '🎧 Gợi ý audio cho bạn:\n\n📻 BBC Learning English (5-10 phút)\n🎙️ English Pod (Beginner level)\n📱 Duolingo Podcast (Interesting stories)\n🎬 TED-Ed videos (Short & engaging)\n\nBắt đầu với 10 phút mỗi ngày nhé!';
  }

  // Trả lời quiz
  if (lowerMessage.includes('b') && (lowerMessage.includes('quiz') || lowerMessage.includes('interesting'))) {
    return '🎉 Chính xác! "Interesting" có nghĩa là "thú vị, hấp dẫn".\n\n✨ Cách sử dụng:\n- This movie is interesting (Bộ phim này thú vị)\n- An interesting story (Một câu chuyện thú vị)\n\n📖 Từ đồng nghĩa: fascinating, engaging, captivating\n\nBạn có muốn thử câu hỏi khác không?';
  }
  
  // Thì hiện tại đơn
  if (lowerMessage.includes('present simple') || lowerMessage.includes('hiện tại đơn')) {
    return '📝 Thì hiện tại đơn (Present Simple)\n\n🔹 Công thức: S + V(s/es) + O\n\n🔹 Cách dùng:\n- Diễn tả thói quen, sự thật hiển nhiên\n- Lịch trình, thời gian biểu\n\n🔹 Dấu hiệu nhận biết:\n- Always, usually, often, sometimes, rarely, never\n- Every day/week/month/year\n\n🔹 Ví dụ:\n- I go to school every day\n- She works in a bank\n- The sun rises in the east';
  }
  
  // Từ vựng du lịch
  if (lowerMessage.includes('du lịch') || lowerMessage.includes('travel')) {
    return '✈️ Từ vựng du lịch cơ bản:\n\n🔸 Airport - Sân bay\n🔸 Passport - Hộ chiếu\n🔸 Luggage/Baggage - Hành lý\n🔸 Check-in - Làm thủ tục\n🔸 Flight - Chuyến bay\n🔸 Departure - Khởi hành\n🔸 Arrival - Đến nơi\n🔸 Hotel - Khách sạn\n🔸 Reservation - Đặt chỗ\n🔸 Sightseeing - Tham quan\n\nBạn muốn học thêm từ vựng nào?';
  }
  
  // Cách học từ vựng
  if (lowerMessage.includes('cách học') || lowerMessage.includes('how to learn')) {
    return '📚 5 cách học từ vựng hiệu quả:\n\n1️⃣ Học từ trong ngữ cảnh (câu, đoạn văn)\n2️⃣ Sử dụng flashcards và ứng dụng học từ vựng\n3️⃣ Tạo liên kết hình ảnh với từ mới\n4️⃣ Thực hành sử dụng từ mới trong câu\n5️⃣ Ôn tập theo lịch trình (spaced repetition)\n\nHãy thử áp dụng phương pháp nào phù hợp với bạn nhé!';
  }
  
  // Chào hỏi
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('chào')) {
    return 'Xin chào! Rất vui được gặp bạn. Tôi là AI Coach tiếng Anh của bạn. Hôm nay bạn muốn học gì? 😊\n\n- Từ vựng mới?\n- Ngữ pháp?\n- Luyện tập hội thoại?\n- Kiểm tra kiến thức?';
  }
  
  // Mặc định
  return 'Tôi hiểu! Đây là một câu hỏi thú vị về tiếng Anh. Bạn có thể chia sẻ thêm chi tiết để tôi giúp bạn tốt hơn không? 😊\n\nTôi có thể giúp bạn:\n📚 Giải thích ngữ pháp\n📖 Học từ vựng mới\n🎯 Tạo quiz luyện tập\n🎧 Gợi ý tài liệu nghe';
};