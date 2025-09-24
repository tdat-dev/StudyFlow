/**
 * Gemini AI Service
 * Tích hợp với Google Gemini API để phân tích hình ảnh và nội dung
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
);

/**
 * Phân tích hình ảnh với Gemini Vision
 */
export async function generateImageAnalysis(
  base64Image: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Hãy phân tích hình ảnh này một cách chi tiết và hữu ích. Bao gồm:

1. **Mô tả tổng quan**: Những gì bạn thấy trong hình
2. **Chi tiết nội dung**: Text, số liệu, biểu đồ, diagram nếu có
3. **Ngữ cảnh**: Có thể là loại tài liệu gì (slide, báo cáo, code, etc.)
4. **Thông tin quan trọng**: Những điểm chính cần lưu ý

Trả lời bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin.`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg', // Default, sẽ được detect tự động
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating image analysis:', error);
    throw new Error('Không thể phân tích hình ảnh với AI');
  }
}

/**
 * Phân tích code với Gemini
 */
export async function analyzeCodeWithGemini(
  code: string,
  language: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Hãy phân tích đoạn code ${language} này:

\`\`\`${language}
${code}
\`\`\`

Bao gồm:
1. **Chức năng**: Code này làm gì?
2. **Cấu trúc**: Các thành phần chính
3. **Logic**: Luồng xử lý chính
4. **Điểm mạnh/yếu**: Những điểm tốt và cần cải thiện
5. **Gợi ý**: Cách tối ưu hoặc cải thiện

Trả lời bằng tiếng Việt, chi tiết và hữu ích.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error analyzing code with Gemini:', error);
    throw new Error('Không thể phân tích code với AI');
  }
}

/**
 * Phân tích HTML/CSS với Gemini
 */
export async function analyzeHTMLWithGemini(
  htmlContent: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Hãy phân tích đoạn HTML/CSS này:

\`\`\`html
${htmlContent}
\`\`\`

Bao gồm:
1. **Cấu trúc**: Layout và các thành phần chính
2. **Styling**: CSS classes và styles được sử dụng
3. **Functionality**: JavaScript functionality nếu có
4. **Responsive**: Có responsive design không?
5. **Accessibility**: Có accessibility features không?
6. **Performance**: Điểm cần cải thiện về performance
7. **Best practices**: Có tuân thủ best practices không?

Trả lời bằng tiếng Việt, chi tiết và đưa ra gợi ý cải thiện.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error analyzing HTML with Gemini:', error);
    throw new Error('Không thể phân tích HTML với AI');
  }
}

/**
 * Phân tích JSON data với Gemini
 */
export async function analyzeJSONWithGemini(
  jsonContent: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Hãy phân tích JSON data này:

\`\`\`json
${jsonContent}
\`\`\`

Bao gồm:
1. **Cấu trúc**: Schema và các fields chính
2. **Mục đích**: Data này có thể được dùng để làm gì?
3. **Validation**: Có cần validation rules không?
4. **Optimization**: Cách tối ưu structure
5. **Usage examples**: Ví dụ cách sử dụng data này

Trả lời bằng tiếng Việt, chi tiết và thực tế.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error analyzing JSON with Gemini:', error);
    throw new Error('Không thể phân tích JSON với AI');
  }
}

/**
 * Phân tích Markdown với Gemini
 */
export async function analyzeMarkdownWithGemini(
  markdownContent: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Hãy phân tích nội dung Markdown này:

\`\`\`markdown
${markdownContent}
\`\`\`

Bao gồm:
1. **Nội dung chính**: Tóm tắt nội dung
2. **Cấu trúc**: Các sections và headings
3. **Formatting**: Sử dụng markdown syntax như thế nào
4. **Completeness**: Nội dung có đầy đủ không?
5. **Improvements**: Gợi ý cải thiện nội dung và formatting

Trả lời bằng tiếng Việt, hữu ích và chi tiết.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error analyzing Markdown with Gemini:', error);
    throw new Error('Không thể phân tích Markdown với AI');
  }
}
