import { useState, useEffect, useCallback } from 'react';
import {
  IntegratedProgress,
  QuickActionResult,
  updateFlashcardProgress,
  updatePomodoroProgress,
  updateHabitProgress,
  getIntegratedProgress,
  resetWeeklyHabits,
} from '../services/dashboard/integrationService';

interface User {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  name?: string;
}

export interface DashboardIntegrationData {
  progress: IntegratedProgress | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardIntegrationActions {
  // Flashcard actions
  completeFlashcardSession: (
    wordsLearned: number,
    studyTimeMinutes?: number,
  ) => Promise<QuickActionResult>;

  // Pomodoro actions
  completePomodoroSession: (
    pomodorosCompleted?: number,
    focusTimeMinutes?: number,
  ) => Promise<QuickActionResult>;

  // Habit actions
  toggleHabitCompletion: (
    habitId: string,
    completed: boolean,
  ) => Promise<QuickActionResult>;

  // General actions
  refreshProgress: () => Promise<void>;
  resetWeeklyHabits: () => Promise<void>;
}

/**
 * Hook chính để tích hợp tất cả các tính năng trong dashboard
 */
export function useDashboardIntegration(
  user: User,
): DashboardIntegrationData & DashboardIntegrationActions {
  const [progress, setProgress] = useState<IntegratedProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load integrated progress
  const loadProgress = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Reset weekly habits nếu cần
      await resetWeeklyHabits(user.uid);

      // Load integrated progress
      const integratedProgress = await getIntegratedProgress(user.uid);
      setProgress(integratedProgress);
    } catch (err) {
      console.error('Error loading integrated progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Complete flashcard session
  const completeFlashcardSession = useCallback(
    async (
      wordsLearned: number,
      studyTimeMinutes: number = 0,
    ): Promise<QuickActionResult> => {
      if (!user?.uid) {
        return {
          success: false,
          xpEarned: 0,
          progressUpdated: false,
          message: 'User not authenticated',
        };
      }

      try {
        const result = await updateFlashcardProgress(
          user.uid,
          wordsLearned,
          studyTimeMinutes,
        );

        if (result.success) {
          // Refresh progress after successful update
          await loadProgress();
        }

        return result;
      } catch (err) {
        console.error('Error completing flashcard session:', err);
        return {
          success: false,
          xpEarned: 0,
          progressUpdated: false,
          message: 'Có lỗi khi hoàn thành phiên học flashcard',
        };
      }
    },
    [user?.uid, loadProgress],
  );

  // Complete pomodoro session
  const completePomodoroSession = useCallback(
    async (
      pomodorosCompleted: number = 1,
      focusTimeMinutes: number = 25,
    ): Promise<QuickActionResult> => {
      if (!user?.uid) {
        return {
          success: false,
          xpEarned: 0,
          progressUpdated: false,
          message: 'User not authenticated',
        };
      }

      try {
        const result = await updatePomodoroProgress(
          user.uid,
          pomodorosCompleted,
          focusTimeMinutes,
        );

        if (result.success) {
          // Refresh progress after successful update
          await loadProgress();
        }

        return result;
      } catch (err) {
        console.error('Error completing pomodoro session:', err);
        return {
          success: false,
          xpEarned: 0,
          progressUpdated: false,
          message: 'Có lỗi khi hoàn thành phiên Pomodoro',
        };
      }
    },
    [user?.uid, loadProgress],
  );

  // Toggle habit completion
  const toggleHabitCompletion = useCallback(
    async (habitId: string, completed: boolean): Promise<QuickActionResult> => {
      if (!user?.uid) {
        return {
          success: false,
          xpEarned: 0,
          progressUpdated: false,
          message: 'User not authenticated',
        };
      }

      try {
        const result = await updateHabitProgress(user.uid, habitId, completed);

        if (result.success) {
          // Refresh progress after successful update
          await loadProgress();
        }

        return result;
      } catch (err) {
        console.error('Error toggling habit completion:', err);
        return {
          success: false,
          xpEarned: 0,
          progressUpdated: false,
          message: 'Có lỗi khi cập nhật thói quen',
        };
      }
    },
    [user?.uid, loadProgress],
  );

  // Refresh progress
  const refreshProgress = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);

  // Reset weekly habits
  const resetWeeklyHabitsAction = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await resetWeeklyHabits(user.uid);
      await loadProgress();
    } catch (err) {
      console.error('Error resetting weekly habits:', err);
      setError('Có lỗi khi reset thói quen hàng tuần');
    }
  }, [user?.uid, loadProgress]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    // Data
    progress,
    loading,
    error,

    // Actions
    completeFlashcardSession,
    completePomodoroSession,
    toggleHabitCompletion,
    refreshProgress,
    resetWeeklyHabits: resetWeeklyHabitsAction,
  };
}

/**
 * Hook cho quick actions - các hoạt động nhanh
 */
export function useQuickActions(user: User) {
  const {
    completeFlashcardSession,
    completePomodoroSession,
    toggleHabitCompletion,
  } = useDashboardIntegration(user);

  const handleQuickFlashcardReview = useCallback(
    async (wordsCount: number = 5) => {
      return await completeFlashcardSession(wordsCount, 10); // 10 minutes study time
    },
    [completeFlashcardSession],
  );

  const handleQuickPomodoro = useCallback(
    async (sessions: number = 1) => {
      return await completePomodoroSession(sessions, sessions * 25); // 25 minutes per session
    },
    [completePomodoroSession],
  );

  const handleQuickHabitCheck = useCallback(
    async (habitId: string) => {
      return await toggleHabitCompletion(habitId, true);
    },
    [toggleHabitCompletion],
  );

  return {
    handleQuickFlashcardReview,
    handleQuickPomodoro,
    handleQuickHabitCheck,
  };
}

/**
 * Hook cho realtime updates - cập nhật realtime
 */
export function useRealtimeUpdates(user: User) {
  const { refreshProgress } = useDashboardIntegration(user);

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(
      () => {
        refreshProgress();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.uid, refreshProgress]);

  // Refresh when tab becomes visible
  useEffect(() => {
    if (!user?.uid) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.uid, refreshProgress]);
}
