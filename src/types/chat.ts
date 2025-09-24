import { ElementType } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // Base64 hoặc text content
  downloadUrl?: string; // URL để download file
}

export interface ChatSession {
  id: string;
  title: string;
  userId?: string; // Make optional to avoid compilation issues
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  accessToken?: string;
  photoURL?: string;
}

export interface QuickAction {
  id: number;
  label: string;
  prompt: string;
  icon: ElementType;
  color: string;
  bgColor: string;
  category?: 'math' | 'language' | 'science' | 'general';
}
