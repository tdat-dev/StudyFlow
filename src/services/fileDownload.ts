/**
 * File Download Service
 * Xử lý việc tạo và download file từ AI responses
 */

export interface DownloadableFile {
  name: string;
  content: string;
  type: string;
  mimeType: string;
}

/**
 * Tạo file từ content và download
 */
export function downloadFile(file: DownloadableFile): void {
  try {
    let blob: Blob;

    if (
      file.mimeType.startsWith('text/') ||
      file.mimeType === 'application/json'
    ) {
      // Text files
      blob = new Blob([file.content], { type: file.mimeType });
    } else if (file.mimeType.startsWith('image/')) {
      // Image files (base64)
      const base64Data = file.content.replace(
        /^data:image\/[a-z]+;base64,/,
        '',
      );
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: file.mimeType });
    } else {
      // Default to text
      blob = new Blob([file.content], { type: 'text/plain' });
    }

    // Tạo URL và download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Không thể tải file xuống');
  }
}

/**
 * Tạo file từ AI response content
 */
export function createFileFromContent(
  content: string,
  fileName: string,
  fileType: string = 'txt',
): DownloadableFile {
  const mimeTypes: Record<string, string> = {
    txt: 'text/plain',
    js: 'text/javascript',
    ts: 'text/typescript',
    jsx: 'text/javascript',
    tsx: 'text/typescript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json',
    xml: 'application/xml',
    md: 'text/markdown',
    py: 'text/x-python',
    java: 'text/x-java-source',
    cpp: 'text/x-c++src',
    c: 'text/x-csrc',
    php: 'text/x-php',
    sql: 'text/x-sql',
    csv: 'text/csv',
    yaml: 'text/yaml',
    yml: 'text/yaml',
  };

  return {
    name: fileName,
    content,
    type: fileType,
    mimeType: mimeTypes[fileType] || 'text/plain',
  };
}

/**
 * Phân tích AI response để tìm code blocks và tạo file
 */
export function extractCodeBlocks(content: string): DownloadableFile[] {
  const files: DownloadableFile[] = [];

  // Regex để tìm code blocks với filename
  const codeBlockRegex = /```(\w+)?\s*([^\n]*)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'txt';
    const filename = match[2].trim() || `code.${language}`;
    const code = match[3].trim();

    if (code) {
      files.push(createFileFromContent(code, filename, language));
    }
  }

  return files;
}

/**
 * Tạo file từ AI response (có thể là code, text, hoặc data)
 */
export function createFilesFromAIResponse(
  content: string,
  baseFileName: string = 'ai_response',
): DownloadableFile[] {
  const files: DownloadableFile[] = [];

  // Thử extract code blocks trước
  const codeFiles = extractCodeBlocks(content);
  if (codeFiles.length > 0) {
    files.push(...codeFiles);
  } else {
    // Nếu không có code blocks, tạo file text
    files.push(createFileFromContent(content, `${baseFileName}.txt`));
  }

  return files;
}
