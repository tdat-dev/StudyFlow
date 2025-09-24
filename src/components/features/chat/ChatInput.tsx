import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MicOff, Send, Upload, X, FileText, Image, File } from 'lucide-react';
import { processFile, FileContent } from '../../../services/fileProcessor';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileAttach: (file: FileContent | null) => void;
  loading: boolean;
  disabled?: boolean;
  attachedFile?: FileContent | null;
}

export function ChatInput({
  onSendMessage,
  onFileAttach,
  loading,
  attachedFile,
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 36), 200);
      textarea.style.height = newHeight + 'px';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    autoResize();
  };

  useEffect(() => {
    autoResize();
  }, [inputMessage]);

  const handleSend = async () => {
    if (inputMessage.trim() && !loading && !processingFile) {
      await onSendMessage(inputMessage);
      setInputMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '36px';
      }
      onFileAttach(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndAttachFile(file);
    }
  };

  const processAndAttachFile = async (file: File) => {
    setProcessingFile(true);
    try {
      const fileContent = await processFile(file);
      onFileAttach(fileContent);
    } catch (error) {
      console.error('Error processing file:', error);
      alert(error instanceof Error ? error.message : 'Lỗi xử lý file');
    } finally {
      setProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Chỉ xử lý file đầu tiên
      const file = files[0];
      await processAndAttachFile(file);
    }
  }, []);

  const removeAttachedFile = () => {
    onFileAttach(null);
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
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
          console.log('Audio recorded:', audioBlob);
          onSendMessage(' Đã gửi tin nhắn thoại');
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
    <div className="w-full">
      <form
        ref={dropZoneRef}
        className="group/composer w-full"
        data-type="unified-composer"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,document/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.css,.html,.json,.md,.py,.java,.cpp,.c,.php,.csv,.xlsx,.xls,.ppt,.pptx"
          onChange={handleFileChange}
          className="hidden"
          multiple
          tabIndex={-1}
          aria-label="Chọn file để đính kèm"
        />

        {processingFile && (
          <div className="absolute -top-12 left-0 right-0 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Đang xử lý file...
              </span>
            </div>
          </div>
        )}

        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-[24px] flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-400 font-medium">Thả file vào đây để đính kèm</p>
            </div>
          </div>
        )}

        {/* File Preview */}
        {attachedFile && (
          <div className="mb-3 p-3 bg-neutral-700/50 rounded-lg border border-neutral-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {attachedFile.type.startsWith('image/') ? (
                  <Image className="w-5 h-5 text-green-400" />
                ) : attachedFile.type.includes('pdf') ? (
                  <FileText className="w-5 h-5 text-red-400" />
                ) : (
                  <File className="w-5 h-5 text-blue-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">{attachedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeAttachedFile}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                title="Xóa file đính kèm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className={`bg-neutral-800/90 backdrop-blur-sm rounded-[24px] px-4 py-3 flex items-center gap-3 shadow-lg border border-neutral-700/50 ${isDragOver ? 'border-blue-400' : ''}`}>
        <div className="flex-shrink-0">
          <button
            type="button"
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={handleFileUpload}
            disabled={loading || processingFile}
            title="Đính kèm file"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white/70"
            >
              <path
                d="M12 4V20M20 12H4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex items-center min-h-[32px]">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Hỏi bất kỳ điều gì..."
            className="w-full bg-transparent textarea-borderless resize-none text-white placeholder-white/70 min-h-[28px] leading-normal text-base placeholder:text-base overflow-hidden py-2 px-2"
            disabled={loading || processingFile}
            onKeyDown={handleKeyPress}
            rows={1}
            name="prompt-textarea"
            data-virtualkeyboard="true"
            dir="ltr"
          />
        </div>

        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-600 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Ghi âm"
            onClick={handleMicToggle}
            disabled={loading || processingFile}
            title={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-current"
              >
                <path
                  d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                  fill="currentColor"
                />
                <path
                  d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <button
            type="submit"
            disabled={!inputMessage.trim() || loading || processingFile}
            className={`p-1.5 rounded-lg transition-all ${
              inputMessage.trim() && !loading && !processingFile
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            aria-label="Gửi tin nhắn"
            title="Gửi tin nhắn (Enter)"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
