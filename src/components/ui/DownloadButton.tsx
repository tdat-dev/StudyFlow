import React, { useState } from 'react';
import { Download, FileText, Code, File } from 'lucide-react';
import {
  DownloadableFile,
  downloadFile,
  createFilesFromAIResponse,
} from '../../services/fileDownload';

interface DownloadButtonProps {
  content: string;
  messageId: string;
  className?: string;
}

export function DownloadButton({
  content,
  messageId,
  className = '',
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const files = createFilesFromAIResponse(
        content,
        `ai_response_${messageId}`,
      );

      if (files.length === 1) {
        // Nếu chỉ có 1 file, download trực tiếp
        downloadFile(files[0]);
      } else if (files.length > 1) {
        // Nếu có nhiều file, hiển thị menu để chọn
        setShowFiles(!showFiles);
      }
    } catch (error) {
      console.error('Error downloading files:', error);
      alert('Không thể tải file xuống');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadFile = (file: DownloadableFile) => {
    try {
      downloadFile(file);
      setShowFiles(false);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Không thể tải file xuống');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'txt' || fileType === 'md')
      return <FileText className="w-4 h-4" />;
    if (
      ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php'].includes(
        fileType,
      )
    ) {
      return <Code className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const files = createFilesFromAIResponse(content, `ai_response_${messageId}`);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Tải file xuống"
      >
        {isDownloading ? (
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-3 h-3" />
        )}
        <span>Tải xuống</span>
      </button>

      {showFiles && files.length > 1 && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10 min-w-[200px]">
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            Chọn file để tải xuống:
          </div>
          {files.map((file, index) => (
            <button
              key={index}
              onClick={() => handleDownloadFile(file)}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {getFileIcon(file.type)}
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DownloadButton;
