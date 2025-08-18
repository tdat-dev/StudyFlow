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
 */
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => reject(new Error('Không thể đọc file text'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Đọc nội dung hình ảnh và chuyển thành base64
 */
async function readImageFile(
  file: File,
): Promise<{ content: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      resolve({
        content: `[Hình ảnh: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB`,
        preview: result,
      });
    };
    reader.onerror = () => reject(new Error('Không thể đọc file hình ảnh'));
    reader.readAsDataURL(file);
  });
}

/**
 * Xử lý file PDF (placeholder - cần thêm PDF.js)
 */
async function readPdfFile(file: File): Promise<string> {
  // TODO: Implement PDF reader with PDF.js
  return `[File PDF: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB
  
  Để đọc nội dung PDF, vui lòng cài đặt thêm thư viện PDF.js hoặc upload file dạng text.`;
}

/**
 * Xử lý file Word (placeholder - cần thêm mammoth.js)
 */
async function readWordFile(file: File): Promise<string> {
  // TODO: Implement Word reader with mammoth.js
  return `[File Word: ${file.name}] - Kích thước: ${(file.size / 1024).toFixed(1)}KB
  
  Để đọc nội dung Word, vui lòng cài đặt thêm thư viện mammoth.js hoặc copy-paste nội dung vào tin nhắn.`;
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
        /\.(txt|js|ts|jsx|tsx|css|html|xml|json|md|py|java|cpp|c|php)$/i,
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
    // Other files
    else {
      fileContent.content = `[File: ${file.name}] - Loại: ${file.type || 'Không xác định'} - Kích thước: ${(file.size / 1024).toFixed(1)}KB
      
      File này chưa được hỗ trợ đọc nội dung. Vui lòng sử dụng file text, hình ảnh, hoặc copy-paste nội dung.`;
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
  return '📁';
}
