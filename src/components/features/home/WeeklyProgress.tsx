import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Calendar, TrendingUp, Target, Zap } from 'lucide-react';
import { IntegratedProgress } from '../../../services/dashboard/integrationService';

interface WeeklyProgressProps {
  progress: IntegratedProgress | null;
}

export function WeeklyProgress({ progress }: WeeklyProgressProps) {
  if (!progress) {
    return (
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
            <Calendar className="text-indigo-500 mr-2" size={20} />
            Tiến độ tuần này
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400">
            Đang tải dữ liệu...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tính toán các chỉ số tuần
  const weeklyWordsGoal = progress.dailyGoal * 7;
  const weeklyWordsProgress = progress.wordsLearnedToday * 7; // Giả sử mỗi ngày học như hôm nay
  const weeklyWordsPercentage = Math.min(
    (weeklyWordsProgress / weeklyWordsGoal) * 100,
    100,
  );

  const weeklyPomodoroGoal = 14; // 2 pomodoro mỗi ngày
  const weeklyPomodoroProgress = progress.pomodorosCompletedToday * 7;
  const weeklyPomodoroPercentage = Math.min(
    (weeklyPomodoroProgress / weeklyPomodoroGoal) * 100,
    100,
  );

  const weeklyHabitGoal = progress.totalHabits * 7;
  const weeklyHabitProgress = progress.weeklyHabitProgress;
  const weeklyHabitPercentage =
    weeklyHabitGoal > 0
      ? Math.min((weeklyHabitProgress / weeklyHabitGoal) * 100, 100)
      : 0;

  // Tính streak và level progress
  const levelProgress = (progress.xp % 1000) / 10; // Giả sử mỗi level cần 1000 XP
  const nextLevelXP = 1000 - (progress.xp % 1000);

  return (
    <div className="space-y-4">
      {/* Weekly Overview */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
            <Calendar className="text-indigo-500 mr-2" size={20} />
            Tiến độ tuần này
          </CardTitle>
          <CardDescription>
            Tổng quan hoạt động học tập trong tuần
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {weeklyWordsProgress}
              </div>
              <div className="text-sm text-gray-500">Từ vựng</div>
              <div className="text-xs text-gray-400">/ {weeklyWordsGoal}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {weeklyPomodoroProgress}
              </div>
              <div className="text-sm text-gray-500">Pomodoro</div>
              <div className="text-xs text-gray-400">
                / {weeklyPomodoroGoal}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {weeklyHabitProgress}
              </div>
              <div className="text-sm text-gray-500">Thói quen</div>
              <div className="text-xs text-gray-400">/ {weeklyHabitGoal}</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Từ vựng
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(weeklyWordsPercentage)}%
                </span>
              </div>
              <Progress value={weeklyWordsPercentage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pomodoro
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(weeklyPomodoroPercentage)}%
                </span>
              </div>
              <Progress value={weeklyPomodoroPercentage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Thói quen
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(weeklyHabitPercentage)}%
                </span>
              </div>
              <Progress value={weeklyHabitPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level & Streak */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
            <TrendingUp className="text-purple-500 mr-2" size={20} />
            Thành tích
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Target className="text-purple-500" size={16} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Level {progress.level}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {progress.xp} XP
              </Badge>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">
              Còn {nextLevelXP} XP để lên Level {progress.level + 1}
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="text-yellow-500" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Chuỗi ngày học
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-yellow-600 dark:text-yellow-400"
            >
              {progress.streak} ngày
            </Badge>
          </div>

          {/* Current Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="text-blue-500" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Chuỗi Pomodoro
              </span>
            </div>
            <Badge variant="outline" className="text-red-600 dark:text-red-400">
              {progress.currentStreak} ngày
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals Status */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
            <Target className="text-green-500 mr-2" size={20} />
            Mục tiêu hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Từ vựng: {progress.dailyProgress}/{progress.dailyGoal}
              </span>
              <Badge
                variant={
                  progress.dailyProgress >= progress.dailyGoal
                    ? 'default'
                    : 'secondary'
                }
                className={
                  progress.dailyProgress >= progress.dailyGoal
                    ? 'bg-green-500'
                    : ''
                }
              >
                {progress.dailyProgress >= progress.dailyGoal
                  ? 'Hoàn thành'
                  : 'Chưa hoàn thành'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Pomodoro: {progress.pomodorosCompletedToday}/2
              </span>
              <Badge
                variant={
                  progress.pomodorosCompletedToday >= 2
                    ? 'default'
                    : 'secondary'
                }
                className={
                  progress.pomodorosCompletedToday >= 2 ? 'bg-red-500' : ''
                }
              >
                {progress.pomodorosCompletedToday >= 2
                  ? 'Hoàn thành'
                  : 'Chưa hoàn thành'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Thói quen: {progress.habitsCompletedToday}/
                {progress.totalHabits}
              </span>
              <Badge
                variant={
                  progress.habitsCompletedToday >= progress.totalHabits
                    ? 'default'
                    : 'secondary'
                }
                className={
                  progress.habitsCompletedToday >= progress.totalHabits
                    ? 'bg-green-500'
                    : ''
                }
              >
                {progress.habitsCompletedToday >= progress.totalHabits
                  ? 'Hoàn thành'
                  : 'Chưa hoàn thành'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
