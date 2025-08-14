import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  UserLevel,
  calculateLevel,
  addXP,
  XPGain,
  XP_ACTIONS,
} from "../services/level/levelSystem";

interface UserStats {
  totalXP: number;
  level: number;
  pomodoroSessions: number;
  flashcardsStudied: number;
  chatMessages: number;
  totalHabitsCompleted: number;
  streakDays: number;
  studyTimeMinutes: number; // in minutes
  joinDate: Date;
}

interface LevelContextType {
  userLevel: UserLevel;
  userStats: UserStats;
  addUserXP: (
    action: keyof typeof XP_ACTIONS,
    customAmount?: number
  ) => Promise<void>;
  updateStats: (stats: Partial<UserStats>) => void;
  showLevelUpNotification: boolean;
  setShowLevelUpNotification: (show: boolean) => void;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);

interface LevelProviderProps {
  children: ReactNode;
  userId?: string;
}

export function LevelProvider({ children, userId }: LevelProviderProps) {
  const [userStats, setUserStats] = useState<UserStats>({
    totalXP: 0,
    level: 1,
    pomodoroSessions: 0,
    flashcardsStudied: 0,
    chatMessages: 0,
    totalHabitsCompleted: 0,
    streakDays: 0,
    studyTimeMinutes: 0,
    joinDate: new Date(),
  });

  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false);
  const userLevel = calculateLevel(userStats.totalXP);

  // Load user stats from localStorage or API
  useEffect(() => {
    if (userId) {
      loadUserStats(userId);
    } else {
      loadLocalStats();
    }
  }, [userId]);

  const loadUserStats = async (userId: string) => {
    try {
      // TODO: Load from Firebase/API
      const savedStats = localStorage.getItem(`userStats_${userId}`);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setUserStats({
          ...parsed,
          joinDate: new Date(parsed.joinDate),
        });
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  const loadLocalStats = () => {
    try {
      const savedStats = localStorage.getItem("userStats_local");
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setUserStats({
          ...parsed,
          joinDate: new Date(parsed.joinDate),
        });
      }
    } catch (error) {
      console.error("Failed to load local stats:", error);
    }
  };

  const saveUserStats = async (stats: UserStats) => {
    try {
      const key = userId ? `userStats_${userId}` : "userStats_local";
      localStorage.setItem(key, JSON.stringify(stats));
      // TODO: Save to Firebase/API if userId exists
    } catch (error) {
      console.error("Failed to save user stats:", error);
    }
  };

  const addUserXP = async (
    action: keyof typeof XP_ACTIONS,
    customAmount?: number
  ) => {
    const xpAmount = customAmount || XP_ACTIONS[action].amount;
    const result = addXP(userStats.totalXP, xpAmount);

    const newStats = {
      ...userStats,
      totalXP: result.newLevel.totalXP,
      level: result.newLevel.level,
    };

    setUserStats(newStats);
    await saveUserStats(newStats);

    // Show level up notification if leveled up
    if (result.levelUp) {
      setShowLevelUpNotification(true);

      // Auto hide after 5 seconds
      setTimeout(() => {
        setShowLevelUpNotification(false);
      }, 5000);
    }
  };

  const updateStats = async (newStats: Partial<UserStats>) => {
    const updatedStats = {
      ...userStats,
      ...newStats,
      // Always sync level with totalXP when updating
      level: newStats.totalXP
        ? calculateLevel(newStats.totalXP).level
        : userStats.level,
    };
    setUserStats(updatedStats);
    await saveUserStats(updatedStats);
  };

  return (
    <LevelContext.Provider
      value={{
        userLevel,
        userStats,
        addUserXP,
        updateStats,
        showLevelUpNotification,
        setShowLevelUpNotification,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
}

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (context === undefined) {
    throw new Error("useLevel must be used within a LevelProvider");
  }
  return context;
};
