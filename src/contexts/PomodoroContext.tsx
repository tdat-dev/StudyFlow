import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface PomodoroSettings {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationsEnabled: boolean;
}

export interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
  currentTaskId?: string;
  currentTaskText?: string;
}

interface PomodoroContextType {
  // State
  state: PomodoroState;
  settings: PomodoroSettings;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  switchMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  setCurrentTask: (taskId: string, taskText: string) => void;
  clearCurrentTask: () => void;

  // Computed
  progress: number;
  formattedTime: string;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined,
);

const defaultSettings: PomodoroSettings = {
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notificationsEnabled: true,
};

const defaultState: PomodoroState = {
  timeLeft: 25 * 60, // 25 minutes in seconds
  isActive: false,
  mode: 'pomodoro',
  completedPomodoros: 0,
};

interface PomodoroProviderProps {
  children: ReactNode;
}

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  const [state, setState] = useState<PomodoroState>(defaultState);
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.warn('Failed to load pomodoro settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('pomodoro-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore if timer was active
        if (parsed.isActive) {
          setState(parsed);
        }
      } catch (error) {
        console.warn('Failed to load pomodoro state:', error);
      }
    }
  }, []);

  // Save state to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pomodoro-state', JSON.stringify(state));
  }, [state]);

  // Đảm bảo timeLeft luôn có giá trị hợp lệ khi không chạy
  useEffect(() => {
    if (!state.isActive && state.timeLeft === 0) {
      const duration = ((): number => {
        switch (state.mode) {
          case 'pomodoro':
            return settings.pomodoroTime * 60;
          case 'shortBreak':
            return settings.shortBreakTime * 60;
          case 'longBreak':
            return settings.longBreakTime * 60;
          default:
            return 25 * 60;
        }
      })();
      setState(prev => ({ ...prev, timeLeft: duration }));
    }
  }, [state.isActive, state.mode, state.timeLeft, settings]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isActive && state.timeLeft > 0) {
      interval = setInterval(() => {
        setState(prev => {
          const newTimeLeft = prev.timeLeft - 1;

          if (newTimeLeft <= 0) {
            // Timer completed -> chuyển mode trong handleTimerComplete
            handleTimerComplete();
            // Không ghi đè state ở đây, để handleTimerComplete quyết định
            return prev;
          }

          return {
            ...prev,
            timeLeft: newTimeLeft,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isActive, state.timeLeft]);

  const handleTimerComplete = useCallback(() => {
    // Play sound if enabled
    if (settings.soundEnabled) {
      try {
        const audio = new Audio('/sounds/timer-complete.mp3');
        audio.play().catch(() => {
          // Fallback: use Web Audio API
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 1,
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 1);
        });
      } catch (error) {
        console.warn('Failed to play timer sound:', error);
      }
    }

    // Show notification if enabled
    if (settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const modeText =
          state.mode === 'pomodoro'
            ? 'Pomodoro'
            : state.mode === 'shortBreak'
              ? 'Nghỉ ngắn'
              : 'Nghỉ dài';
        new Notification(`${modeText} hoàn thành!`, {
          body:
            state.mode === 'pomodoro'
              ? 'Chúc mừng! Hãy nghỉ ngơi một chút.'
              : 'Thời gian nghỉ kết thúc. Hãy quay lại làm việc!',
          icon: '/images/logo-192.png',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    // Chuyển mode tự động sau khi hoàn thành/skip
    setState(prev => {
      const wasPomodoro = prev.mode === 'pomodoro';
      const newCompleted = wasPomodoro
        ? prev.completedPomodoros + 1
        : prev.completedPomodoros;

      // Quy tắc: sau mỗi 4 Pomodoro thì nghỉ dài
      const nextMode: 'pomodoro' | 'shortBreak' | 'longBreak' = wasPomodoro
        ? newCompleted % 4 === 0
          ? 'longBreak'
          : 'shortBreak'
        : 'pomodoro';

      const nextTimeLeft =
        nextMode === 'pomodoro'
          ? settings.pomodoroTime * 60
          : nextMode === 'shortBreak'
            ? settings.shortBreakTime * 60
            : settings.longBreakTime * 60;

      const shouldAutoStart =
        nextMode === 'pomodoro'
          ? settings.autoStartPomodoros
          : settings.autoStartBreaks;

      return {
        ...prev,
        completedPomodoros: newCompleted,
        mode: nextMode,
        timeLeft: nextTimeLeft,
        isActive: shouldAutoStart,
      };
    });
  }, [state.mode, settings.soundEnabled, settings.notificationsEnabled, settings.pomodoroTime, settings.shortBreakTime, settings.longBreakTime, settings.autoStartBreaks, settings.autoStartPomodoros]);

  const getCurrentDuration = useCallback(() => {
    switch (state.mode) {
      case 'pomodoro':
        return settings.pomodoroTime * 60;
      case 'shortBreak':
        return settings.shortBreakTime * 60;
      case 'longBreak':
        return settings.longBreakTime * 60;
      default:
        return 25 * 60;
    }
  }, [state.mode, settings]);

  const startTimer = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  const resetTimer = useCallback(() => {
    const duration = getCurrentDuration();
    setState(prev => ({
      ...prev,
      timeLeft: duration,
      isActive: false,
    }));
  }, [getCurrentDuration]);

  const skipTimer = useCallback(() => {
    // Dừng ngay lập tức rồi chuyển mode để tránh race condition với interval
    setState(prev => ({ ...prev, isActive: false }));
    handleTimerComplete();
  }, [handleTimerComplete]);

  const switchMode = useCallback(
    (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
      setState(prev => ({
        ...prev,
        mode,
        isActive: false,
        timeLeft:
          mode === 'pomodoro'
            ? settings.pomodoroTime * 60
            : mode === 'shortBreak'
              ? settings.shortBreakTime * 60
              : settings.longBreakTime * 60,
      }));
    },
    [settings],
  );

  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
    },
    [],
  );

  const setCurrentTask = useCallback((taskId: string, taskText: string) => {
    setState(prev => ({
      ...prev,
      currentTaskId: taskId,
      currentTaskText: taskText,
    }));
  }, []);

  const clearCurrentTask = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTaskId: undefined,
      currentTaskText: undefined,
    }));
  }, []);

  const progress = useCallback(() => {
    const duration = getCurrentDuration();
    return ((duration - state.timeLeft) / duration) * 100;
  }, [state.timeLeft, getCurrentDuration]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const value: PomodoroContextType = {
    state,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchMode,
    updateSettings,
    setCurrentTask,
    clearCurrentTask,
    progress: progress(),
    formattedTime: formatTime(state.timeLeft),
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
