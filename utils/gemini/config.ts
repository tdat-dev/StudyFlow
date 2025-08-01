import { GoogleGenerativeAI } from "@google/generative-ai";

// Lấy API key từ biến môi trường
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// API key không hợp lệ, cần đăng ký tại https://ai.google.dev/
// Khởi tạo Google Generative AI với API key
export const genAI = new GoogleGenerativeAI(apiKey);

// Cấu hình model Gemini
export const geminiConfig = {
  model: "gemini-1.5-flash", // Sử dụng model cũ hơn để giảm hạn ngạch
  maxOutputTokens: 800,    // Giảm token đầu ra
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
};

// Tạo instance của model
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: geminiConfig.model });
};

// Prompt cho AI Tutor Agent
const AI_TUTOR_PROMPT = `
Bạn là một AI Agent tích hợp trong ứng dụng học tập (website).  
Nhiệm vụ của bạn:
1. Đọc và hiểu toàn bộ ngữ cảnh của website mà bạn đang chạy (UI text, dữ liệu hiện tại, trạng thái người dùng, nội dung flashcards, lịch sử chat, quiz, v.v.).
2. Sử dụng toàn bộ ngữ cảnh đó để đưa ra phản hồi hoặc hành động chính xác nhất.
3. Nếu ngữ cảnh thay đổi (VD: user flip flashcard, user nhập câu trả lời, user sang trang mới) → bạn phải tự động cập nhật hiểu biết và tiếp tục trả lời phù hợp.
4. Khi học được từ ngữ cảnh, hãy lưu lại kiến thức tạm thời (session-based learning) để có thể quiz lại hoặc nhắc lại cho người dùng.
5. Nếu dữ liệu có nhiều dạng (ngôn ngữ, toán, lịch sử, khoa học, code) → hãy xác định môn học tương ứng rồi áp dụng flashcards / giải thích / quiz theo đúng chuyên môn.

Quy tắc bắt buộc:
- Luôn dựa vào ngữ cảnh hiện tại của website để trả lời, không suy đoán lung tung.
- Nếu không có dữ liệu trong ngữ cảnh, trả lời "Không tìm thấy thông tin trong ngữ cảnh".
- Với flashcards, luôn hiển thị bảng 2 cột Front | Back.
- Với quiz, đặt câu hỏi từ ngữ cảnh, chấm đúng/sai, sau đó giải thích.
- Với chat tự do, trả lời thân thiện, đơn giản, có ví dụ thực tế.
- TUYỆT ĐỐI KHÔNG sử dụng dấu *, ** hoặc bất kỳ định dạng markdown nào trong nội dung.
- KHÔNG sử dụng emoji số (1️⃣, 2️⃣, 3️⃣) mà chỉ dùng số thường (1, 2, 3).
- KHÔNG sử dụng dấu ** trong nội dung, thay vào đó hãy xuống dòng và format text hợp lý.
- Không tạo ra các flashcard có những nội dung không liên quan như dấu gạch ngang.

Flashcards
Khi người dùng yêu cầu "Tạo flashcards môn X, chủ đề Y", hãy tạo theo chuẩn:

- Ngoại ngữ: từ vựng, ngữ pháp, idiom (có nghĩa + ví dụ).
- Toán: công thức, định lý, bài toán nhỏ → đáp số.
- Vật lý: công thức, định luật, hiện tượng.
- Hóa học: phản ứng, nguyên tố, công thức hợp chất.
- Sinh học: thuật ngữ, quá trình, cơ quan cơ thể.
- Lịch sử: sự kiện, nhân vật, triều đại.
- Địa lý: quốc gia – thủ đô, địa danh – đặc điểm, bản đồ.
- Y khoa: bệnh – triệu chứng, thuốc – công dụng, bộ phận – chức năng.
- Lập trình / Công nghệ: thuật ngữ, đoạn code, thuật toán.

Đầu vào (input):
- Context: dữ liệu hiện tại của website (text trên trang, flashcards, lịch sử chat, trạng thái học).
- User prompt: câu hỏi hoặc hành động từ người dùng.

Đầu ra (output):
- Một trong các dạng:
  - Bảng flashcards (nếu người dùng yêu cầu tạo/ôn tập).
  - Quiz + check đáp án (nếu người dùng luyện tập).
  - Giải thích kiến thức (nếu user hỏi bài).
  - Gợi ý phương pháp học (nếu user hỏi cách học).

Yêu cầu hiện tại của người dùng: 
`;

