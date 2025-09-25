import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import Button from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import {
  BookOpen,
  Clock,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  Play,
  Brain,
  Coffee,
  Star,
} from 'lucide-react';
import { useQuickActions } from '../../../hooks/useDashboardIntegration';
import { IntegratedProgress } from '../../../services/dashboard/integrationService';

interface QuickActionsProps {
  user: any;
  progress: IntegratedProgress | null;
  onTabChange?: (tab: string) => void;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  action: () => Promise<void>;
  disabled?: boolean;
  xpReward?: number;
}

export function QuickActions({
  user,
  progress,
  onTabChange,
}: QuickActionsProps) {
  const {
    handleQuickFlashcardReview,
    handleQuickPomodoro,
    handleQuickHabitCheck,
  } = useQuickActions(user);
  const [loading, setLoading] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<any>, actionId: string) => {
    try {
      setLoading(actionId);
      setLastActionResult(null);

      const result = await action();

      if (result.success) {
        setLastActionResult(result.message);
        // Clear message after 3 seconds
        setTimeout(() => setLastActionResult(null), 3000);
      }
    } catch (error) {
      console.error('Quick action error:', error);
      setLastActionResult('Có lỗi xảy ra khi thực hiện hành động');
    } finally {
      setLoading(null);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'flashcard-review',
      title: 'Ôn tập nhanh',
      description: 'Học 5 từ vựng trong 10 phút',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      action: () => handleQuickFlashcardReview(5),
      xpReward: 25,
    },
    {
      id: 'pomodoro-focus',
      title: 'Tập trung 25 phút',
      description: 'Hoàn thành 1 Pomodoro',
      icon: Clock,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      action: () => handleQuickPomodoro(1),
      xpReward: 40,
    },
    {
      id: 'habit-check',
      title: 'Đánh dấu thói quen',
      description: 'Hoàn thành thói quen hôm nay',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      action: async () => {
        // Tìm habit đầu tiên chưa hoàn thành
        if (progress && progress.totalHabits > 0) {
          // Giả sử habitId là 'default' - trong thực tế sẽ lấy từ danh sách habits
          await handleQuickHabitCheck('default');
        }
      },
      disabled: !progress || progress.totalHabits === 0,
      xpReward: 15,
    },
    {
      id: 'intensive-study',
      title: 'Học tập chuyên sâu',
      description: '2 Pomodoro + 10 từ vựng',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      action: async () => {
        await handleQuickPomodoro(2);
        await handleQuickFlashcardReview(10);
      },
      xpReward: 80,
    },
  ];

  const progressPercentage = progress
    ? Math.min((progress.dailyProgress / progress.dailyGoal) * 100, 100)
    : 0;

  const remainingWords = progress
    ? Math.max(0, progress.dailyGoal - progress.dailyProgress)
    : 20;

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
            <Target className="text-blue-500 mr-2" size={20} />
            Tiến độ hôm nay
          </CardTitle>
          <CardDescription>
            Bạn đã học {progress?.dailyProgress || 0}/
            {progress?.dailyGoal || 20} từ vựng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{Math.round(progressPercentage)}% hoàn thành</span>
              <span>Còn {remainingWords} từ</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {progress?.wordsLearnedToday || 0}
              </div>
              <div className="text-xs text-gray-500">Từ vựng</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {progress?.pomodorosCompletedToday || 0}
              </div>
              <div className="text-xs text-gray-500">Pomodoro</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {progress?.habitsCompletedToday || 0}
              </div>
              <div className="text-xs text-gray-500">Thói quen</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
            <Zap className="text-yellow-500 mr-2" size={20} />
            Hoạt động nhanh
          </CardTitle>
          <CardDescription>
            Bắt đầu học tập ngay với các hoạt động được đề xuất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => {
              const Icon = action.icon;
              const isLoading = loading === action.id;

              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.bgColor} hover:opacity-80 transition-all duration-200`}
                  onClick={() => handleAction(action.action, action.id)}
                  disabled={isLoading || action.disabled}
                >
                  <div className="flex items-center space-x-2">
                    <Icon
                      className={`${action.color} ${isLoading ? 'animate-pulse' : ''}`}
                      size={20}
                    />
                    {action.xpReward && (
                      <Badge variant="secondary" className="text-xs">
                        +{action.xpReward} XP
                      </Badge>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Success Message */}
          {lastActionResult && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-green-700 dark:text-green-300">
                  {lastActionResult}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation to Features */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
            <TrendingUp className="text-indigo-500 mr-2" size={20} />
            Tính năng chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-blue-50 dark:bg-blue-900/20 hover:opacity-80"
              onClick={() => onTabChange?.('flashcards')}
            >
              <BookOpen className="text-blue-500" size={20} />
              <div className="text-center">
                <div className="font-medium text-sm">Flashcard</div>
                <div className="text-xs text-gray-500">
                  {progress?.flashcardsCompleted || 0} đã học
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-red-50 dark:bg-red-900/20 hover:opacity-80"
              onClick={() => onTabChange?.('pomodoro')}
            >
              <Clock className="text-red-500" size={20} />
              <div className="text-center">
                <div className="font-medium text-sm">Pomodoro</div>
                <div className="text-xs text-gray-500">
                  {progress?.totalFocusTimeMinutes || 0} phút
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-50 dark:bg-green-900/20 hover:opacity-80"
              onClick={() => onTabChange?.('habits')}
            >
              <CheckCircle className="text-green-500" size={20} />
              <div className="text-center">
                <div className="font-medium text-sm">Thói quen</div>
                <div className="text-xs text-gray-500">
                  {progress?.habitsCompletedToday || 0}/
                  {progress?.totalHabits || 0}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
