import { useState, useEffect } from 'react';
import { User } from '../types/chat';

// Define PomodoroSession type locally
interface PomodoroSession {
  id: string;
  title: string;
  duration: number;
  completedAt?: string;
  type: 'focus' | 'break';
}

// Mock Firebase functions
const getPomodoroSessions = async (token: string): Promise<PomodoroSession[]> => {
  return [];
};

const savePomodoroSession = async (token: string, session: Omit<PomodoroSession, 'id'>): Promise<string> => {
  return 'mock-session-id';
};

const deletePomodoroSession = async (sessionId: string): Promise<void> => {
  return;
};

export function usePomodoro(user: User) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes
  const [currentMode, setCurrentMode] = useState<'focus' | 'break'>('focus');
  const [focusTime, setFocusTime] = useState(25); // minutes
  const [breakTime, setBreakTime] = useState(5); // minutes
  const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([]);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate mock data
  const generateMockSessions = () => {
    const mockSessions: PomodoroSession[] = [
      {
        id: "1",
        title: "Tập trung học tập",
        duration: 25,
        completedAt: new Date().toISOString(),
        type: 'focus'
      },
      {
        id: "2", 
        title: "Nghỉ ngơi",
        duration: 5,
        completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: 'break'
      }
    ];
    setSessionHistory(mockSessions);
    
    // Calculate stats
    const focusSessions = mockSessions.filter(s => s.type === 'focus');
    setSessionsCompleted(focusSessions.length);
    setTotalFocusTime(focusSessions.reduce((total, session) => total + session.duration, 0));
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      if (user?.accessToken) {
        const data = await getPomodoroSessions(user.accessToken);
        setSessionHistory(data);
        
        // Calculate stats
        const focusSessions = data.filter(s => s.type === 'focus');
        setSessionsCompleted(focusSessions.length);
        setTotalFocusTime(focusSessions.reduce((total, session) => total + session.duration, 0));
      } else {
        generateMockSessions();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      generateMockSessions();
    } finally {
      setLoading(false);
    }
  };

  const handleTimerComplete = async () => {
    setIsActive(false);
    setTimeRemaining(0);
    
    // Save completed session
    try {
      const session: Omit<PomodoroSession, 'id'> = {
        title: `${currentMode === 'focus' ? 'Tập trung' : 'Nghỉ ngơi'} - ${formatTime(currentMode === 'focus' ? focusTime * 60 : breakTime * 60)}`,
        duration: currentMode === 'focus' ? focusTime : breakTime,
        completedAt: new Date().toISOString(),
        type: currentMode
      };
      
      if (user?.accessToken) {
        await savePomodoroSession(user.accessToken, session);
      }
      
      // Add to local state
      const newSession: PomodoroSession = {
        ...session,
        id: generateUniqueId('session')
      };
      setSessionHistory(prev => [newSession, ...prev]);
      
      // Update stats
      if (currentMode === 'focus') {
        setSessionsCompleted(prev => prev + 1);
        setTotalFocusTime(prev => prev + focusTime);
      }
      
      // Auto switch mode
      if (currentMode === 'focus') {
        switchMode('break');
      } else {
        switchMode('focus');
      }
      
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const playAlarm = () => {
    // Simple beep sound simulation
    if (typeof window !== 'undefined' && window.Audio) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCDGH0fPTgjMGHm7A7t2QQAoUXrTp66hVFApGn+DyvmwhCDGH0fPTgjMGHm7A7t2QQAoUXrTp66hVFApGn+DyvmwhCDGH0fPTgjMGHm7A7t2QQAoUXrTp66hVFApGn+DyvmwhCDGH0fPTgjMGHm7A7g==');
        audio.play();
      } catch (e) {
        // Fallback to no sound if audio fails
      }
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      // Timer completed
      handleTimerComplete();
      playAlarm();
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeRemaining]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(currentMode === 'focus' ? focusTime * 60 : breakTime * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setCurrentMode(newMode);
    setTimeRemaining(newMode === 'focus' ? focusTime * 60 : breakTime * 60);
    setIsActive(false);
  };

  const updateFocusTime = (minutes: number) => {
    setFocusTime(minutes);
    if (currentMode === 'focus' && !isActive) {
      setTimeRemaining(minutes * 60);
    }
  };

  const updateBreakTime = (minutes: number) => {
    setBreakTime(minutes);
    if (currentMode === 'break' && !isActive) {
      setTimeRemaining(minutes * 60);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      if (user?.accessToken && !sessionId.startsWith('local-')) {
        await deletePomodoroSession(sessionId);
      }
      
      setSessionHistory(prev => prev.filter(session => session.id !== sessionId));
      
      // Recalculate stats
      const remainingSessions = sessionHistory.filter(s => s.id !== sessionId);
      const focusSessions = remainingSessions.filter(s => s.type === 'focus');
      setSessionsCompleted(focusSessions.length);
      setTotalFocusTime(focusSessions.reduce((total, session) => total + session.duration, 0));
      
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const generateUniqueId = (prefix: string = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const totalTime = currentMode === 'focus' ? focusTime * 60 : breakTime * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return {
    // Timer state
    isActive,
    timeRemaining,
    currentMode,
    focusTime,
    breakTime,
    
    // Session data
    sessionHistory,
    sessionsCompleted,
    totalFocusTime,
    loading,
    error,
    
    // Timer controls
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    
    // Settings
    updateFocusTime,
    updateBreakTime,
    
    // Session management
    deleteSession,
    
    // Utility functions
    formatTime,
    calculateProgress,
    formatTotalTime
  };
}