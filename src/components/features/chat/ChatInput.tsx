import React, { useState, useRef } from 'react';
import { Mic, Paperclip, MicOff } from 'lucide-react';
import {
  processFile,
  FileContent,
  createFilePreviewMessage,
} from '../../../services/fileProcessor';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileAttach: (file: FileContent | null) => void;
  loading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onFileAttach,
  loading,
  disabled = false,
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [processingFile, setProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSend = async () => {
    if (inputMessage.trim() && !loading && !processingFile) {
      // Gửi tin nhắn
      await onSendMessage(inputMessage);
      setInputMessage('');
      // Xóa file đã chọn sau khi gửi
      setSelectedFile(null);
      onFileAttach(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: xuống dòng (default behavior)
        return;
      } else {
        // Enter: gửi tin nhắn
        e.preventDefault();
        handleSend();
      }
    }
  };

  // Xử lý upload file
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessingFile(true);
      try {
        const fileContent = await processFile(file);
        setSelectedFile(fileContent);
        // Thông báo file lên ChatScreen
        onFileAttach(fileContent);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(error instanceof Error ? error.message : 'Lỗi xử lý file');
      } finally {
        setProcessingFile(false);
        // Reset input để có thể chọn lại cùng file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Xử lý ghi âm
  const handleMicToggle = async () => {
    if (isRecording) {
      // Dừng ghi âm
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Bắt đầu ghi âm
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const audioChunks: Blob[] = [];
        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          // TODO: Xử lý audio blob - hiện tại chỉ log
          console.log('Audio recorded:', audioBlob);
          onSendMessage('🎤 Đã gửi tin nhắn thoại');

          // Dừng tất cả tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert(
          'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.',
        );
      }
    }
  };

  return (
    <div className="chatgpt-composer">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,document/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.css,.html,.json,.md,.py,.java,.cpp,.c,.php"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Processing indicator */}
      {processingFile && (
        <div className="file-processing">
          <div className="processing-spinner"></div>
          <span>Đang xử lý file...</span>
        </div>
      )}

      {/* Input container */}
      <div className="composer-input-container">
        <textarea
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder="Hỏi bất kỳ điều gì"
          className="chatgpt-input"
          disabled={loading || disabled || processingFile}
          onKeyDown={handleKeyPress}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
        />

        {/* Right side icons */}
        <div className="composer-right-icons">
          <button
            className="composer-icon-btn"
            title="Đính kèm tệp"
            onClick={handleFileUpload}
            disabled={loading || processingFile}
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <button
            className={`composer-icon-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
            onClick={handleMicToggle}
            disabled={loading || processingFile}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
