import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import {
  Check,
  Plus,
  Calendar,
  TrendingUp,
  Target,
  BookOpen,
  Headphones,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Dumbbell,
  Coffee,
  Moon,
  Heart,
  Brain,
  Clock,
  Zap,
  Smile,
  Star,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { HabitStreakChart } from './HabitStreakChart';
import { CreateHabitForm } from './CreateHabitForm';
import { HabitPomodoroStats } from './HabitPomodoroStats';
import { useHabitPomodoroIntegration } from '../../../hooks/useHabitPomodoroIntegration';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { auth, db } from '../../../services/firebase/config';
import {
  getUserTimeZone,
  isSameCalendarDay,
  getWeekdayIndexMondayFirst,
  getMonthDayIndexZeroBased,
} from '../../../utils/date';

interface HabitTrackerProps {
  user: any;
  onTabChange?: (tab: string) => void;
}

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  currentStreak: number;
  todayCompleted: boolean;
  weeklyProgress: boolean[];
  monthlyProgress: boolean[];
}

export function HabitTracker({ user, onTabChange }: HabitTrackerProps) {
  // onTabChange is available for future navigation features
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Pomodoro integration
  const { habitStats } = useHabitPomodoroIntegration(user);

  // Định nghĩa hàm loadHabits
  const loadHabits = async () => {
    if (!user.accessToken || !auth.currentUser) {
      // Nếu không có người dùng, không hiển thị dữ liệu mẫu
      setHabits([]);
      return;
    }

    try {
      // Thử tải thói quen từ Firestore
      const habitsRef = collection(db, 'habits');
      const q = query(habitsRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      const serverHabits: any[] = [];
      querySnapshot.forEach(doc => {
        serverHabits.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Thêm biểu tượng và màu sắc cho thói quen
      const habitsWithIcons = serverHabits.map(habit => {
        // Nếu habit đã có đầy đủ thông tin từ form mới
        if (habit.iconName && habit.color && habit.bgColor && habit.textColor) {
          // Map icon name to actual icon component
          const iconMap: { [key: string]: any } = {
            BookOpen,
            Headphones,
            Dumbbell,
            Coffee,
            Moon,
            Heart,
            Brain,
            Target,
            Clock,
            Zap,
            Smile,
            Star,
          };

          return {
            ...habit,
            icon: iconMap[habit.iconName] || BookOpen,
          };
        }

        // Legacy support: xác định icon dựa trên loại thói quen cũ
        let icon = BookOpen;
        let color = 'bg-blue-500';
        let bgColor = 'bg-blue-100 dark:bg-blue-900/50';
        let textColor = 'text-blue-600 dark:text-blue-400';

        if (habit.type === 'listening') {
          icon = Headphones;
          color = 'bg-green-500';
          bgColor = 'bg-green-100 dark:bg-green-900/50';
          textColor = 'text-green-600 dark:text-green-400';
        }

        return {
          ...habit,
          icon,
          color,
          bgColor,
          textColor,
        };
      });

      // Reset trạng thái hôm nay nếu đã qua ngày mới theo múi giờ người dùng
      const now = new Date();
      const tz = getUserTimeZone();
      const adjustedDayOfWeek = getWeekdayIndexMondayFirst(now, tz);
      const dayOfMonth = getMonthDayIndexZeroBased(now, tz); // 0-indexed

      const habitsToReset: {
        id: string;
        weeklyProgress: boolean[];
        monthlyProgress: boolean[];
      }[] = [];

      const normalizedHabits = habitsWithIcons.map(h => {
        const lastUpdatedRaw = (h as any)?.lastUpdated;
        const lastUpdatedDate = lastUpdatedRaw?.toDate
          ? lastUpdatedRaw.toDate()
          : lastUpdatedRaw
            ? new Date(lastUpdatedRaw)
            : null;
        const isSameDay = lastUpdatedDate
          ? isSameCalendarDay(lastUpdatedDate, now, tz)
          : false;

        if (!isSameDay && h.todayCompleted) {
          const newWeekly = [
            ...(h.weeklyProgress || [
              false,
              false,
              false,
              false,
              false,
              false,
              false,
            ]),
          ];
          newWeekly[adjustedDayOfWeek] = false;

          const newMonthly = [
            ...(h.monthlyProgress || Array(30).fill(false)),
          ] as boolean[];
          newMonthly[dayOfMonth] = false;

          habitsToReset.push({
            id: h.id,
            weeklyProgress: newWeekly,
            monthlyProgress: newMonthly,
          });

          return {
            ...h,
            todayCompleted: false,
            weeklyProgress: newWeekly,
            monthlyProgress: newMonthly,
          } as typeof h;
        }
        return h;
      });

      setHabits(normalizedHabits);

      // Đồng bộ Firestore (không chặn UI)
      if (habitsToReset.length > 0 && auth.currentUser) {
        try {
          await Promise.all(
            habitsToReset.map(item =>
              updateDoc(doc(db, 'habits', item.id), {
                todayCompleted: false,
                weeklyProgress: item.weeklyProgress,
                monthlyProgress: item.monthlyProgress,
                lastUpdated: Timestamp.now(),
              }),
            ),
          );
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to reset habits for new day:', err);
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load habits:', error);
      }

      // Nếu có lỗi, hiển thị danh sách trống
      setHabits([]);
    }
  };

  // Tạo thói quen mới
  const createHabit = async (habitData: {
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    textColor: string;
  }) => {
    if (!auth.currentUser) return;

    setCreateLoading(true);
    try {
      const habitsRef = collection(db, 'habits');

      const newHabit = {
        userId: auth.currentUser.uid,
        title: habitData.title,
        description: habitData.description,
        currentStreak: 0,
        todayCompleted: false,
        weeklyProgress: [false, false, false, false, false, false, false],
        monthlyProgress: Array(30).fill(false),
        createdAt: Timestamp.now(),
        // Lưu tên icon thay vì component (để có thể serialize)
        iconName: habitData.icon.name || 'BookOpen',
        color: habitData.color,
        bgColor: habitData.bgColor,
        textColor: habitData.textColor,
      };

      await addDoc(habitsRef, newHabit);

      // Đóng form và tải lại thói quen
      setCreateFormOpen(false);
      loadHabits();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create habit:', error);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    // Call loadHabits when the component mounts or user changes
    loadHabits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.accessToken]);

  const viewHabitDetail = (habit: Habit) => {
    setSelectedHabit(habit);
    setCurrentView('detail');
  };

  const getDayLabel = (index: number) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date().getDay();
    const dayIndex = (today - 6 + index) % 7;
    return days[dayIndex < 0 ? dayIndex + 7 : dayIndex];
  };

  const completedToday = habits.filter(h => h.todayCompleted).length;
  const totalHabits = habits.length;
  const completionRate =
    totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Hàm xóa thói quen
  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;

    try {
      // Xóa khỏi state
      setHabits(habits.filter(habit => habit.id !== habitToDelete.id));

      // Xóa khỏi Firestore nếu có auth.currentUser và không phải habit local
      if (
        auth.currentUser &&
        habitToDelete.id &&
        !habitToDelete.id.startsWith('local-')
      ) {
        try {
          await deleteDoc(doc(db, 'habits', habitToDelete.id));
          // Chỉ log trong môi trường development
          if (process.env.NODE_ENV === 'development') {
            console.log(`Deleted habit ${habitToDelete.id} from Firestore`);
          }
        } catch (error) {
          // Chỉ log trong môi trường development
          if (process.env.NODE_ENV === 'development') {
            console.error('Error deleting habit from Firestore:', error);
          }
        }
      }

      // Đóng dialog
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
    } catch (error) {
      // Chỉ log trong môi trường development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  if (currentView === 'detail' && selectedHabit) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-32 md:pb-24 relative bg-white dark:bg-black">
        {/* Fixed Add New Habit Button */}
        <div className="fixed bottom-24 md:bottom-6 right-6 left-6 z-10">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-xl shadow-lg text-white"
            onClick={() => setCurrentView('list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('list')}
            className="pl-0 text-blue-600 dark:text-blue-400 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-xl ${selectedHabit.bgColor} flex items-center justify-center mr-4`}
            >
              <selectedHabit.icon
                className={`h-6 w-6 ${selectedHabit.textColor}`}
              />
            </div>
            <div>
              <h1 className="text-blue-900 dark:text-blue-100 mb-1">
                {selectedHabit.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedHabit.description}
              </p>
            </div>
          </div>
        </div>

        {/* Streak Status */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-900 dark:text-blue-100 mb-1">
                  Streak hiện tại
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  {selectedHabit.currentStreak} ngày liên tiếp
                </p>
              </div>
              <div
                className={`w-16 h-16 rounded-full ${selectedHabit.color} flex items-center justify-center`}
              >
                <span className="text-white text-xl font-bold">
                  {selectedHabit.currentStreak}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 30-day Chart */}
        <div className="mb-6">
          <HabitStreakChart
            habitId={selectedHabit.id}
            title="Thống kê 30 ngày"
            monthlyData={selectedHabit.monthlyProgress}
            color={selectedHabit.color}
            textColor={selectedHabit.textColor}
          />
        </div>

        {/* 7-day Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-0">
              {selectedHabit.weeklyProgress.map((completed, index) => (
                <div key={index} className="flex-1 text-center">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                      completed
                        ? selectedHabit.color + ' text-white'
                        : 'bg-gray-200 dark:bg-studyflow-surface text-gray-400 dark:text-gray-300'
                    } transition-all duration-200`}
                  >
                    {completed && <Check className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
                    {getDayLabel(index)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pomodoro Statistics */}
        <div className="mb-6">
          <HabitPomodoroStats
            habitColor={selectedHabit.color}
            stats={habitStats.find(stat => stat.habitId === selectedHabit.id)}
            onViewDetails={() => {
              // TODO: Implement detailed Pomodoro statistics modal
              console.log('View Pomodoro details for habit:', selectedHabit.id);
            }}
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onTabChange?.('pomodoro')}
          disabled={selectedHabit.todayCompleted}
          className={`w-full rounded-xl transition-all duration-300 ${
            selectedHabit.todayCompleted
              ? 'bg-green-600 hover:bg-green-700 text-white scale-100'
              : 'bg-gray-100 dark:bg-studyflow-surface hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          {selectedHabit.todayCompleted ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Đã hoàn thành
            </>
          ) : (
            'Hoàn thành qua Pomodoro'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 pb-32 md:pb-24 relative bg-white dark:bg-black">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Thói quen học tập
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Xây dựng thói quen học đều đặn mỗi ngày
          </p>
        </div>
        <Button
          onClick={() => setCreateFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm thói quen
        </Button>
      </div>

      {/* Today's Progress */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center text-green-900 dark:text-green-100">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Tiến trình hôm nay
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            {habits.length > 0
              ? `${completedToday}/${totalHabits} thói quen đã hoàn thành`
              : 'Chưa có thói quen nào để theo dõi'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {habits.length > 0 ? (
            <>
              <Progress value={completionRate} className="mb-4" />
              <p className="text-sm text-green-600 mb-4">
                {Math.round(completionRate)}% hoàn thành
              </p>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đánh dấu nhanh:
                </h3>
                <div className="space-y-2">
                  {habits.map(habit => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        habit.todayCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-white dark:bg-studyflow-surface border-gray-200 dark:border-gray-700'
                      } transition-all duration-200`}
                    >
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => viewHabitDetail(habit)}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${habit.bgColor} flex items-center justify-center mr-3`}
                        >
                          <habit.icon
                            className={`h-4 w-4 ${habit.textColor}`}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            habit.todayCompleted
                              ? 'text-green-700'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {habit.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full w-8 h-8 p-0 ${
                          habit.todayCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-studyflow-surface text-gray-500 dark:text-gray-300'
                        }`}
                        onClick={() => onTabChange?.('pomodoro')}
                        title="Hoàn thành qua Pomodoro"
                        disabled={habit.todayCompleted}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Thêm thói quen mới để bắt đầu theo dõi tiến trình học tập của
                bạn
              </p>
              <Button
                onClick={() => setCreateFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo thói quen mới
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habit list is now in the conditional rendering below */}

      {/* Habit list or empty state */}
      {habits.length === 0 ? (
        <Card className="mb-6 border-dashed border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-studyflow-surface">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Chưa có thói quen nào
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1 mb-4">
                  Thêm thói quen mới để bắt đầu theo dõi tiến trình học tập của
                  bạn
                </p>
                <Button
                  onClick={() => setCreateFormOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo thói quen mới
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-6">
          {habits.map(habit => {
            const Icon = habit.icon;
            const completedDays =
              habit.weeklyProgress?.filter(Boolean).length || 0;

            return (
              <Card
                id={`habit-card-${habit.id}`}
                key={habit.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer habit-card border border-gray-200 dark:border-gray-700 bg-white dark:bg-studyflow-surface focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:outline-none"
                onClick={() => viewHabitDetail(habit)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    viewHabitDetail(habit);
                  }
                }}
              >
                <CardHeader className="pb-3 bg-transparent">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-12 rounded-xl ${habit.bgColor} flex items-center justify-center mr-4`}
                      >
                        <Icon className={`h-6 w-6 ${habit.textColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900 dark:text-gray-100">
                          {habit.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          {habit.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={habit.todayCompleted ? 'default' : 'secondary'}
                      >
                        {habit.currentStreak || 0} ngày
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
                        onClick={e => {
                          e.stopPropagation();
                          setHabitToDelete(habit);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="bg-transparent">
                  {/* Weekly Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        7 ngày qua
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {completedDays}/7 ngày
                      </span>
                    </div>
                    <div className="flex space-x-0">
                      {(
                        habit.weeklyProgress || [
                          false,
                          false,
                          false,
                          false,
                          false,
                          false,
                          false,
                        ]
                      ).map((completed, index) => (
                        <div key={index} className="flex-1 text-center">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                              completed
                                ? habit.color + ' text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300'
                            } transition-all duration-200`}
                          >
                            {completed && <Check className="h-5 w-5" />}
                          </div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
                            {getDayLabel(index)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      onTabChange?.('pomodoro');
                    }}
                    disabled={habit.todayCompleted}
                    className={`w-full rounded-xl transition-all duration-300 ${
                      habit.todayCompleted
                        ? 'bg-green-600 hover:bg-green-700 text-white scale-100'
                        : 'bg-gray-100 dark:bg-studyflow-surface hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {habit.todayCompleted ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Đã hoàn thành
                      </>
                    ) : (
                      'Hoàn thành qua Pomodoro'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog xác nhận xóa thói quen */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thói quen &quot;{habitToDelete?.title}
              &quot;? Hành động này không thể hoàn tác và tất cả dữ liệu theo
              dõi sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              onClick={() => handleDeleteHabit()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Habit Form */}
      <CreateHabitForm
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        onCreateHabit={createHabit}
        loading={createLoading}
      />
    </div>
  );
}
