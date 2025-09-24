/**
 * File Processing Service for AI Chat
 * Handles file upload and content extraction for AI processing
 */

export interface FileContent {
  name: string;
  type: string;
  size: number;
  content: string;
  preview?: string; // For images
}

/**
 * Đọc nội dung file text (txt, js, ts, css, html, etc.)
 * Tích hợp AI analysis cho code files
 */
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      const content = e.target?.result as string;

      try {
        // Phân tích với AI dựa trên loại file
        const analysis = await analyzeTextFileWithAI(content, file.name);

        resolve(`[File: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📄 **Nội dung file:**
\`\`\`${getFileLanguage(file.name)}
${content}
\`\`\`

🤖 **Phân tích AI:**
${analysis}`);
      } catch (error) {
        // Fallback nếu không thể phân tích với AI
        console.warn('Không thể phân tích file với AI:', error);
        resolve(`[File: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📄 **Nội dung file:**
\`\`\`${getFileLanguage(file.name)}
${content}
\`\`\`

💡 **File đã được upload thành công. Bạn có thể hỏi AI về nội dung này.**`);
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file text'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Phân tích file text với AI dựa trên loại file
 */
async function analyzeTextFileWithAI(
  content: string,
  fileName: string,
): Promise<string> {
  try {
    const {
      analyzeCodeWithGemini,
      analyzeHTMLWithGemini,
      analyzeJSONWithGemini,
      analyzeMarkdownWithGemini,
    } = await import('../services/ai/gemini');

    const language = getFileLanguage(fileName);

    // Phân tích dựa trên loại file
    if (
      ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php'].includes(
        language,
      )
    ) {
      return await analyzeCodeWithGemini(content, language);
    } else if (['html', 'css'].includes(language)) {
      return await analyzeHTMLWithGemini(content);
    } else if (language === 'json') {
      return await analyzeJSONWithGemini(content);
    } else if (language === 'md') {
      return await analyzeMarkdownWithGemini(content);
    } else {
      // Default analysis cho text files
      return `📝 **File text đã được đọc thành công.**
Nội dung: ${content.length > 200 ? content.substring(0, 200) + '...' : content}

💡 **Bạn có thể hỏi AI về nội dung cụ thể trong file này.**`;
    }
  } catch (error) {
    console.error('Error analyzing text file with AI:', error);
    throw error;
  }
}

/**
 * Lấy ngôn ngữ từ tên file
 */
function getFileLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'jsx',
    tsx: 'tsx',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    php: 'php',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
  };

  return languageMap[ext || ''] || 'text';
}

/**
 * Đọc nội dung hình ảnh và chuyển thành base64
 * Tích hợp với Gemini Vision API để phân tích nội dung hình ảnh
 */
async function readImageFile(
  file: File,
): Promise<{ content: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      const result = e.target?.result as string;

      try {
        // Gọi Gemini Vision API để phân tích hình ảnh
        const imageAnalysis = await analyzeImageWithGemini(result);

        resolve({
          content: `[Hình ảnh: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📸 **Phân tích hình ảnh:**
${imageAnalysis}

💡 **Lưu ý:** AI đã phân tích nội dung hình ảnh này. Bạn có thể hỏi thêm về chi tiết cụ thể.`,
          preview: result,
        });
      } catch (error) {
        // Nếu không thể phân tích với AI, fallback về cách cũ
        console.warn('Không thể phân tích hình ảnh với AI:', error);

        // Thử phân tích cơ bản với AI text-based
        try {
          const basicAnalysis = await analyzeImageBasic(file.name, file.size);
          resolve({
            content: `[Hình ảnh: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📸 **Thông tin hình ảnh:**
${basicAnalysis}

💡 **Lưu ý:** Bạn có thể mô tả hình ảnh này để AI hỗ trợ tốt hơn.`,
            preview: result,
          });
        } catch (fallbackError) {
          resolve({
            content: `[Hình ảnh: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📸 **Hình ảnh đã được upload thành công.**
Bạn có thể mô tả hình ảnh này hoặc hỏi AI về nội dung trong hình.`,
            preview: result,
          });
        }
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file hình ảnh'));
    reader.readAsDataURL(file);
  });
}

/**
 * Phân tích hình ảnh với Gemini Vision API
 */
