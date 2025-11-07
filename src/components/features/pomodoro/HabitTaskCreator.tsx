import React, { useState } from 'react';
import { Plus, Target, Clock, Flag, X } from 'lucide-react';
import {
  HabitOption,
  CreateHabitTaskData,
} from '../../../types/pomodoro-habits';

interface HabitTaskCreatorProps {
  habitOptions: HabitOption[];
  onCreateTask: (taskData: CreateHabitTaskData) => Promise<string | null>;
  loading?: boolean;
}

export function HabitTaskCreator({
  habitOptions,
  onCreateTask,
  loading = false,
}: HabitTaskCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || !selectedHabitId) return;

    setIsSubmitting(true);
    try {
      const taskData: CreateHabitTaskData = {
        text: taskText.trim(),
        habitId: selectedHabitId,
        estimatedPomodoros,
        priority,
      };

      const result = await onCreateTask(taskData);
      if (result) {
        // Reset form
        setTaskText('');
        setSelectedHabitId('');
        setEstimatedPomodoros(1);
        setPriority('medium');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to create habit task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={loading || habitOptions.length === 0}
        className="w-full flex items-center justify-center gap-2.5 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="font-medium">Tạo task từ thói quen</span>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-studyflow-surface shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tạo task từ thói quen
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          title="Đóng form"
          aria-label="Đóng form tạo task"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Habit Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
            Chọn thói quen
          </label>
          <div className="relative">
            <select
              value={selectedHabitId}
              onChange={e => setSelectedHabitId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
              required
              aria-label="Chọn thói quen"
            >
              <option value="">Chọn thói quen...</option>
              {habitOptions.map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Task Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
            Mô tả task
          </label>
          <input
            type="text"
            value={taskText}
            onChange={e => setTaskText(e.target.value)}
            placeholder="Ví dụ: Đọc 20 trang sách..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            required
          />
        </div>

        {/* Estimated Pomodoros */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Dự kiến số Pomodoro
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={estimatedPomodoros}
            onChange={e => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            aria-label="Dự kiến số Pomodoro"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
            <Flag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Độ ưu tiên
          </label>
          <div className="flex gap-2.5">
            {(['low', 'medium', 'high'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  priority === p
                    ? `${getPriorityColor(p)} shadow-md scale-105`
                    : 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-[1.02]'
                }`}
              >
                <span className="mr-1.5 text-base">{getPriorityIcon(p)}</span>
                {p === 'low' ? 'Thấp' : p === 'medium' ? 'Trung bình' : 'Cao'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:scale-[1.02]"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!taskText.trim() || !selectedHabitId || isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang tạo...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5" />
                <span>Tạo task</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
