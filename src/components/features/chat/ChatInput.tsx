import React, { useState } from 'react';
import Button from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Loader2, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, loading, disabled = false }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim() && !loading) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-white border-t">
      <div className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Hỏi AI Tutor Agent..."
          className="flex-1 rounded-xl text-sm"
          disabled={loading || disabled}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!inputMessage.trim() || loading || disabled}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-shrink-0"
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}