async function analyzeImageWithGemini(imageDataUrl: string): Promise<string> {
  try {
    // Import Gemini service dynamically để tránh circular dependency
    const { generateImageAnalysis } = await import('../services/ai/gemini');

    // Extract base64 data từ data URL
    const base64Data = imageDataUrl.split(',')[1];

    const analysis = await generateImageAnalysis(base64Data);
    return analysis;
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw error;
  }
}

/**
 * Phân tích hình ảnh cơ bản với AI text-based
 */
async function analyzeImageBasic(
  fileName: string,
  fileSize: number,
): Promise<string> {
  try {
    const { analyzeMarkdownWithGemini } = await import('../services/ai/gemini');

    const metadata = `Hình ảnh: ${fileName}
Kích thước: ${(fileSize / 1024).toFixed(1)} KB
Loại: Image file

Đây là một hình ảnh đã được upload. AI có thể giúp:
- Hướng dẫn cách mô tả hình ảnh
- Gợi ý câu hỏi về hình ảnh
- Hỗ trợ phân tích nội dung khi được mô tả
- Đề xuất cách sử dụng hình ảnh trong học tập`;

    return await analyzeMarkdownWithGemini(metadata);
  } catch (error) {
    console.error('Error analyzing image basic:', error);
    return `📸 **Hình ảnh đã được nhận thành công.**

💡 **AI có thể giúp bạn:**
- Hướng dẫn cách mô tả hình ảnh
- Gợi ý câu hỏi về hình ảnh
- Hỗ trợ phân tích nội dung khi được mô tả

Hãy mô tả hình ảnh để AI có thể hỗ trợ tốt hơn.`;
  }
}

/**
 * Xử lý file PDF với PDF.js
 */
