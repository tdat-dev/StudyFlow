import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  List,
  BarChart3,
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useHabitPomodoroIntegration } from '../../../hooks/useHabitPomodoroIntegration';
import { HabitTaskCreator } from './HabitTaskCreator';
import { HabitTaskList } from './HabitTaskList';
import { User } from '../../../types/chat';
import Button from '../../ui/button';

// Types
interface Task {
  id: string;
  text: string;
  completed: boolean;
  pomodoroCount: number;
}

interface PomodoroSession {
  id: string;
  title: string;
  duration: number;
  completedAt: string;
  type: 'focus' | 'break';
}

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface PomodoroTimerWithHabitsProps {
  user: User;
}

export function PomodoroTimerWithHabits({
  user,
}: PomodoroTimerWithHabitsProps) {
  // Habit integration
  const {
    habitTasks,
    habitOptions,
    habitStats,
    loading: habitLoading,
    createHabitTask,
    updateTaskPomodoroCount,
    completeTask,
    deleteTask,
    getActiveTasks,
  } = useHabitPomodoroIntegration(user);

  // Timer state
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(
    null,
  );

  // Settings (read-only for now)
  const pomodoroTime = 25;
  const shortBreakTime = 5;
  const longBreakTime = 15;

  // Traditional tasks (keeping for backward compatibility)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // UI state
  const [showTasks, setShowTasks] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'habit-tasks' | 'regular-tasks' | 'stats'
  >('habit-tasks');

  // Statistics
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [, setSessionsCompleted] = useState(0);
  const [, setTotalFocusTime] = useState(0);

  // Set dynamic accent colors based on timer mode
  const setAccentColors = (mode: TimerMode) => {
    const root = document.documentElement;
    switch (mode) {
      case 'pomodoro':
        root.style.setProperty('--accent-rgb', '239, 68, 68'); // red
        break;
      case 'shortBreak':
        root.style.setProperty('--accent-rgb', '34, 197, 94'); // green
        break;
      case 'longBreak':
        root.style.setProperty('--accent-rgb', '6, 182, 212'); // cyan
        break;
    }
  };

  // Update accent colors when timer mode changes
  useEffect(() => {
    setAccentColors(timerMode);
  }, [timerMode]);

  // Auto-update time when settings change
  useEffect(() => {
    if (!isActive) {
      const timeMap = {
        pomodoro: pomodoroTime * 60,
        shortBreak: shortBreakTime * 60,
        longBreak: longBreakTime * 60,
      };
      setTimeLeft(timeMap[timerMode]);
    }
  }, [pomodoroTime, shortBreakTime, longBreakTime, timerMode, isActive]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  // Helper functions
  const getCurrentDuration = () => {
    const timeMap = {
      pomodoro: pomodoroTime * 60,
      shortBreak: shortBreakTime * 60,
      longBreak: longBreakTime * 60,
    };
    return timeMap[timerMode];
  };

  const calculateProgress = () => {
    const totalTime = getCurrentDuration();
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const startSession = () => {
    setIsActive(true);
    const sessionTitle =
      timerMode === 'pomodoro' ? 'Focus Session' : 'Break Session';
    setCurrentSession({
      id: Date.now().toString(),
      title: sessionTitle,
      duration: getCurrentDuration(),
      completedAt: '',
      type: timerMode === 'pomodoro' ? 'focus' : 'break',
    });
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentSession(null);
    const timeMap = {
      pomodoro: pomodoroTime * 60,
      shortBreak: shortBreakTime * 60,
      longBreak: longBreakTime * 60,
    };
    setTimeLeft(timeMap[timerMode]);
  };

  const skipSession = () => {
    setTimeLeft(0);
  };

  const handleTimerComplete = async () => {
    setIsActive(false);

    if (timerMode === 'pomodoro') {
      setPomodoroCount(prev => prev + 1);
      setSessionsCompleted(prev => prev + 1);
      setTotalFocusTime(prev => prev + pomodoroTime);

      // Update habit-based task if selected
      if (currentTaskId) {
        const habitTask = habitTasks.find(t => t.id === currentTaskId);
        if (habitTask) {
          await updateTaskPomodoroCount(currentTaskId, 1);
        } else {
          // Update traditional task
          setTasks(prev =>
            prev.map(task =>
              task.id === currentTaskId
                ? { ...task, pomodoroCount: task.pomodoroCount + 1 }
                : task,
            ),
          );
        }
      }
    }

    setCurrentSession(null);

    // Auto-switch to appropriate break or work mode
    if (timerMode === 'pomodoro') {
      if ((pomodoroCount + 1) % 4 === 0) {
        switchToLongBreak();
      } else {
        switchToShortBreak();
      }
    } else {
      switchToPomodoro();
    }
  };

  // Mode switching
  const switchToPomodoro = () => {
    if (!isActive) {
      setTimerMode('pomodoro');
      setTimeLeft(pomodoroTime * 60);
    }
  };

  const switchToShortBreak = () => {
    if (!isActive) {
      setTimerMode('shortBreak');
      setTimeLeft(shortBreakTime * 60);
    }
  };

  const switchToLongBreak = () => {
    if (!isActive) {
      setTimerMode('longBreak');
      setTimeLeft(longBreakTime * 60);
    }
  };

  // Traditional task management (keeping for backward compatibility)
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        pomodoroCount: 0,
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskText('');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTraditionalTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  };

  // Habit task handlers
  const handleHabitTaskSelect = (taskId: string) => {
    setCurrentTaskId(taskId);
  };

  const handleHabitTaskComplete = async (taskId: string) => {
    await completeTask(taskId);
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  };

  const handleHabitTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  };

  const handleStartPomodoroForTask = (taskId: string) => {
    setCurrentTaskId(taskId);
    if (!isActive) {
      startSession();
    }
  };

  // Get current task info for display
  const getCurrentTaskInfo = () => {
    if (!currentTaskId) return null;

    const habitTask = habitTasks.find(t => t.id === currentTaskId);
    if (habitTask) {
      return {
        text: habitTask.text,
        habitTitle: habitTask.habitTitle,
        pomodoroCount: habitTask.pomodoroCount,
        estimatedPomodoros: habitTask.estimatedPomodoros,
      };
    }

    const traditionalTask = tasks.find(t => t.id === currentTaskId);
    if (traditionalTask) {
      return {
        text: traditionalTask.text,
        pomodoroCount: traditionalTask.pomodoroCount,
      };
    }

    return null;
  };

  const currentTaskInfo = getCurrentTaskInfo();
  const activeTasks = getActiveTasks();

  return (
    <div className="pomodoro-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-studyflow-bg dark:to-studyflow-surface">
      <div className="pomodoro-container max-w-7xl mx-auto p-4">
        <div className="pomodoro-grid grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6 items-start">
          {/* Timer Section */}
          <div className="lg:col-span-1 min-w-0">
            <div className="timer-card bg-white dark:bg-studyflow-surface dark:card-elevated rounded-2xl shadow-lg p-8">
              {/* Timer Tabs */}
              <div className="timer-tabs flex justify-center mb-8">
                <div className="flex bg-gray-100 dark:bg-studyflow-surface rounded-xl p-1">
                  <button
                    onClick={switchToPomodoro}
                    className={`timer-tab px-6 py-3 rounded-lg font-medium transition-all ${
                      timerMode === 'pomodoro'
                        ? 'active work bg-red-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    Pomodoro
                  </button>
                  <button
                    onClick={switchToShortBreak}
                    className={`timer-tab px-6 py-3 rounded-lg font-medium transition-all ${
                      timerMode === 'shortBreak'
                        ? 'active short bg-green-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    Nghỉ ngắn
                  </button>
                  <button
                    onClick={switchToLongBreak}
                    className={`timer-tab px-6 py-3 rounded-lg font-medium transition-all ${
                      timerMode === 'longBreak'
                        ? 'active long bg-cyan-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    }`}
                  >
                    Nghỉ dài
                  </button>
                </div>
              </div>

              {/* Timer Display */}
              <div className="timer-display text-center mb-8">
                <div className="relative inline-block">
                  <svg
                    className="progress-ring w-64 h-64 transform -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      className="progress-track"
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <circle
                      className={`progress-bar ${timerMode}`}
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - calculateProgress() / 100)}`}
                      style={{
                        transition: 'stroke-dashoffset 1s ease-in-out',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatTime(timeLeft)}
                      </div>
                      {currentTaskInfo && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-48">
                          <div className="font-medium truncate">
                            {currentTaskInfo.text}
                          </div>
                          {currentTaskInfo.habitTitle && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {currentTaskInfo.habitTitle}
                            </div>
                          )}
                          <div className="text-xs mt-1">
                            {currentTaskInfo.pomodoroCount}
                            {currentTaskInfo.estimatedPomodoros &&
                              `/${currentTaskInfo.estimatedPomodoros}`}{' '}
                            Pomodoro
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="timer-controls flex justify-center gap-4">
                <Button
                  onClick={
                    isActive
                      ? pauseSession
                      : currentSession
                        ? resumeSession
                        : startSession
                  }
                  variant={isActive ? 'warning' : 'default'}
                  size="lg"
                  className="gap-2 min-w-[140px]"
                >
                  {isActive ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {isActive
                    ? 'Tạm dừng'
                    : currentSession
                      ? 'Tiếp tục'
                      : 'Bắt đầu'}
                </Button>

                <Button
                  onClick={resetSession}
                  variant="outline"
                  size="lg"
                  className="gap-2 min-w-[100px]"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>

                <Button
                  onClick={skipSession}
                  variant="ghost"
                  size="lg"
                  className="gap-2 min-w-[100px]"
                >
                  <SkipForward className="w-5 h-5" />
                  Bỏ qua
                </Button>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="tasks-card bg-white dark:bg-studyflow-surface rounded-2xl shadow-lg p-6 lg:sticky lg:top-6 min-w-[320px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Tasks & Thói quen
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTasks(!showTasks)}
                  className={`p-2 rounded-lg transition-colors ${
                    showTasks
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title={showTasks ? 'Ẩn danh sách' : 'Hiện danh sách'}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 rounded-lg transition-colors ${
                    showHistory
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title={showHistory ? 'Ẩn thống kê' : 'Hiện thống kê'}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showTasks && (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 dark:bg-studyflow-surface rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('habit-tasks')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'habit-tasks'
                        ? 'bg-white dark:bg-studyflow-surface text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Target className="w-4 h-4 inline mr-1" />
                    Thói quen
                  </button>
                  <button
                    onClick={() => setActiveTab('regular-tasks')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'regular-tasks'
                        ? 'bg-white dark:bg-studyflow-surface text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <List className="w-4 h-4 inline mr-1" />
                    Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'stats'
                        ? 'bg-white dark:bg-studyflow-surface text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Thống kê
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'habit-tasks' && (
                  <div className="space-y-4">
                    <HabitTaskCreator
                      habitOptions={habitOptions}
                      onCreateTask={createHabitTask}
                      loading={habitLoading}
                    />

                    <HabitTaskList
                      tasks={habitTasks}
                      currentTaskId={currentTaskId}
                      isTimerActive={isActive}
                      onTaskSelect={handleHabitTaskSelect}
                      onTaskComplete={handleHabitTaskComplete}
                      onTaskDelete={handleHabitTaskDelete}
                      onStartPomodoro={handleStartPomodoroForTask}
                    />
                  </div>
                )}

                {activeTab === 'regular-tasks' && (
                  <div className="space-y-4">
                    {/* Traditional Task Creator */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        placeholder="Thêm task mới..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-studyflow-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={e => e.key === 'Enter' && addTask()}
                      />
                      <button
                        onClick={addTask}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Thêm
                      </button>
                    </div>

                    {/* Traditional Tasks List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className={`task-item flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            currentTaskId === task.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setCurrentTaskId(task.id)}
                        >
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleTask(task.id);
                            }}
                            className={`task-checkbox w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                            }`}
                          >
                            {task.completed && (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`task-text text-sm font-medium ${
                                task.completed
                                  ? 'completed line-through text-gray-500 dark:text-gray-400'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {task.text}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.pomodoroCount} Pomodoro</span>
                            </div>
                          </div>

                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteTraditionalTask(task.id);
                            }}
                            className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                            title="Xóa task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {activeTasks.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Tasks đang thực hiện
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {habitTasks.filter(t => t.completed).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Tasks đã hoàn thành
                        </div>
                      </div>
                    </div>

                    {/* Habit Stats */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Thống kê theo thói quen
                      </h4>
                      {habitStats.map(stat => (
                        <div
                          key={stat.habitId}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-studyflow-surface rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {stat.habitTitle}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {stat.completedTasks}/{stat.totalTasks} tasks
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {stat.totalPomodoros}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Pomodoros
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
