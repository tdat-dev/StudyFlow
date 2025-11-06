import React from 'react';
import { usePomodoro } from '../../../contexts/PomodoroContext';
import { Play, Pause, Square, Clock } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
}

function ProgressBar({ progress, mode }: ProgressBarProps) {
  const getColorClass = () => {
    switch (mode) {
      case 'pomodoro':
        return 'bg-red-500';
      case 'shortBreak':
        return 'bg-green-500';
      case 'longBreak':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`h-1 rounded-full transition-all duration-1000 ${getColorClass()}`}
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  );
}

interface PomodoroIndicatorProps {
  className?: string;
  onNavigateToPomodoro?: () => void;
}

export function PomodoroIndicator({
  className = '',
  onNavigateToPomodoro,
}: PomodoroIndicatorProps) {
  const { state, startTimer, pauseTimer, resetTimer, formattedTime } =
    usePomodoro();

  // Chỉ hiển thị khi timer đang chạy hoặc có task được chọn
  if (!state.isActive && !state.currentTaskId) {
    return null;
  }

  const getModeColor = () => {
    switch (state.mode) {
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

  const getModeText = () => {
    switch (state.mode) {
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

  const handleToggleTimer = () => {
    if (state.isActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div className={`fixed bottom-20 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getModeText()}
            </span>
          </div>
          <button
            onClick={onNavigateToPomodoro}
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-3">
          <div className={`text-2xl font-mono font-bold ${getModeColor()}`}>
            {formattedTime}
          </div>
          {state.currentTaskText && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {state.currentTaskText}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={handleToggleTimer}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            title={state.isActive ? 'Tạm dừng' : 'Bắt đầu'}
          >
            {state.isActive ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
            title="Reset"
          >
            <Square className="w-3 h-3" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <ProgressBar
              progress={
                state.timeLeft > 0
                  ? ((getCurrentDuration() - state.timeLeft) /
                      getCurrentDuration()) *
                    100
                  : 100
              }
              mode={state.mode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function để tính duration hiện tại
function getCurrentDuration() {
  // This should be moved to context or passed as prop
  return 25 * 60; // Default 25 minutes
}
