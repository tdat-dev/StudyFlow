import { useState, useEffect, useCallback } from 'react';
interface User {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  name?: string;
}
import {
  getUserProgress,
  updateTodayProgress,
  updateXP,
  updateDailyGoal,
  getWeeklyStats,
  UserProgress,
  WeeklyStats,
} from '../services/dashboard/userProgressService';
import {
  getDailyMissions,
  completeMission,
  completeMissionByType,
  DailyMissions,
  Mission,
} from '../services/dashboard/missionsService';
import {
  updateAchievementProgress,
  getUpcomingAchievements,
  Achievement,
} from '../services/dashboard/achievementsService';

export interface DashboardData {
  userProgress: UserProgress | null;
  dailyMissions: DailyMissions | null;
  upcomingAchievements: Achievement[];
  weeklyStats: WeeklyStats | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardActions {
  updateProgress: (
    wordsLearned: number,
    studyTimeMinutes?: number,
  ) => Promise<void>;
  completeMission: (missionId: string) => Promise<{ xpEarned: number }>;
  completeMissionByType: (
    type: Mission['type'],
  ) => Promise<{ xpEarned: number } | null>;
  updateDailyGoal: (newGoal: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useDashboardData(user: User): DashboardData & DashboardActions {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [dailyMissions, setDailyMissions] = useState<DailyMissions | null>(
    null,
  );
  const [upcomingAchievements, setUpcomingAchievements] = useState<
    Achievement[]
  >([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadDashboardData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const [progress, missions, achievements, stats] = await Promise.all([
        getUserProgress(user.uid),
        getDailyMissions(user.uid),
        getUpcomingAchievements(user.uid, 4),
        getWeeklyStats(user.uid),
      ]);

      setUserProgress(progress);
      setDailyMissions(missions);
      setUpcomingAchievements(achievements);
      setWeeklyStats(stats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data',
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Update progress
  const updateProgress = useCallback(
    async (wordsLearned: number, studyTimeMinutes: number = 0) => {
      if (!user?.uid) return;

      try {
        const updatedProgress = await updateTodayProgress(
          user.uid,
          wordsLearned,
          studyTimeMinutes,
        );
        setUserProgress(updatedProgress);

        // Update achievement progress
        const { unlockedAchievements, totalXPEarned } =
          await updateAchievementProgress(user.uid, 'words', wordsLearned);

        if (unlockedAchievements.length > 0) {
          // Add XP from achievements
          const finalProgress = await updateXP(user.uid, totalXPEarned);
          setUserProgress(finalProgress);

          // Refresh upcoming achievements
          const newUpcoming = await getUpcomingAchievements(user.uid, 4);
          setUpcomingAchievements(newUpcoming);
        }
      } catch (err) {
        console.error('Error updating progress:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to update progress',
        );
      }
    },
    [user?.uid],
  );

  // Complete mission
  const completeMissionAction = useCallback(
    async (missionId: string) => {
      if (!user?.uid) return { xpEarned: 0 };

      try {
        const { missions, xpEarned } = await completeMission(
          user.uid,
          missionId,
        );
        setDailyMissions(missions);

        // Update XP
        if (xpEarned > 0) {
          const updatedProgress = await updateXP(user.uid, xpEarned);
          setUserProgress(updatedProgress);

          // Update achievement progress
          const { unlockedAchievements, totalXPEarned } =
            await updateAchievementProgress(user.uid, 'missions', 1);

          if (unlockedAchievements.length > 0) {
            const finalProgress = await updateXP(user.uid, totalXPEarned);
            setUserProgress(finalProgress);

            const newUpcoming = await getUpcomingAchievements(user.uid, 4);
            setUpcomingAchievements(newUpcoming);
          }
        }

        return { xpEarned };
      } catch (err) {
        console.error('Error completing mission:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to complete mission',
        );
        return { xpEarned: 0 };
      }
    },
    [user?.uid],
  );

  // Complete mission by type
  const completeMissionByTypeAction = useCallback(
    async (type: Mission['type']) => {
      if (!user?.uid) return null;

      try {
        const result = await completeMissionByType(user.uid, type);
        if (result) {
          setDailyMissions(result.missions);

          // Update XP
          if (result.xpEarned > 0) {
            const updatedProgress = await updateXP(user.uid, result.xpEarned);
            setUserProgress(updatedProgress);

            // Update achievement progress
            const { unlockedAchievements, totalXPEarned } =
              await updateAchievementProgress(user.uid, 'missions', 1);

            if (unlockedAchievements.length > 0) {
              const finalProgress = await updateXP(user.uid, totalXPEarned);
              setUserProgress(finalProgress);

              const newUpcoming = await getUpcomingAchievements(user.uid, 4);
              setUpcomingAchievements(newUpcoming);
            }
          }
        }

        return result;
      } catch (err) {
        console.error('Error completing mission by type:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to complete mission',
        );
        return null;
      }
    },
    [user?.uid],
  );

  // Update daily goal
  const updateDailyGoalAction = useCallback(
    async (newGoal: number) => {
      if (!user?.uid) return;

      try {
        const updatedProgress = await updateDailyGoal(user.uid, newGoal);
        setUserProgress(updatedProgress);
      } catch (err) {
        console.error('Error updating daily goal:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to update daily goal',
        );
      }
    },
    [user?.uid],
  );

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    // Data
    userProgress,
    dailyMissions,
    upcomingAchievements,
    weeklyStats,
    loading,
    error,

    // Actions
    updateProgress,
    completeMission: completeMissionAction,
    completeMissionByType: completeMissionByTypeAction,
    updateDailyGoal: updateDailyGoalAction,
    refreshData,
  };
}

// Hook for quick actions
export function useQuickActions(user: User) {
  const { updateProgress, completeMissionByType } = useDashboardData(user);

  const handleQuickAction = useCallback(
    async (actionType: string, words: number) => {
      try {
        // Update progress
        await updateProgress(words, 5); // 5 minutes study time

        // Complete corresponding mission
        let missionType: Mission['type'] | null = null;

        switch (actionType) {
          case 'review':
            missionType = 'review';
            break;
          case 'quiz':
            missionType = 'quiz';
            break;
          case 'challenge':
            missionType = 'challenge';
            break;
          default:
            break;
        }

        if (missionType) {
          await completeMissionByType(missionType);
        }
      } catch (error) {
        console.error('Error in quick action:', error);
      }
    },
    [updateProgress, completeMissionByType],
  );

  return { handleQuickAction };
}

// Hook for CTA actions
export function useCTAActions(user: User) {
  const { updateProgress, completeMissionByType } = useDashboardData(user);

  const handleStartLearning = useCallback(async () => {
    try {
      await updateProgress(3, 10); // 3 words, 10 minutes
      await completeMissionByType('review');
    } catch (error) {
      console.error('Error in start learning:', error);
    }
  }, [updateProgress, completeMissionByType]);

  const handleTabChangeWithMission = useCallback(
    async (tab: string) => {
      try {
        switch (tab) {
          case 'pomodoro':
            await completeMissionByType('pomodoro');
            break;
          case 'habits':
            await completeMissionByType('habit');
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error in tab change with mission:', error);
      }
    },
    [completeMissionByType],
  );

  return { handleStartLearning, handleTabChangeWithMission };
}