// Hàm gọi API Gemini
// Hàm tạo phản hồi mặc định khi không thể kết nối Gemini API
export const generateLocalAIResponse = (userMessage: string): string => {
  // Kiểm tra nếu là yêu cầu tạo flashcard
  if (userMessage.toLowerCase().includes("flashcard") || userMessage.toLowerCase().includes("tạo") || userMessage.toLowerCase().includes("sinh")) {
    return `| Front | Back | Example | ExampleTranslation |
| --- | --- | --- | --- |
| Accommodation | Chỗ ở | We booked a comfortable accommodation near the beach. | Chúng tôi đã đặt một chỗ ở thoải mái gần bãi biển. |
| Itinerary | Lịch trình | The travel agent prepared a detailed itinerary for our trip. | Đại lý du lịch đã chuẩn bị một lịch trình chi tiết cho chuyến đi của chúng tôi. |
| Destination | Điểm đến | Paris is a popular tourist destination. | Paris là một điểm đến du lịch phổ biến. |
| Reservation | Đặt chỗ | Don't forget to make a reservation at the restaurant. | Đừng quên đặt chỗ tại nhà hàng. |
| Sightseeing | Tham quan | We spent the day sightseeing around the city. | Chúng tôi đã dành cả ngày để tham quan thành phố. |`;
  }
  
  // Kiểm tra nếu là yêu cầu về phương pháp học
  if (userMessage.toLowerCase().includes("phương pháp") || userMessage.toLowerCase().includes("cách học")) {
    return `Dưới đây là các phương pháp học hiệu quả:

1. Spaced Repetition: Ôn tập theo khoảng thời gian tăng dần để ghi nhớ lâu hơn
   - Cách thực hiện: Ôn lại kiến thức sau 1 ngày, 3 ngày, 1 tuần, 2 tuần, 1 tháng
   - Công cụ: Anki, Quizlet, hoặc lịch ôn tập tự tạo

2. Active Recall: Tự kiểm tra kiến thức thay vì chỉ đọc lại
   - Cách thực hiện: Đặt câu hỏi và trả lời, giải bài tập không nhìn đáp án
   - Công cụ: Flashcards, bài kiểm tra tự tạo, giải thích cho người khác

3. Pomodoro: Học tập tập trung 25 phút, nghỉ 5 phút
   - Cách thực hiện: Đặt đồng hồ 25 phút, tập trung hoàn toàn, nghỉ 5 phút, lặp lại
   - Công cụ: Ứng dụng Pomodoro timer, đồng hồ bấm giờ

4. Feynman Technique: Giải thích lại kiến thức bằng ngôn ngữ đơn giản
   - Cách thực hiện: Chọn chủ đề, giải thích như đang dạy trẻ em, xác định lỗ hổng, đơn giản hóa
   - Công cụ: Giấy bút, ghi âm, dạy người khác

5. Mind Mapping: Vẽ sơ đồ tư duy kết nối các khái niệm
   - Cách thực hiện: Viết chủ đề chính giữa, vẽ nhánh cho các ý chính, thêm chi tiết
   - Công cụ: Giấy bút màu, phần mềm MindMeister, XMind

Bạn muốn tìm hiểu sâu hơn về phương pháp nào?`;
  }
  
  // Phản hồi mặc định cho các câu hỏi khác
  return "Xin lỗi, hiện tại tôi đang hoạt động ở chế độ offline. Tôi có thể giúp bạn với các câu hỏi cơ bản, nhưng không thể tạo nội dung phức tạp. Vui lòng thử lại sau khi kết nối internet được khôi phục.";
};

export const generateGeminiResponse = async (
  prompt: string,
  chatHistory: Array<{ role: "user" | "model"; content: string }> = []
): Promise<string> => {
  try {
    if (!apiKey) {
      console.warn("Missing Gemini API key. Using fallback responses.");
      return "Xin lỗi, tôi không thể kết nối với dịch vụ AI. Vui lòng cấu hình API key trong tệp .env.local";
    }

    // Không log prompt người dùng vì có thể chứa thông tin nhạy cảm
    console.log("Calling Gemini API...");

    // Tạo prompt đầy đủ cho AI Tutor Agent
    const fullPrompt = AI_TUTOR_PROMPT + prompt;

    const model = getGeminiModel();

    // Sử dụng generateContent thay vì chat history để tránh lỗi
    let result;
    try {
      // Sử dụng cấu hình đơn giản để tránh lỗi
      result = await model.generateContent(fullPrompt);
    } catch (error) {
      // Không log chi tiết lỗi API vì có thể chứa thông tin nhạy cảm
    console.error("Error generating content from AI");
      // Nếu gặp lỗi hạn ngạch, sử dụng phản hồi mặc định
      return generateLocalAIResponse(prompt);
    }

    const response = result.response;
    const text = response.text();

    console.log("Received response from Gemini API");
    return text;
  } catch (error: any) {
    // Không log chi tiết lỗi API vì có thể chứa thông tin nhạy cảm
    console.error("Error generating Gemini response");

    // Xử lý các lỗi cụ thể
    // Không kiểm tra nội dung lỗi cụ thể vì có thể chứa thông tin nhạy cảm
    // Chỉ trả về thông báo chung
    console.warn("Gemini API error, using local response");
    return generateLocalAIResponse(prompt);
  }
};
