import React, { useState } from 'react';
import { FileContent, processFile } from '../../../services/fileProcessor';
import { DownloadableFile, downloadFile } from '../../../services/fileDownload';

/**
 * Demo component để test file upload và download functionality
 * Component này có thể được sử dụng để test các tính năng file handling
 */
export function FileUploadDemo() {
  const [uploadedFile, setUploadedFile] = useState<FileContent | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setError(null);

    try {
      const fileContent = await processFile(file);
      setUploadedFile(fileContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xử lý file');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadDemo = () => {
    if (!uploadedFile) return;

    const demoContent = `Đây là nội dung demo được tạo từ file: ${uploadedFile.name}

Nội dung gốc:
${uploadedFile.content}

Thời gian tạo: ${new Date().toLocaleString('vi-VN')}`;

    const file: DownloadableFile = {
      name: `demo_${uploadedFile.name}`,
      content: demoContent,
      type: 'txt',
      mimeType: 'text/plain',
    };

    downloadFile(file);
  };

  const handleDownloadCodeDemo = () => {
    const codeContent = `// Demo code được tạo bởi AI
function processFile(file: File): Promise<FileContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content: e.target?.result as string
      });
    };
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsText(file);
  });
}

export { processFile };`;

    const file: DownloadableFile = {
      name: 'demo-code.ts',
      content: codeContent,
      type: 'ts',
      mimeType: 'text/typescript',
    };

    downloadFile(file);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">File Upload & Download Demo</h2>

      <div className="space-y-4">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={handleFileUpload}
            accept="image/*,document/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.css,.html,.json,.md,.py,.java,.cpp,.c,.php,.csv,.xlsx,.xls,.ppt,.pptx"
            className="mb-4"
            title="Chọn file để upload"
            aria-label="Chọn file để upload"
          />

          {processing && (
            <div className="text-blue-600">Đang xử lý file...</div>
          )}

          {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
          )}
        </div>

        {/* File Preview */}
        {uploadedFile && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">File đã upload:</h3>
            <div className="space-y-2">
              <p>
                <strong>Tên:</strong> {uploadedFile.name}
              </p>
              <p>
                <strong>Loại:</strong> {uploadedFile.type}
              </p>
              <p>
                <strong>Kích thước:</strong>{' '}
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
              <div className="mt-3">
                <p>
                  <strong>Nội dung (100 ký tự đầu):</strong>
                </p>
                <pre className="bg-white p-2 rounded text-sm overflow-auto max-h-32">
                  {uploadedFile.content.substring(0, 100)}...
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Download Demo */}
        <div className="space-y-2">
          <h3 className="font-semibold">Download Demo:</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadDemo}
              disabled={!uploadedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Download Demo File
            </button>
            <button
              onClick={handleDownloadCodeDemo}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download Code Demo
            </button>
          </div>
        </div>

        {/* Supported File Types */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Các loại file được hỗ trợ:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>Text & Code:</strong>
              <ul className="list-disc list-inside ml-2">
                <li>.txt, .md</li>
                <li>.js, .ts, .jsx, .tsx</li>
                <li>.css, .html</li>
                <li>.json, .xml</li>
                <li>.py, .java, .cpp, .c, .php</li>
                <li>.sql, .yaml, .yml</li>
              </ul>
            </div>
            <div>
              <strong>Documents & Media:</strong>
              <ul className="list-disc list-inside ml-2">
                <li>Hình ảnh (.jpg, .png, .gif, .svg)</li>
                <li>PDF (.pdf)</li>
                <li>Word (.doc, .docx)</li>
                <li>Excel (.xlsx, .xls, .csv)</li>
                <li>PowerPoint (.ppt, .pptx)</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Lưu ý:</strong> File nén (zip, rar, 7z) không được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FileUploadDemo;
