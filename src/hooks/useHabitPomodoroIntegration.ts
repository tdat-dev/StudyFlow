import { useState, useEffect, useCallback } from 'react';
import { 
  HabitBasedTask, 
  HabitPomodoroStats, 
  CreateHabitTaskData,
  HabitOption 
} from '../types/pomodoro-habits';
import { User } from '../types/chat';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../services/firebase/config';

export function useHabitPomodoroIntegration(user: User) {
  const [habitTasks, setHabitTasks] = useState<HabitBasedTask[]>([]);
  const [habitOptions, setHabitOptions] = useState<HabitOption[]>([]);
  const [habitStats, setHabitStats] = useState<HabitPomodoroStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentHabitId, setCurrentHabitId] = useState<string | null>(null);

  // Load available habits for task creation
  const loadHabitOptions = useCallback(async () => {
    if (!auth.currentUser?.uid) return;

    try {
      const habitsRef = collection(db, 'habits');
      const q = query(habitsRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      const habits: HabitOption[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          color: data.color,
          bgColor: data.bgColor,
          textColor: data.textColor,
          icon: data.iconName, // We'll need to map this back to actual icon
        };
      });

      setHabitOptions(habits);
    } catch (error) {
      console.error('Failed to load habit options:', error);
    }
  }, []);

  // Load habit-based tasks
  const loadHabitTasks = useCallback(async () => {
    if (!auth.currentUser?.uid) return;

    setLoading(true);
    try {
      const tasksRef = collection(db, 'pomodoro_habit_tasks');
      const q = query(tasksRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      const tasks: HabitBasedTask[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          completed: data.completed || false,
          pomodoroCount: data.pomodoroCount || 0,
          habitId: data.habitId,
          habitTitle: data.habitTitle,
          habitColor: data.habitColor,
          estimatedPomodoros: data.estimatedPomodoros,
          priority: data.priority || 'medium',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          completedAt: data.completedAt?.toDate?.()?.toISOString(),
        };
      });

      setHabitTasks(tasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load habit tasks:', error);
      // Fallback to empty array
      setHabitTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new habit-based task
  const createHabitTask = async (taskData: CreateHabitTaskData): Promise<string | null> => {
    if (!auth.currentUser?.uid) return null;

    try {
      // Find habit details
      const habit = habitOptions.find(h => h.id === taskData.habitId);
      if (!habit) throw new Error('Habit not found');

      const tasksRef = collection(db, 'pomodoro_habit_tasks');
      const newTask = {
        userId: auth.currentUser.uid,
        text: taskData.text,
        completed: false,
        pomodoroCount: 0,
        habitId: taskData.habitId,
        habitTitle: habit.title,
        habitColor: habit.color,
        estimatedPomodoros: taskData.estimatedPomodoros || 1,
        priority: taskData.priority || 'medium',
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(tasksRef, newTask);
      
      // Reload tasks
      await loadHabitTasks();
      
      return docRef.id;
    } catch (error) {
      console.error('Failed to create habit task:', error);
      return null;
    }
  };

  // Update task pomodoro count
  const updateTaskPomodoroCount = async (taskId: string, increment: number = 1) => {
    try {
      const taskRef = doc(db, 'pomodoro_habit_tasks', taskId);
      const task = habitTasks.find(t => t.id === taskId);
      
      if (task) {
        const newCount = task.pomodoroCount + increment;
        await updateDoc(taskRef, {
          pomodoroCount: newCount,
          lastPomodoroAt: Timestamp.now(),
        });

        // Update local state
        setHabitTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, pomodoroCount: newCount }
            : t
        ));

        // Check if task should be auto-completed
        if (task.estimatedPomodoros && newCount >= task.estimatedPomodoros) {
          await completeTask(taskId);
        }
      }
    } catch (error) {
      console.error('Failed to update task pomodoro count:', error);
    }
  };

  // Complete a task
  const completeTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'pomodoro_habit_tasks', taskId);
      await updateDoc(taskRef, {
        completed: true,
        completedAt: Timestamp.now(),
      });

      // Update local state
      setHabitTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, completed: true, completedAt: new Date().toISOString() }
          : t
      ));

      // Update habit completion if this was the last task for today
      const task = habitTasks.find(t => t.id === taskId);
      if (task?.habitId) {
        await updateHabitProgress(task.habitId);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Update habit progress based on completed tasks
  const updateHabitProgress = async (habitId: string) => {
    try {
      // Check if all tasks for this habit today are completed
      const today = new Date().toDateString();
      const todayTasks = habitTasks.filter(t => 
        t.habitId === habitId && 
        new Date(t.createdAt).toDateString() === today
      );
      
      const completedTodayTasks = todayTasks.filter(t => t.completed);
      
      // If all tasks are completed, mark habit as completed for today
      if (todayTasks.length > 0 && completedTodayTasks.length === todayTasks.length) {
        const habitRef = doc(db, 'habits', habitId);
        await updateDoc(habitRef, {
          todayCompleted: true,
          lastCompletedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Failed to update habit progress:', error);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'pomodoro_habit_tasks', taskId));
      setHabitTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Get tasks for a specific habit
  const getTasksForHabit = (habitId: string) => {
    return habitTasks.filter(task => task.habitId === habitId);
  };

  // Get active (incomplete) tasks
  const getActiveTasks = () => {
    return habitTasks.filter(task => !task.completed);
  };

  // Get tasks by priority
  const getTasksByPriority = (priority: 'low' | 'medium' | 'high') => {
    return habitTasks.filter(task => task.priority === priority && !task.completed);
  };

  // Calculate habit statistics
  const calculateHabitStats = useCallback(() => {
    const stats: HabitPomodoroStats[] = habitOptions.map(habit => {
      const habitTasks = getTasksForHabit(habit.id);
      const completedTasks = habitTasks.filter(t => t.completed);
      const totalPomodoros = habitTasks.reduce((sum, t) => sum + t.pomodoroCount, 0);
      
      return {
        habitId: habit.id,
        habitTitle: habit.title,
        totalPomodoros,
        completedTasks: completedTasks.length,
        totalTasks: habitTasks.length,
        averageTaskDuration: habitTasks.length > 0 
          ? totalPomodoros / habitTasks.length 
          : 0,
        lastPomodoroDate: habitTasks
          .filter(t => t.pomodoroCount > 0)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt,
        weeklyPomodoros: [], // TODO: Calculate weekly data
        monthlyPomodoros: [], // TODO: Calculate monthly data
      };
    });

    setHabitStats(stats);
  }, [habitOptions, habitTasks]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (auth.currentUser?.uid) {
      loadHabitOptions();
      loadHabitTasks();
    }
  }, [user, loadHabitOptions, loadHabitTasks]);

  // Recalculate stats when data changes
  useEffect(() => {
    calculateHabitStats();
  }, [calculateHabitStats]);

  return {
    // Data
    habitTasks,
    habitOptions,
    habitStats,
    loading,
    currentHabitId,
    
    // Actions
    createHabitTask,
    updateTaskPomodoroCount,
    completeTask,
    deleteTask,
    setCurrentHabitId,
    
    // Getters
    getTasksForHabit,
    getActiveTasks,
    getTasksByPriority,
    
    // Refresh
    loadHabitTasks,
    loadHabitOptions,
  };
}