async function readPdfFile(file: File): Promise<string> {
  try {
    // Import PDF.js dynamically
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n--- Trang ${pageNum} ---\n${pageText}\n`;
    }

    // Analyze PDF content with AI
    const analysis = await analyzePDFWithAI(fullText, file.name);

    return `[File PDF: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB - ${pdf.numPages} trang

📄 **Nội dung PDF:**
${fullText.substring(0, 1000)}${fullText.length > 1000 ? '...' : ''}

🤖 **Phân tích AI:**
${analysis}`;
  } catch (error) {
    console.error('Error reading PDF:', error);
    return `[File PDF: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

❌ **Không thể đọc nội dung PDF tự động.**
Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}

💡 **Gợi ý:** Bạn có thể copy-paste nội dung từ PDF hoặc chuyển đổi sang file text để AI có thể phân tích.`;
  }
}

/**
 * Phân tích nội dung PDF với AI
 */
async function analyzePDFWithAI(
  content: string,
  fileName: string,
): Promise<string> {
  try {
    const { analyzeMarkdownWithGemini } = await import('../services/ai/gemini');

    const enhancedContent = `PDF Analysis for: ${fileName}

${content}

Đây là nội dung từ file PDF "${fileName}". AI có thể giúp:
- Tóm tắt nội dung chính
- Trích xuất thông tin quan trọng
- Phân tích và giải thích nội dung
- Trả lời câu hỏi về nội dung PDF`;

    return await analyzeMarkdownWithGemini(enhancedContent);
  } catch (error) {
    console.error('Error analyzing PDF with AI:', error);
    return `📄 **PDF "${fileName}" đã được đọc thành công.**
Nội dung: ${content.length > 200 ? content.substring(0, 200) + '...' : content}

💡 **Bạn có thể hỏi AI về nội dung cụ thể trong PDF này.**`;
  }
}

/**
 * Xử lý file Word với mammoth.js
 */
async function readWordFile(file: File): Promise<string> {
  try {
    // Import mammoth dynamically
    const mammoth = await import('mammoth');

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Convert Word to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });

    // Extract text content (remove HTML tags)
    const textContent = result.value
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Analyze Word content with AI
    const analysis = await analyzeWordWithAI(textContent, file.name);

    return `[File Word: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📝 **Nội dung Word:**
${textContent.substring(0, 1000)}${textContent.length > 1000 ? '...' : ''}

🤖 **Phân tích AI:**
${analysis}`;
  } catch (error) {
    console.error('Error reading Word file:', error);
    return `[File Word: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

❌ **Không thể đọc nội dung Word tự động.**
Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}

💡 **Gợi ý:** Bạn có thể copy-paste nội dung từ Word hoặc lưu file dưới dạng text để AI có thể phân tích.`;
  }
}

/**
 * Phân tích nội dung Word với AI
 */
async function analyzeWordWithAI(
  content: string,
  fileName: string,
): Promise<string> {
  try {
    const { analyzeMarkdownWithGemini } = await import('../services/ai/gemini');

    const enhancedContent = `Word Document Analysis for: ${fileName}

${content}

Đây là nội dung từ file Word "${fileName}". AI có thể giúp:
- Tóm tắt nội dung chính
- Phân tích cấu trúc document
- Đề xuất cải thiện nội dung
- Trả lời câu hỏi về nội dung document`;

    return await analyzeMarkdownWithGemini(enhancedContent);
  } catch (error) {
    console.error('Error analyzing Word with AI:', error);
    return `📝 **Word document "${fileName}" đã được đọc thành công.**
Nội dung: ${content.length > 200 ? content.substring(0, 200) + '...' : content}

💡 **Bạn có thể hỏi AI về nội dung cụ thể trong document này.**`;
  }
}

/**
 * Xử lý file Excel/CSV với SheetJS
 */
async function readExcelFile(file: File): Promise<string> {
  try {
    if (file.name.toLowerCase().endsWith('.csv')) {
      // Đọc file CSV như text file
      const content = await readTextFile(file);
      return content;
    } else {
      // Import SheetJS dynamically
      const XLSX = await import('xlsx');

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Parse Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      let excelContent = '';

      // Process each worksheet
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        excelContent += `\n--- Sheet: ${sheetName} ---\n`;

        // Convert to readable format
        jsonData.forEach((row: unknown, index: number) => {
          if (Array.isArray(row) && row.length > 0) {
            excelContent += `Row ${index + 1}: ${row.join(' | ')}\n`;
          }
        });
      });

      // Analyze Excel content with AI
      const analysis = await analyzeExcelWithAI(excelContent, file.name);

      return `[File Excel: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB - ${workbook.SheetNames.length} sheet(s)

📊 **Nội dung Excel:**
${excelContent.substring(0, 1000)}${excelContent.length > 1000 ? '...' : ''}

🤖 **Phân tích AI:**
${analysis}`;
    }
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return `[File Excel: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

❌ **Không thể đọc nội dung Excel tự động.**
Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}

💡 **Gợi ý:** Bạn có thể export file thành CSV hoặc copy-paste dữ liệu để AI có thể phân tích.`;
  }
}

/**
 * Phân tích nội dung Excel với AI
 */
async function analyzeExcelWithAI(
  content: string,
  fileName: string,
): Promise<string> {
  try {
    const { analyzeJSONWithGemini } = await import('../services/ai/gemini');

    const enhancedContent = `Excel Data Analysis for: ${fileName}

${content}

Đây là dữ liệu từ file Excel "${fileName}". AI có thể giúp:
- Phân tích dữ liệu và xu hướng
- Tạo báo cáo và thống kê
- Đề xuất biểu đồ phù hợp
- Trả lời câu hỏi về dữ liệu`;

    return await analyzeJSONWithGemini(enhancedContent);
  } catch (error) {
    console.error('Error analyzing Excel with AI:', error);
    return `📊 **Excel file "${fileName}" đã được đọc thành công.**
Nội dung: ${content.length > 200 ? content.substring(0, 200) + '...' : content}

💡 **Bạn có thể hỏi AI về dữ liệu cụ thể trong Excel này.**`;
  }
}

/**
 * Xử lý file PowerPoint
 */
async function readPowerPointFile(file: File): Promise<string> {
  try {
    // PowerPoint files are complex binary format, chúng ta sẽ phân tích metadata
    const analysis = await analyzePowerPointWithAI(file.name, file.size);

    return `[File PowerPoint: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📊 **Thông tin file PowerPoint:**
- Tên file: ${file.name}
- Kích thước: ${(file.size / 1024).toFixed(1)} KB
- Loại file: Microsoft PowerPoint Presentation

🤖 **Phân tích AI:**
${analysis}

💡 **Lưu ý:** Để AI có thể phân tích nội dung chi tiết, bạn có thể:
1. Copy-paste nội dung từ slides
2. Export thành PDF và upload lại
3. Mô tả nội dung slides cho AI`;
  } catch (error) {
    console.error('Error analyzing PowerPoint file:', error);
    return `[File PowerPoint: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📊 **File PowerPoint đã được nhận thành công.**
Hiện tại chưa hỗ trợ đọc nội dung PowerPoint tự động.

💡 **Gợi ý:** Bạn có thể copy-paste nội dung từ slides hoặc export thành file text để AI có thể phân tích.`;
  }
}

/**
 * Phân tích file PowerPoint với AI
 */
async function analyzePowerPointWithAI(
  fileName: string,
  fileSize: number,
): Promise<string> {
  try {
    const { analyzeMarkdownWithGemini } = await import('../services/ai/gemini');

    const metadata = `File PowerPoint: ${fileName}
Kích thước: ${(fileSize / 1024).toFixed(1)} KB
Loại: Microsoft PowerPoint Presentation

Đây là một file PowerPoint. Để phân tích nội dung chi tiết, người dùng cần:
1. Mô tả nội dung slides
2. Copy-paste text từ slides
3. Export thành PDF để AI có thể đọc

AI có thể giúp:
- Tạo outline cho presentation
- Viết script cho slides
- Đề xuất cải thiện nội dung
- Tạo slide mới dựa trên yêu cầu`;

    return await analyzeMarkdownWithGemini(metadata);
  } catch (error) {
    console.error('Error analyzing PowerPoint with AI:', error);
    return `📊 **File PowerPoint đã được nhận thành công.**

💡 **AI có thể giúp bạn:**
- Tạo outline cho presentation
- Viết script cho slides  
- Đề xuất cải thiện nội dung
- Tạo slide mới dựa trên yêu cầu

Hãy mô tả nội dung slides hoặc yêu cầu cụ thể để AI hỗ trợ tốt hơn.`;
  }
}

/**
 * Phân tích file không xác định với AI
 */
async function analyzeUnknownFileWithAI(file: File): Promise<string> {
  try {
    const { analyzeMarkdownWithGemini } = await import('../services/ai/gemini');

    const metadata = `File: ${file.name}
Loại: ${file.type || 'Không xác định'}
Kích thước: ${(file.size / 1024).toFixed(1)} KB
Extension: ${file.name.split('.').pop()?.toLowerCase() || 'không có'}

Đây là một file không được hỗ trợ đọc nội dung tự động. AI có thể giúp:
1. Đề xuất cách xử lý file này
2. Gợi ý công cụ phù hợp để mở file
3. Hướng dẫn chuyển đổi sang format được hỗ trợ
4. Phân tích metadata và đưa ra lời khuyên`;

    return await analyzeMarkdownWithGemini(metadata);
  } catch (error) {
    console.error('Error analyzing unknown file with AI:', error);
    return `📁 **File không được hỗ trợ đọc tự động.**

💡 **AI có thể giúp bạn:**
- Đề xuất cách xử lý file này
- Gợi ý công cụ phù hợp để mở file
- Hướng dẫn chuyển đổi sang format được hỗ trợ

Hãy mô tả file hoặc yêu cầu cụ thể để AI hỗ trợ tốt hơn.`;
  }
}

/**
 * Phát hiện loại file và xử lý phù hợp
 */
export async function processFile(file: File): Promise<FileContent> {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    throw new Error('File quá lớn (tối đa 10MB)');
  }

  const fileContent: FileContent = {
    name: file.name,
    type: file.type,
    size: file.size,
    content: '',
  };

  try {
    // Text files
    if (
      file.type.startsWith('text/') ||
      file.name.match(
        /\.(txt|js|ts|jsx|tsx|css|html|xml|json|md|py|java|cpp|c|php|sql|yaml|yml|ini|conf|log)$/i,
      )
    ) {
      fileContent.content = await readTextFile(file);
    }
    // Image files
    else if (file.type.startsWith('image/')) {
      const { content, preview } = await readImageFile(file);
      fileContent.content = content;
      fileContent.preview = preview;
    }
    // PDF files
    else if (file.type === 'application/pdf') {
      fileContent.content = await readPdfFile(file);
    }
    // Word files
    else if (file.type.includes('word') || file.name.match(/\.(doc|docx)$/i)) {
      fileContent.content = await readWordFile(file);
    }
    // Excel/CSV files
    else if (
      file.type.includes('spreadsheet') ||
      file.type.includes('excel') ||
      file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      fileContent.content = await readExcelFile(file);
    }
    // PowerPoint files
    else if (
      file.type.includes('presentation') ||
      file.name.match(/\.(ppt|pptx)$/i)
    ) {
      fileContent.content = await readPowerPointFile(file);
    }
    // Archive files (zip, rar, etc.) - không hỗ trợ
    else if (
      file.type.includes('zip') ||
      file.type.includes('rar') ||
      file.type.includes('7z') ||
      file.name.match(/\.(zip|rar|7z|tar|gz)$/i)
    ) {
      throw new Error(
        'File nén (zip, rar, 7z) không được hỗ trợ. Vui lòng giải nén và gửi file riêng lẻ.',
      );
    }
    // Other files
    else {
      // Thử phân tích với AI dựa trên metadata
      try {
        const analysis = await analyzeUnknownFileWithAI(file);
        fileContent.content = `[File: ${file.name}] - Loại: ${file.type || 'Không xác định'} - Kích thước: ${(file.size / 1024).toFixed(1)}KB

📁 **Thông tin file:**
- Tên: ${file.name}
- Loại: ${file.type || 'Không xác định'}
- Kích thước: ${(file.size / 1024).toFixed(1)} KB

🤖 **Phân tích AI:**
${analysis}

💡 **Gợi ý:** Các loại file được hỗ trợ đầy đủ: text, code, hình ảnh, PDF, Word, Excel, PowerPoint.
Bạn có thể copy-paste nội dung vào tin nhắn để AI phân tích chi tiết hơn.`;
      } catch (error) {
        fileContent.content = `[File: ${file.name}] - Loại: ${file.type || 'Không xác định'} - Kích thước: ${(file.size / 1024).toFixed(1)}KB
      
      File này chưa được hỗ trợ đọc nội dung tự động. 
      Các loại file được hỗ trợ: text, code, hình ảnh, PDF, Word, Excel, PowerPoint.
      Bạn có thể copy-paste nội dung vào tin nhắn để AI phân tích.`;
      }
    }

    return fileContent;
  } catch (error) {
    throw new Error(
      `Lỗi xử lý file: ${error instanceof Error ? error.message : 'Không xác định'}`,
    );
  }
}

/**
 * Format file content cho AI prompt
 */
export function formatFileForAI(
  fileContent: FileContent,
  userMessage: string,
): string {
  const separator = '\n' + '='.repeat(50) + '\n';

  let prompt = `Người dùng đã gửi một file kèm tin nhắn. Hãy phân tích nội dung file và trả lời theo yêu cầu.

📁 **Thông tin file:**
- Tên: ${fileContent.name}
- Loại: ${fileContent.type}
- Kích thước: ${(fileContent.size / 1024).toFixed(1)}KB

💬 **Tin nhắn từ người dùng:**
${userMessage}

${separator}
📄 **Nội dung file:**
${fileContent.content}
${separator}

Hãy phân tích file và trả lời câu hỏi của người dùng một cách chi tiết và hữu ích.`;

  return prompt;
}

/**
 * Tạo preview message cho UI
 */
export function createFilePreviewMessage(
  fileContent: FileContent,
  userMessage: string,
): string {
  const fileEmoji = getFileEmoji(fileContent.type, fileContent.name);

  let message = `${fileEmoji} **${fileContent.name}** (${(fileContent.size / 1024).toFixed(1)}KB)`;

  if (userMessage.trim()) {
    message += `\n\n${userMessage}`;
  }

  return message;
}

/**
 * Lấy emoji phù hợp cho loại file
 */
function getFileEmoji(type: string, name: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || name.match(/\.(doc|docx)$/i)) return '📝';
  if (type.startsWith('text/') || name.match(/\.(txt|md)$/i)) return '📃';
  if (name.match(/\.(js|ts|jsx|tsx|css|html)$/i)) return '💻';
  if (name.match(/\.(json|xml)$/i)) return '📊';
  if (name.match(/\.(xlsx|xls|csv)$/i)) return '📊';
  if (name.match(/\.(ppt|pptx)$/i)) return '📊';
  if (name.match(/\.(py|java|cpp|c|php|sql)$/i)) return '💻';
  if (name.match(/\.(zip|rar|7z|tar|gz)$/i)) return '🗜️';
  return '📁';
}
