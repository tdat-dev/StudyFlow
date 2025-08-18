import { ElementType } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface User {
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
