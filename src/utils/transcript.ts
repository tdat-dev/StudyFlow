import { Message } from '../types/chat';

// Convert messages to Markdown format
export function toMarkdownTranscript(messages: Message[]): string {
  let transcript = '# Chat Transcript\n\n';

  messages.forEach((message, index) => {
    const timestamp = new Date(message.timestamp).toLocaleString('vi-VN');
    const sender = message.sender === 'user' ? 'Bạn' : 'AI Tutor';

    transcript += `## ${sender} - ${timestamp}\n\n`;
    transcript += `${message.content}\n\n`;

    if (index < messages.length - 1) {
      transcript += '---\n\n';
    }
  });

  return transcript;
}

// Convert messages to plain text format
export function toPlainTextTranscript(messages: Message[]): string {
  let transcript = 'CHAT TRANSCRIPT\n';
  transcript += '='.repeat(50) + '\n\n';

  messages.forEach((message, index) => {
    const timestamp = new Date(message.timestamp).toLocaleString('vi-VN');
    const sender = message.sender === 'user' ? 'Bạn' : 'AI Tutor';

    transcript += `${sender} (${timestamp}):\n`;
    transcript += `${message.content}\n\n`;

    if (index < messages.length - 1) {
      transcript += '-'.repeat(30) + '\n\n';
    }
  });

  return transcript;
}

// Copy transcript to clipboard
export async function copyTranscript(
  messages: Message[],
  format: 'markdown' | 'plain' = 'markdown',
): Promise<boolean> {
  try {
    const transcript =
      format === 'markdown'
        ? toMarkdownTranscript(messages)
        : toPlainTextTranscript(messages);

    await navigator.clipboard.writeText(transcript);
    return true;
  } catch (error) {
    console.error('Failed to copy transcript:', error);
    return false;
  }
}
