import React from 'react';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { HabitPomodoroStats as HabitPomodoroStatsType } from '../../../types/pomodoro-habits';

interface HabitPomodoroStatsProps {
  habitColor: string;
  stats?: HabitPomodoroStatsType;
  onViewDetails?: () => void;
}

export function HabitPomodoroStats({
  habitColor,
  stats,
  onViewDetails,
}: HabitPomodoroStatsProps) {
  if (!stats) {
    return (
      <div className="bg-gray-50 dark:bg-studyflow-surface rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habitColor }}
          />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Thống kê Pomodoro
          </h4>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chưa có dữ liệu Pomodoro cho thói quen này
        </p>
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const formatLastPomodoroDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    return `${Math.ceil(diffDays / 30)} tháng trước`;
  };

  return (
    <div className="bg-white dark:bg-studyflow-surface border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habitColor }}
          />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Thống kê Pomodoro
          </h4>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Xem chi tiết
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Total Pomodoros */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Tổng Pomodoro
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalPomodoros}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Tỷ lệ hoàn thành
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completionRate}%
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tasks hoàn thành</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {stats.completedTasks}/{stats.totalTasks}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Trung bình Pomodoro/task</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {stats.averageTaskDuration.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Lần cuối thực hiện</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatLastPomodoroDate(stats.lastPomodoroDate)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span>Tiến độ hoàn thành tasks</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${completionRate}%`,
              backgroundColor: habitColor 
            }}
          />
        </div>
      </div>

      {/* Weekly Trend (if available) */}
      {stats.weeklyPomodoros && stats.weeklyPomodoros.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Xu hướng tuần này
            </span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {stats.weeklyPomodoros.map((count, index) => {
              const maxCount = Math.max(...stats.weeklyPomodoros);
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div
                  key={index}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm relative"
                  title={`${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][index]}: ${count} Pomodoro`}
                >
                  <div
                    className="rounded-sm transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      backgroundColor: habitColor,
                      opacity: count > 0 ? 1 : 0.3,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Navigate to Pomodoro with this habit pre-selected
              // This would need to be implemented in the parent component
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Clock className="w-4 h-4" />
            Tạo task Pomodoro
          </button>
          <button
            onClick={() => {
              // Show detailed statistics modal
              if (onViewDetails) onViewDetails();
            }}
            className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            title="Xem thống kê chi tiết"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
