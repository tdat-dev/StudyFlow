// Types for integrating Pomodoro tasks with Habits

export interface HabitBasedTask {
  id: string;
  text: string;
  completed: boolean;
  pomodoroCount: number;
  habitId?: string; // Link to habit
  habitTitle?: string; // Cache habit title for display
  habitColor?: string; // Cache habit color for display
  estimatedPomodoros?: number; // How many pomodoros this task should take
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface HabitPomodoroStats {
  habitId: string;
  habitTitle: string;
  totalPomodoros: number;
  completedTasks: number;
  totalTasks: number;
  averageTaskDuration: number; // in pomodoros
  lastPomodoroDate?: string;
  weeklyPomodoros: number[];
  monthlyPomodoros: number[];
}

export interface PomodoroHabitIntegration {
  // Habit-based task management
  habitTasks: HabitBasedTask[];

  // Statistics
  habitStats: HabitPomodoroStats[];

  // Current session info
  currentHabitId?: string;
  currentTaskId?: string;

  // Settings
  autoCompleteHabitOnTaskComplete: boolean;
  showHabitProgressInPomodoro: boolean;
}

export interface CreateHabitTaskData {
  text: string;
  habitId: string;
  estimatedPomodoros?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface HabitOption {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: any;
}
