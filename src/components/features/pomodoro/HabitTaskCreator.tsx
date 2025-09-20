import React, { useState } from 'react';
import { Plus, Target, Clock, Flag, X } from 'lucide-react';
import { HabitOption, CreateHabitTaskData } from '../../../types/pomodoro-habits';

interface HabitTaskCreatorProps {
  habitOptions: HabitOption[];
  onCreateTask: (taskData: CreateHabitTaskData) => Promise<string | null>;
  loading?: boolean;
}

export function HabitTaskCreator({ 
  habitOptions, 
  onCreateTask, 
  loading = false 
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
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={loading || habitOptions.length === 0}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        <span>Thêm task từ thói quen</span>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-studyflow-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Tạo task từ thói quen
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chọn thói quen
          </label>
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-studyflow-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Chọn thói quen...</option>
            {habitOptions.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.title}
              </option>
            ))}
          </select>
        </div>

        {/* Task Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả task
          </label>
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Ví dụ: Đọc 20 trang sách..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-studyflow-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Estimated Pomodoros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Dự kiến số Pomodoro
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={estimatedPomodoros}
            onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-studyflow-surface text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Flag className="w-4 h-4 inline mr-1" />
            Độ ưu tiên
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors ${
                  priority === p
                    ? getPriorityColor(p)
                    : 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-1">{getPriorityIcon(p)}</span>
                {p === 'low' ? 'Thấp' : p === 'medium' ? 'Trung bình' : 'Cao'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!taskText.trim() || !selectedHabitId || isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Target className="w-4 h-4" />
                Tạo task
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
