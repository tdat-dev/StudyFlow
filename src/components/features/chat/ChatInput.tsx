import React, { useState, useRef, useEffect } from 'react';
import { Mic, Paperclip, MicOff, Send } from 'lucide-react';
import { processFile, FileContent } from '../../../services/fileProcessor';

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
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const proseMirrorRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-resize contentEditable
  const autoResize = () => {
    const proseMirror = proseMirrorRef.current;
    if (proseMirror) {
      proseMirror.style.height = 'auto';
      const newHeight = Math.min(Math.max(proseMirror.scrollHeight, 44), 200); // Min 44px, max 200px
      proseMirror.style.height = newHeight + 'px';
    }
  };

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    autoResize();
  };

  const handleSend = async () => {
    if (inputMessage.trim() && !loading && !processingFile) {
      // Gửi tin nhắn
      await onSendMessage(inputMessage);
      setInputMessage('');

      // Reset contentEditable height and content
      if (proseMirrorRef.current) {
        proseMirrorRef.current.style.height = '44px';
        proseMirrorRef.current.innerHTML =
          '<p data-placeholder="Hỏi bất kỳ điều gì..." class="placeholder"><br class="ProseMirror-trailingBreak"></p>';
      }

      // Xóa file đã chọn sau khi gửi
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
      console.log('📎 File được chọn:', file.name, file.type);
      setProcessingFile(true);
      try {
        const fileContent = await processFile(file);
        console.log('✅ File processed thành công:', fileContent);
        // Thông báo file lên ChatScreen
        onFileAttach(fileContent);
        console.log('📡 Đã gọi onFileAttach với:', fileContent);
      } catch (error) {
        console.error('❌ Error processing file:', error);
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
    <form className="group/composer w-full" data-type="unified-composer">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,document/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.css,.html,.json,.md,.py,.java,.cpp,.c,.php"
        onChange={handleFileChange}
        className="hidden"
        multiple
        tabIndex={-1}
      />

      {/* Processing indicator */}
      {processingFile && (
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Đang xử lý file...
            </span>
          </div>
        </div>
      )}

      {/* Main composer container */}
      <div className="bg-neutral-800/90 cursor-text overflow-clip bg-clip-padding p-2.5 contain-inline-size shadow-short rounded-[28px] grid grid-cols-[auto_1fr_auto] [grid-template-areas:'header_header_header'_'leading_primary_trailing'_'._footer_.'] group-data-expanded/composer:[grid-template-areas:'header_header_header'_'primary_primary_primary'_'leading_footer_trailing']">
        {/* Primary text area */}
        <div className="-my-2.5 flex min-h-14 items-center overflow-x-hidden px-1.5 [grid-area:primary] group-data-expanded/composer:mb-0 group-data-expanded/composer:px-2.5">
          <div className="_prosemirror-parent_ebv8s_2 text-token-text-primary max-h-[max(35svh,5rem)] max-h-52 flex-1 overflow-auto [scrollbar-width:thin] default-browser vertical-scroll-fade-mask">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Hỏi bất kỳ điều gì..."
              className="_fallbackTextarea_ebv8s_2 w-full bg-transparent outline-none border-none focus:ring-0 focus:border-none resize-none text-white placeholder-white/60 min-h-[44px] block"
              disabled={loading || processingFile}
              onKeyDown={handleKeyPress}
              rows={1}
              name="prompt-textarea"
              data-virtualkeyboard="true"
              style={{ display: 'none' }}
            />
            <div
              ref={proseMirrorRef}
              contentEditable={true}
              translate="no"
              className="ProseMirror"
              id="prompt-textarea"
              data-virtualkeyboard="true"
              suppressContentEditableWarning={true}
              onInput={e => {
                const text = e.currentTarget.textContent || '';
                setInputMessage(text);
                autoResize();
              }}
              onKeyDown={handleKeyPress}
              style={{
                minHeight: '44px',
                maxHeight: '200px',
                overflow: 'hidden',
                resize: 'none',
                outline: 'none',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--text-base--line-height)',
                fontFamily:
                  'ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol',
                cursor: 'text',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--scrollbar-color) transparent',
                mask: 'linear-gradient(to bottom in oklch,oklch(.6 0 0/0),oklch(.85 0 0/1)var(--top-fade)calc(100% - var(--bottom-fade)),oklch(.6 0 0/0))',
                animationTimeline: '--scroll-fade',
                animationFillMode: 'both',
                animationName: 'edge-fade',
                animationTimingFunction: 'linear',
              }}
              dangerouslySetInnerHTML={{
                __html: inputMessage
                  ? `<p>${inputMessage}</p>`
                  : '<p data-placeholder="Hỏi bất kỳ điều gì..." class="placeholder"><br class="ProseMirror-trailingBreak"></p>',
              }}
            />
          </div>
        </div>

        {/* Leading area - Plus button */}
        <div className="[grid-area:leading]">
          <span className="flex" data-state="closed">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded="false"
              data-state="closed"
              className="composer-btn p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              data-testid="composer-plus-btn"
              onClick={handleFileUpload}
              disabled={loading || processingFile}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
              >
                <path d="M9.33496 16.5V10.665H3.5C3.13273 10.665 2.83496 10.3673 2.83496 10C2.83496 9.63273 3.13273 9.33496 3.5 9.33496H9.33496V3.5C9.33496 3.13273 9.63273 2.83496 10 2.83496C10.3673 2.83496 10.665 3.13273 10.665 3.5V9.33496H16.5L16.6338 9.34863C16.9369 9.41057 17.165 9.67857 17.165 10C17.165 10.3214 16.9369 10.5894 16.6338 10.6514L16.5 10.665H10.665V16.5C10.665 16.8673 10.3673 17.165 10 17.165C9.63273 17.165 9.33496 16.8673 9.33496 16.5Z"></path>
              </svg>
            </button>
          </span>
        </div>

        {/* Trailing area - Action buttons */}
        <div className="flex items-center gap-2 [grid-area:trailing]">
          <div className="ms-auto flex items-center gap-1.5">
            {/* Voice recording button */}
            <span className="" data-state="closed">
              <button
                aria-label="Nút chép chính tả"
                type="button"
                className={`composer-btn p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
                  isRecording ? 'recording' : ''
                }`}
                onClick={handleMicToggle}
                disabled={loading || processingFile}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label=""
                    className="icon"
                    fontSize="inherit"
                  >
                    <path d="M15.7806 10.1963C16.1326 10.3011 16.3336 10.6714 16.2288 11.0234L16.1487 11.2725C15.3429 13.6262 13.2236 15.3697 10.6644 15.6299L10.6653 16.835H12.0833L12.2171 16.8486C12.5202 16.9106 12.7484 17.1786 12.7484 17.5C12.7484 17.8214 12.5202 18.0894 12.2171 18.1514L12.0833 18.165H7.91632C7.5492 18.1649 7.25128 17.8672 7.25128 17.5C7.25128 17.1328 7.5492 16.8351 7.91632 16.835H9.33527L9.33429 15.6299C6.775 15.3697 4.6558 13.6262 3.84992 11.2725L3.76984 11.0234L3.74445 10.8906C3.71751 10.5825 3.91011 10.2879 4.21808 10.1963C4.52615 10.1047 4.84769 10.2466 4.99347 10.5195L5.04523 10.6436L5.10871 10.8418C5.8047 12.8745 7.73211 14.335 9.99933 14.335C12.3396 14.3349 14.3179 12.7789 14.9534 10.6436L15.0052 10.5195C15.151 10.2466 15.4725 10.1046 15.7806 10.1963ZM12.2513 5.41699C12.2513 4.17354 11.2437 3.16521 10.0003 3.16504C8.75675 3.16504 7.74835 4.17343 7.74835 5.41699V9.16699C7.74853 10.4104 8.75685 11.418 10.0003 11.418C11.2436 11.4178 12.2511 10.4103 12.2513 9.16699V5.41699ZM13.5814 9.16699C13.5812 11.1448 11.9781 12.7479 10.0003 12.748C8.02232 12.748 6.41845 11.1449 6.41828 9.16699V5.41699C6.41828 3.43889 8.02221 1.83496 10.0003 1.83496C11.9783 1.83514 13.5814 3.439 13.5814 5.41699V9.16699Z"></path>
                  </svg>
                )}
              </button>
            </span>

            {/* Send button */}
            <div
              className="min-w-9"
              data-testid="composer-speech-button-container"
            >
              <span className="" data-state="closed">
                <button
                  data-testid="composer-speech-button"
                  aria-label="Khởi động chế độ thoại"
                  className="relative flex h-9 items-center justify-center rounded-full disabled:text-gray-50 disabled:opacity-30 w-9 bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSend}
                  disabled={loading || processingFile || !inputMessage.trim()}
                  title="Gửi tin nhắn"
                >
                  <div className="flex items-center justify-center">
                    <Send className="h-5 w-5" />
                  </div>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
