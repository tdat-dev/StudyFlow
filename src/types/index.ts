// Định nghĩa các kiểu dữ liệu dùng chung trong ứng dụng

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface Session {
  user: FirebaseUser;
  access_token: string;
}

export interface SessionResult {
  data: {
    session: Session | null;
  };
  error: Error | null;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  accessToken: string;
  streak: number;
  todayProgress: number;
  dailyGoal: number;
  totalWordsLearned: number;
  photoURL?: string;
}

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface QuickAction {
  id: number;
  label: string;
  prompt: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  example?: string;
  learned: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  color: string;
  cards: Flashcard[];
  total: number;
  learned: number;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  currentStreak: number;
  todayCompleted: boolean;
  weeklyProgress: boolean[];
  monthlyProgress: boolean[];
}
