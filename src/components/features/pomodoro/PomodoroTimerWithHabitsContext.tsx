import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  List,
  BarChart3,
  Target,
  CheckCircle2,
  Trash2,
  Settings,
} from 'lucide-react';
import { useHabitPomodoroIntegration } from '../../../hooks/useHabitPomodoroIntegration';
import { HabitTaskCreator } from './HabitTaskCreator';
import { HabitTaskList } from './HabitTaskList';
import { PomodoroSettings } from './PomodoroSettings';
import { User } from '../../../types/chat';
import Button from '../../ui/button';
import { usePomodoro } from '../../../contexts/PomodoroContext';

interface ProgressRingProps {
  progress: number;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
}

function ProgressRing({ progress, mode }: ProgressRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const getModeClass = () => {
    switch (mode) {
      case 'pomodoro':
        return 'work';
      case 'shortBreak':
        return 'short';
      case 'longBreak':
        return 'long';
      default:
        return 'work';
    }
  };

  return (
    <circle
      cx="50"
      cy="50"
      r={radius}
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeDasharray={circumference}
      strokeDashoffset={strokeDashoffset}
      className={`progress-bar ${getModeClass()}`}
    />
  );
}

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

interface PomodoroTimerWithHabitsProps {
  user: User;
}

export function PomodoroTimerWithHabits({
  user,
}: PomodoroTimerWithHabitsProps) {
  // Sử dụng PomodoroContext thay vì local state
  const {
    state: pomodoroState,
    settings: pomodoroSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
    updateSettings,
    setCurrentTask,
    clearCurrentTask,
    progress,
    formattedTime,
  } = usePomodoro();

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Habit integration
  const {
    habitTasks,
    habitOptions,
    habitStats,
    loading: habitLoading,
    createHabitTask,
    completeTask,
    deleteTask,
  } = useHabitPomodoroIntegration(user);

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

  // Timer sessions history
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoro-sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (error) {
        console.warn('Failed to load pomodoro sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Sync current task with context
  useEffect(() => {
    if (currentTaskId) {
      const task = habitTasks.find(t => t.id === currentTaskId);
      if (task) {
        setCurrentTask(task.id, task.text);
      }
    }
  }, [currentTaskId, habitTasks, setCurrentTask]);

  const setAccentColors = (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    const root = document.documentElement;
    switch (mode) {
      case 'pomodoro':
        root.style.setProperty('--accent-work', '#ef4444');
        root.style.setProperty('--accent-tint-04', 'rgba(239, 68, 68, 0.04)');
        break;
      case 'shortBreak':
        root.style.setProperty('--accent-work', '#10b981');
        root.style.setProperty('--accent-tint-04', 'rgba(16, 185, 129, 0.04)');
        break;
      case 'longBreak':
        root.style.setProperty('--accent-work', '#3b82f6');
        root.style.setProperty('--accent-tint-04', 'rgba(59, 130, 246, 0.04)');
        break;
    }
  };

  // Update accent colors when mode changes
  useEffect(() => {
    setAccentColors(pomodoroState.mode);
  }, [pomodoroState.mode]);

  const startSession = () => {
    startTimer();
  };

  const pauseSession = () => {
    pauseTimer();
  };

  const resetSession = () => {
    resetTimer();
  };

  const skipSession = () => {
    skipTimer();
  };

  const switchToPomodoro = () => {
    switchMode('pomodoro');
  };

  const switchToShortBreak = () => {
    switchMode('shortBreak');
  };

  const switchToLongBreak = () => {
    switchMode('longBreak');
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
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
      clearCurrentTask();
    }
  };

  const handleHabitTaskSelect = (taskId: string) => {
    setCurrentTaskId(taskId);
    const task = habitTasks.find(t => t.id === taskId);
    if (task) {
      setCurrentTask(task.id, task.text);
    }
  };

  const handleHabitTaskComplete = async (taskId: string) => {
    await completeTask(taskId);
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
      clearCurrentTask();
    }
  };

  const handleHabitTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
      clearCurrentTask();
    }
  };

  const handleStartPomodoroForTask = (taskId: string) => {
    setCurrentTaskId(taskId);
    const task = habitTasks.find(t => t.id === taskId);
    if (task) {
      setCurrentTask(task.id, task.text);
    }
    switchToPomodoro();
  };

  const getModeText = () => {
    switch (pomodoroState.mode) {
      case 'pomodoro':
        return 'Pomodoro';
      case 'shortBreak':
        return 'Nghỉ ngắn';
      case 'longBreak':
        return 'Nghỉ dài';
      default:
        return 'Timer';
    }
  };

  const getModeColor = () => {
    switch (pomodoroState.mode) {
      case 'pomodoro':
        return 'text-red-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="pomodoro-page">
      <div className="pomodoro-container">
        <div className="pomodoro-grid">
          {/* Timer Card */}
          <div className="timer-card">
            {/* Timer Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pomodoro Timer
              </h2>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Cài đặt"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="timer-tabs">
              <button
                onClick={switchToPomodoro}
                className={`timer-tab ${pomodoroState.mode === 'pomodoro' ? 'active work' : ''}`}
              >
                Pomodoro
              </button>
              <button
                onClick={switchToShortBreak}
                className={`timer-tab ${pomodoroState.mode === 'shortBreak' ? 'active short' : ''}`}
              >
                Nghỉ ngắn
              </button>
              <button
                onClick={switchToLongBreak}
                className={`timer-tab ${pomodoroState.mode === 'longBreak' ? 'active long' : ''}`}
              >
                Nghỉ dài
              </button>
            </div>

            {/* Timer Display */}
            <div className="timer-display">
              <div className="relative w-80 h-80 mx-auto">
                {/* Progress Ring */}
                <svg
                  className="w-80 h-80 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="progress-track text-gray-200 dark:text-gray-700"
                  />
                  <ProgressRing progress={progress} mode={pomodoroState.mode} />
                </svg>

                {/* Timer Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className={`text-6xl md:text-7xl font-mono font-bold leading-tight ${getModeColor()}`}
                  >
                    {formattedTime}
                  </div>
                  <div className="text-base md:text-lg text-gray-500 dark:text-gray-400 mt-2 w-full text-center">
                    {getModeText()}
                  </div>
                  {/* Task text removed to keep timer circle clean */}
                </div>
              </div>
            </div>

            {/* Current Task Display */}
            {pomodoroState.currentTaskText && (
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-2xl w-full mx-auto break-words">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {pomodoroState.currentTaskText}
                  </div>
                </div>
              </div>
            )}

            {/* Timer Controls */}
            <div className="timer-controls">
              {!pomodoroState.isActive ? (
                <button onClick={startSession} className="control-primary">
                  <Play className="w-6 h-6 mr-2" />
                  Bắt đầu
                </button>
              ) : (
                <button onClick={pauseSession} className="control-primary">
                  <Pause className="w-6 h-6 mr-2" />
                  Tạm dừng
                </button>
              )}

              <button onClick={resetSession} className="control-ghost">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </button>

              <button onClick={skipSession} className="control-ghost">
                <SkipForward className="w-5 h-5 mr-2" />
                Bỏ qua
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Đã hoàn thành: {pomodoroState.completedPomodoros} pomodoros
              </div>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="tasks-card">
            {/* Tasks Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nhiệm vụ
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTasks(!showTasks)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={showTasks ? 'Ẩn danh sách' : 'Hiện danh sách'}
                >
                  <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={showHistory ? 'Ẩn lịch sử' : 'Hiện lịch sử'}
                >
                  <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Task Tabs */}
            <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('habit-tasks')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'habit-tasks'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Nhiệm vụ thói quen
              </button>
              <button
                onClick={() => setActiveTab('regular-tasks')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'regular-tasks'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Nhiệm vụ thường
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Thống kê
              </button>
            </div>

            {/* Task Content */}
            {showTasks && (
              <div className="space-y-4">
                {activeTab === 'habit-tasks' && (
                  <>
                    <HabitTaskCreator
                      habitOptions={habitOptions}
                      onCreateTask={createHabitTask}
                      loading={habitLoading}
                    />
                    <HabitTaskList
                      tasks={habitTasks}
                      currentTaskId={pomodoroState.currentTaskId}
                      isTimerActive={pomodoroState.isActive}
                      onTaskSelect={handleHabitTaskSelect}
                      onTaskComplete={handleHabitTaskComplete}
                      onTaskDelete={handleHabitTaskDelete}
                      onStartPomodoro={handleStartPomodoroForTask}
                    />
                  </>
                )}

                {activeTab === 'regular-tasks' && (
                  <>
                    {/* Add Traditional Task */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        placeholder="Thêm nhiệm vụ mới..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={e => e.key === 'Enter' && addTask()}
                      />
                      <Button onClick={addTask} disabled={!newTaskText.trim()}>
                        Thêm
                      </Button>
                    </div>

                    {/* Traditional Tasks List */}
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className={`task-item ${
                            currentTaskId === task.id
                              ? 'ring-2 ring-blue-500'
                              : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="flex-shrink-0"
                              title={
                                task.completed
                                  ? 'Đánh dấu chưa hoàn thành'
                                  : 'Đánh dấu hoàn thành'
                              }
                            >
                              <CheckCircle2
                                className={`w-5 h-5 ${
                                  task.completed
                                    ? 'text-green-500'
                                    : 'text-gray-400'
                                }`}
                              />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${
                                  task.completed
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {task.text}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {task.pomodoroCount} pomodoros
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setCurrentTaskId(task.id)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Chọn nhiệm vụ này"
                              >
                                <Target className="w-4 h-4 text-gray-400" />
                              </button>
                              <button
                                onClick={() => deleteTraditionalTask(task.id)}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Xóa nhiệm vụ"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {pomodoroState.completedPomodoros}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Pomodoros hoàn thành
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {habitTasks.length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Nhiệm vụ thói quen
                        </div>
                      </div>
                    </div>

                    {habitStats.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Thống kê thói quen
                        </h4>
                        {habitStats.map(stat => (
                          <div
                            key={stat.habitId}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {stat.habitTitle}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {stat.totalPomodoros} pomodoros
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {stat.completedTasks}/{stat.totalTasks} nhiệm
                                  vụ
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {showHistory && sessions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Lịch sử gần đây
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sessions.slice(0, 10).map(session => (
                    <div
                      key={session.id}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {session.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(session.completedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.floor(session.duration / 60)} phút
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {session.type === 'focus' ? 'Pomodoro' : 'Nghỉ'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <PomodoroSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={pomodoroSettings}
        onSettingsChange={updateSettings}
      />
    </div>
  );
}
