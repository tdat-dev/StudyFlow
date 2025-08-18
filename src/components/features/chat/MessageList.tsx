import React from 'react';
import { Message as MessageType } from '../../../types/chat';
import { Message } from './Message';

interface MessageListProps {
  messages: MessageType[];
}

// Helper function to determine if messages should be grouped
function shouldGroupMessages(
  current: MessageType,
  previous: MessageType | undefined,
): boolean {
  if (!previous) return false;

  // Group if same sender and within 5 minutes
  const currentTime = new Date(current.timestamp).getTime();
  const prevTime = new Date(previous.timestamp).getTime();
  const timeDiff = currentTime - prevTime;
  const fiveMinutes = 5 * 60 * 1000;

  return current.sender === previous.sender && timeDiff <= fiveMinutes;
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="content-column">
      <div className="space-y-0">
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : undefined;
          const nextMessage =
            index < messages.length - 1 ? messages[index + 1] : undefined;

          const groupedWithPrev = shouldGroupMessages(message, previousMessage);
          const groupedWithNext = nextMessage
            ? shouldGroupMessages(nextMessage, message)
            : false;

          return (
            <Message
              key={message.id}
              message={message}
              groupedWithPrev={groupedWithPrev}
              groupedWithNext={groupedWithNext}
            />
          );
        })}
      </div>
    </div>
  );
}
