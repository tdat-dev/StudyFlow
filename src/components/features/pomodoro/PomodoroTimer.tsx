import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  List,
  BarChart3,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Clock,
} from 'lucide-react';

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

export function PomodoroTimer() {
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

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // UI state
  const [showTasks, setShowTasks] = useState(true);
  const [, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
    } else if (!isActive && timeLeft !== 0) {
      if (interval) clearInterval(interval);
    } else if (timeLeft === 0) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Helper functions
  const getCurrentDuration = () => {
    switch (timerMode) {
      case 'pomodoro':
        return pomodoroTime;
      case 'shortBreak':
        return shortBreakTime;
      case 'longBreak':
        return longBreakTime;
    }
  };

  const calculateProgress = () => {
    const totalSeconds = getCurrentDuration() * 60;
    return (timeLeft / totalSeconds) * 100;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const startSession = () => {
    setIsActive(true);
    const session: PomodoroSession = {
      id: Date.now().toString(),
      title: timerMode === 'pomodoro' ? 'Pomodoro Focus' : 'Break Time',
      duration: getCurrentDuration(),
      completedAt: new Date().toISOString(),
      type: timerMode === 'pomodoro' ? 'focus' : 'break',
    };
    setCurrentSession(session);
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

  const handleTimerComplete = () => {
    setIsActive(false);

    if (timerMode === 'pomodoro') {
      setPomodoroCount(prev => prev + 1);
      setSessionsCompleted(prev => prev + 1);
      setTotalFocusTime(prev => prev + pomodoroTime);

      // Mark current task as completed if selected
      if (currentTaskId) {
        setTasks(prev =>
          prev.map(task =>
            task.id === currentTaskId
              ? { ...task, pomodoroCount: task.pomodoroCount + 1 }
              : task,
          ),
        );
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

  // Task management
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

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  };

  return (
    <div className="pomodoro-page">
      <div className="pomodoro-container">
        <div className="pomodoro-grid">
          {/* Timer Card */}
          <div className="timer-card">
            {/* Timer Mode Tabs */}
            <div className="timer-tabs mb-8">
              <button
                className={`timer-tab ${timerMode === 'pomodoro' ? 'active work' : ''}`}
                onClick={switchToPomodoro}
                disabled={isActive}
              >
                Pomodoro
              </button>
              <button
                className={`timer-tab ${timerMode === 'shortBreak' ? 'active short' : ''}`}
                onClick={switchToShortBreak}
                disabled={isActive}
              >
                Nghỉ Ngắn
              </button>
              <button
                className={`timer-tab ${timerMode === 'longBreak' ? 'active long' : ''}`}
                onClick={switchToLongBreak}
                disabled={isActive}
              >
                Nghỉ Dài
              </button>
            </div>

            {/* Timer Display */}
            <div className="timer-display mb-8">{formatTime(timeLeft)}</div>

            {/* Control Buttons */}
            <div className="timer-controls mb-8">
              {isActive ? (
                <button className="control-primary" onClick={pauseSession}>
                  <Pause className="h-5 w-5" />
                  TẠM DỪNG
                </button>
              ) : (
                <button
                  className="control-primary"
                  onClick={currentSession ? resumeSession : startSession}
                >
                  <Play className="h-5 w-5" />
                  {currentSession ? 'TIẾP TỤC' : 'BẮT ĐẦU'}
                </button>
              )}

              <button
                className="control-ghost"
                onClick={resetSession}
                disabled={!currentSession && !isActive}
                title="Reset"
              >
                <RotateCcw className="h-5 w-5" />
              </button>

              <button
                className="control-ghost"
                onClick={skipSession}
                disabled={!isActive}
                title="Skip"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-6">
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--timer-track-light)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${100 - calculateProgress()}%`,
                    backgroundColor:
                      timerMode === 'pomodoro'
                        ? 'var(--accent-work)'
                        : timerMode === 'shortBreak'
                          ? 'var(--accent-short)'
                          : 'var(--accent-long)',
                  }}
                ></div>
              </div>
            </div>

            {/* Session Info */}
            {currentTaskId && (
              <div
                className="text-center mb-4"
                style={{ color: 'var(--app-text-muted)' }}
              >
                #{pomodoroCount + 1} -{' '}
                {tasks.find(t => t.id === currentTaskId)?.text}
              </div>
            )}
          </div>

          {/* Tasks Card */}
          {showTasks && (
            <div className="tasks-card">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--app-text)' }}
                >
                  Tasks
                </h2>
                <button
                  className="control-ghost"
                  onClick={() => setShowTasks(false)}
                  title="Ẩn tasks"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Add Task */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Bạn đang làm gì?"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addTask()}
                  className="flex-1 px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text)',
                  }}
                />
                <button
                  className="control-primary !px-3"
                  onClick={addTask}
                  disabled={!newTaskText.trim()}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-2 mb-6">
                {tasks.map(task => (
                  <div key={task.id} className="task-item">
                    <button
                      className="task-checkbox"
                      onClick={() => toggleTask(task.id)}
                      style={{
                        backgroundColor: task.completed
                          ? 'var(--accent-work)'
                          : 'transparent',
                        borderColor: task.completed
                          ? 'var(--accent-work)'
                          : 'var(--app-border)',
                      }}
                    >
                      {task.completed && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      )}
                    </button>
                    <span
                      className={`task-text ${task.completed ? 'completed' : ''}`}
                    >
                      {task.text}
                    </span>
                    <button
                      className="control-ghost !w-8 !h-8"
                      onClick={() => deleteTask(task.id)}
                      title="Xóa task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div
                    className="text-center py-8"
                    style={{ color: 'var(--app-text-muted)' }}
                  >
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có task nào</p>
                  </div>
                )}
              </div>

              {/* Task Selection for Timer */}
              {tasks.filter(t => !t.completed).length > 0 && (
                <div>
                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--app-text-muted)' }}
                  >
                    Chọn task để tập trung:
                  </h3>
                  <div className="space-y-1">
                    {tasks
                      .filter(t => !t.completed)
                      .map(task => (
                        <button
                          key={task.id}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentTaskId === task.id
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setCurrentTaskId(task.id)}
                          style={{
                            backgroundColor:
                              currentTaskId === task.id
                                ? 'var(--accent-tint-12)'
                                : 'transparent',
                            color:
                              currentTaskId === task.id
                                ? 'var(--accent-work)'
                                : 'var(--app-text)',
                          }}
                        >
                          {task.text}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Bottom Controls */}
        <div className="fixed bottom-6 right-6 flex items-center space-x-2">
          <button
            className="control-ghost shadow-lg"
            onClick={() => setShowTasks(!showTasks)}
            title={showTasks ? 'Ẩn tasks' : 'Hiện tasks'}
            style={{ backgroundColor: 'var(--app-card)' }}
          >
            <List className="h-5 w-5" />
          </button>

          <button
            className="control-ghost shadow-lg"
            onClick={() => setShowHistory(!showHistory)}
            title="Lịch sử"
            style={{ backgroundColor: 'var(--app-card)' }}
          >
            <BarChart3 className="h-5 w-5" />
          </button>

          <button
            className="control-ghost shadow-lg"
            onClick={() => setShowSettings(true)}
            title="Cài đặt"
            style={{ backgroundColor: 'var(--app-card)' }}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
