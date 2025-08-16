export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  accessToken?: string;
  name?: string;
  streak?: number;
  level?: number;
  totalWordsLearned?: number;
  totalStudyTime?: number;
  todayProgress?: number;
  dailyGoal?: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  streak: number;
  level: number;
  totalWordsLearned: number;
  totalStudyTime: number;
  todayProgress: number;
  dailyGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export interface TabChangeHandler {
  (tab: string): void;
}
