import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/chat';
import { Book, Headphones } from 'lucide-react';
import type { ElementType } from 'react';

// Define Habit type locally
interface Habit {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  color: string;
  bgColor: string;
  textColor: string;
  currentStreak: number;
  todayCompleted: boolean;
  weeklyProgress: boolean[];
  monthlyProgress: boolean[];
  userId?: string;
  type?: string;
}

// Mock Firebase functions
const getHabits = async (_token: string): Promise<Habit[]> => {
  return [];
};

const createHabit = async (
  _token: string,
  _habit: Partial<Habit>,
): Promise<string> => {
  return 'mock-habit-id';
};

const deleteHabit = async (_habitId: string): Promise<void> => {
  return;
};

const updateHabit = async (
  _habitId: string,
  _data: Partial<Habit>,
): Promise<void> => {
  return;
};

export function useHabits(user: User) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Định nghĩa hàm loadMockHabits
  const loadMockHabits = () => {
    const mockHabits: Habit[] = [
      {
        id: 'local-1',
        title: 'Học từ vựng mỗi ngày',
        description: 'Học 10 từ mới mỗi ngày',
        icon: Book,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-900',
        currentStreak: 3,
        todayCompleted: false,
        weeklyProgress: [true, true, true, false, false, false, false],
        monthlyProgress: Array(30)
          .fill(false)
          .map((_, i) => (i < 15 ? Math.random() > 0.5 : false)),
      },
      {
        id: 'local-2',
        title: 'Luyện nghe mỗi ngày',
        description: 'Nghe 15 phút tiếng Anh mỗi ngày',
        icon: Headphones,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-900',
        currentStreak: 5,
        todayCompleted: true,
        weeklyProgress: [true, true, true, true, true, false, false],
        monthlyProgress: Array(30)
          .fill(false)
          .map((_, i) => (i < 20 ? Math.random() > 0.3 : false)),
      },
    ];

    setHabits(mockHabits);
  };

  // Định nghĩa hàm updateLocalHabitState
  const updateLocalHabitState = (habitId: string, completed: boolean) => {
    // Get current day of week (0 = Sunday, 6 = Saturday)
    const today = new Date().getDay();

    // Get current day of month (0-indexed)
    const dayOfMonth = new Date().getDate() - 1;

    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          // Update weekly progress
          const newWeeklyProgress = [...habit.weeklyProgress];
          newWeeklyProgress[today] = completed;

          // Update monthly progress
          const newMonthlyProgress = [...habit.monthlyProgress];
          newMonthlyProgress[dayOfMonth] = completed;

          // Update streak
          let newStreak = habit.currentStreak;
          if (completed) {
            newStreak += 1;
          } else {
            newStreak = Math.max(0, newStreak - 1);
          }

          return {
            ...habit,
            todayCompleted: completed,
            currentStreak: newStreak,
            weeklyProgress: newWeeklyProgress,
            monthlyProgress: newMonthlyProgress,
          };
        }
        return habit;
      }),
    );
  };

  // Định nghĩa hàm loadHabits với useCallback
  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.accessToken) {
        // Load mock data if no user is logged in
        loadMockHabits();
        return;
      }

      const serverHabits = await getHabits(user.accessToken);

      if (serverHabits.length === 0) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        await createDefaultHabits();
        return;
      }

      setHabits(serverHabits);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load habits:', err);
      }
      setError('Failed to load habits');
      loadMockHabits();
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // Định nghĩa hàm createDefaultHabits
  const createDefaultHabits = async () => {
    if (!user?.accessToken) return;

    try {
      const defaultHabits: Partial<Habit>[] = [
        {
          title: 'Học từ vựng mỗi ngày',
          description: 'Học 10 từ mới mỗi ngày',
          icon: Book,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-900',
          currentStreak: 0,
          todayCompleted: false,
          weeklyProgress: [false, false, false, false, false, false, false],
          monthlyProgress: Array(30).fill(false),
        },
        {
          title: 'Luyện nghe mỗi ngày',
          description: 'Nghe 15 phút tiếng Anh mỗi ngày',
          icon: Headphones,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-900',
          currentStreak: 0,
          todayCompleted: false,
          weeklyProgress: [false, false, false, false, false, false, false],
          monthlyProgress: Array(30).fill(false),
        },
      ];

      for (const habit of defaultHabits) {
        await createHabit(user.accessToken, habit);
      }

      await loadHabits();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create default habits:', err);
      }
      setError('Failed to create default habits');
    }
  };

  // Gọi loadHabits khi user thay đổi
  useEffect(() => {
    if (user?.accessToken) {
      loadHabits();
    }
  }, [user, loadHabits]);

  const addHabit = async (habit: Partial<Habit>) => {
    if (!user?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      await createHabit(user.accessToken, habit);
      await loadHabits();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to add habit:', err);
      }
      setError('Failed to add habit');
    } finally {
      setLoading(false);
    }
  };

  const removeHabit = async (habitId: string) => {
    if (!user?.accessToken && !habitId.startsWith('local-')) return;

    try {
      // Update local state first for immediate UI feedback
      setHabits(habits.filter(habit => habit.id !== habitId));

      // Then delete from Firestore if it's not a local habit
      if (user?.accessToken && !habitId.startsWith('local-')) {
        await deleteHabit(habitId);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete habit:', err);
      }
      setError('Failed to delete habit');
      // Reload to ensure UI is in sync with server
      await loadHabits();
    }
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (!habitId) return;

    try {
      // Find the habit to toggle
      const habitToToggle = habits.find(h => h.id === habitId);
      if (!habitToToggle) return;

      // Toggle completion status
      const newCompletionStatus = !habitToToggle.todayCompleted;

      // Update local state first
      updateLocalHabitState(habitId, newCompletionStatus);

      // Then update Firestore if it's not a local habit
      if (user?.accessToken && !habitId.startsWith('local-')) {
        // Calculate new streak
        let newStreak = habitToToggle.currentStreak;
        if (newCompletionStatus) {
          newStreak += 1;
        } else {
          newStreak = Math.max(0, newStreak - 1);
        }

        // Get current day of week (0 = Sunday, 6 = Saturday)
        const today = new Date().getDay();

        // Update weekly progress
        const newWeeklyProgress = [...habitToToggle.weeklyProgress];
        newWeeklyProgress[today] = newCompletionStatus;

        // Update monthly progress
        const dayOfMonth = new Date().getDate() - 1; // 0-indexed
        const newMonthlyProgress = [...habitToToggle.monthlyProgress];
        newMonthlyProgress[dayOfMonth] = newCompletionStatus;

        // Update in Firestore
        await updateHabit(habitId, {
          todayCompleted: newCompletionStatus,
          currentStreak: newStreak,
          weeklyProgress: newWeeklyProgress,
          monthlyProgress: newMonthlyProgress,
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to toggle habit completion:', err);
      }
      setError('Failed to toggle habit completion');
      // Reload to ensure UI is in sync with server
      await loadHabits();
    }
  };

  return {
    habits,
    loading,
    error,
    loadHabits,
    addHabit,
    removeHabit,
    toggleHabitCompletion,
    createDefaultHabits,
  };
}
