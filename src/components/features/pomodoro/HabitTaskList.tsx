import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  Trash2, 
  Flag,
  Play,
  Pause
} from 'lucide-react';
import { HabitBasedTask } from '../../../types/pomodoro-habits';
import Button from '../../ui/button';

interface HabitTaskListProps {
  tasks: HabitBasedTask[];
  currentTaskId?: string | null;
  isTimerActive?: boolean;
  onTaskSelect: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onStartPomodoro?: (taskId: string) => void;
}

export function HabitTaskList({
  tasks,
  currentTaskId,
  isTimerActive = false,
  onTaskSelect,
  onTaskComplete,
  onTaskDelete,
  onStartPomodoro,
}: HabitTaskListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getProgressPercentage = (task: HabitBasedTask) => {
    if (!task.estimatedPomodoros) return 0;
    return Math.min((task.pomodoroCount / task.estimatedPomodoros) * 100, 100);
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Chưa có task nào từ thói quen</p>
        <p className="text-sm mt-1">Tạo task mới để bắt đầu!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Circle className="w-4 h-4" />
            Đang thực hiện ({activeTasks.length})
          </h3>
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={currentTaskId === task.id}
                isTimerActive={isTimerActive}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
                getProgressPercentage={getProgressPercentage}
                onTaskSelect={onTaskSelect}
                onTaskComplete={onTaskComplete}
                onTaskDelete={onTaskDelete}
                onStartPomodoro={onStartPomodoro}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Đã hoàn thành ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={false}
                isTimerActive={false}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
                getProgressPercentage={getProgressPercentage}
                onTaskSelect={onTaskSelect}
                onTaskComplete={onTaskComplete}
                onTaskDelete={onTaskDelete}
                onStartPomodoro={onStartPomodoro}
                isCompleted
              />
            ))}
            {completedTasks.length > 5 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                Và {completedTasks.length - 5} task khác...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskItemProps {
  task: HabitBasedTask;
  isSelected: boolean;
  isTimerActive: boolean;
  isCompleted?: boolean;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => string;
  getProgressPercentage: (task: HabitBasedTask) => number;
  onTaskSelect: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onStartPomodoro?: (taskId: string) => void;
}

function TaskItem({
  task,
  isSelected,
  isTimerActive,
  isCompleted = false,
  getPriorityColor,
  getPriorityIcon,
  getProgressPercentage,
  onTaskSelect,
  onTaskComplete,
  onTaskDelete,
  onStartPomodoro,
}: TaskItemProps) {
  const progressPercentage = getProgressPercentage(task);
  const isTaskComplete = task.completed || progressPercentage >= 100;

  return (
    <div
      className={`
        border-l-4 rounded-r-lg p-3 transition-all cursor-pointer
        ${getPriorityColor(task.priority || 'medium')}
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${isCompleted ? 'opacity-75' : ''}
        hover:shadow-sm
      `}
      onClick={() => !isCompleted && onTaskSelect(task.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Task Header */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isCompleted) onTaskComplete(task.id);
              }}
              className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                ${isTaskComplete 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                }
              `}
            >
              {isTaskComplete && <CheckCircle2 className="w-3 h-3" />}
            </button>
            
            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-studyflow-surface border border-gray-200 dark:border-gray-600">
              {getPriorityIcon(task.priority || 'medium')} {task.habitTitle}
            </span>
          </div>

          {/* Task Text */}
          <p className={`
            text-sm font-medium mb-2
            ${isTaskComplete ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}
          `}>
            {task.text}
          </p>

          {/* Progress Bar */}
          {task.estimatedPomodoros && task.estimatedPomodoros > 1 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Tiến độ</span>
                <span>{task.pomodoroCount}/{task.estimatedPomodoros} Pomodoro</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Task Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.pomodoroCount} Pomodoro</span>
            </div>
            {task.estimatedPomodoros && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Mục tiêu: {task.estimatedPomodoros}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              <span>{task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex items-center gap-2 ml-2">
            {onStartPomodoro && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartPomodoro(task.id);
                }}
                disabled={isTimerActive && isSelected}
                variant={isTimerActive && isSelected ? "warning" : "default"}
                size="icon-sm"
                title="Bắt đầu Pomodoro"
              >
                {isTimerActive && isSelected ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            )}
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onTaskDelete(task.id);
              }}
              variant="destructive"
              size="icon-sm"
              title="Xóa task"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Selected Task Indicator */}
      {isSelected && !isCompleted && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Đang thực hiện task này</span>
          </div>
        </div>
      )}
    </div>
  );
}
