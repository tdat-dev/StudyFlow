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
  Loader2,
  ArrowLeft,
  Trash2,
  AlertTriangle,
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

interface HabitTrackerProps {
  user: any;
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

export function HabitTracker({ user }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  // Tạo dữ liệu giả cho biểu đồ 30 ngày
  function generateMockMonthData(currentStreak: number) {
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    const result = Array(daysInMonth).fill(false);

    // Đánh dấu các ngày đã hoàn thành (giả lập)
    for (let i = 0; i < daysInMonth; i++) {
      // Ngày hiện tại và các ngày trước đó trong streak hiện tại
      if (i < today.getDate() && i >= today.getDate() - currentStreak) {
        result[i] = true;
      }
      // Một số ngày ngẫu nhiên trong tháng
      else if (i < today.getDate() && Math.random() > 0.6) {
        result[i] = true;
      }
    }

    return result;
  }

  // Tạo dữ liệu mẫu cho thói quen
  const loadMockHabits = () => {
    const mockHabits = [
      {
        id: '1',
        title: 'Học từ vựng mỗi ngày',
        description: 'Học ít nhất 10 từ mới mỗi ngày',
        currentStreak: 5,
        todayCompleted: true,
        weeklyProgress: [true, true, true, true, true, false, false],
        monthlyProgress: generateMockMonthData(5),
        icon: BookOpen,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        type: 'vocabulary',
      },
      {
        id: '2',
        title: 'Luyện nghe mỗi ngày',
        description: 'Nghe ít nhất 10 phút tiếng Anh mỗi ngày',
        currentStreak: 3,
        todayCompleted: false,
        weeklyProgress: [true, true, true, false, false, false, false],
        monthlyProgress: generateMockMonthData(3),
        icon: Headphones,
        color: 'bg-green-500',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        type: 'listening',
      },
    ];
    setHabits(mockHabits);
  };

  // Định nghĩa hàm loadHabits
  const loadHabits = async () => {
    if (!user.accessToken || !auth.currentUser) {
      // Nếu không có người dùng, hiển thị dữ liệu mẫu
      loadMockHabits();
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

      // Nếu không có thói quen nào, tạo dữ liệu mẫu và lưu vào Firestore
      if (serverHabits.length === 0) {
        await createDefaultHabits();
        return;
      }

      // Thêm biểu tượng và màu sắc cho thói quen
      const habitsWithIcons = serverHabits.map(habit => {
        // Xác định icon dựa trên loại thói quen
        let icon = BookOpen;
        let color = 'bg-blue-500';
        let bgColor = 'bg-blue-100';
        let textColor = 'text-blue-600';

        if (habit.type === 'listening') {
          icon = Headphones;
          color = 'bg-green-500';
          bgColor = 'bg-green-100';
          textColor = 'text-green-600';
        }

        return {
          ...habit,
          icon,
          color,
          bgColor,
          textColor,
        };
      });

      setHabits(habitsWithIcons);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load habits:', error);
      }

      // Nếu có lỗi, hiển thị dữ liệu mẫu
      loadMockHabits();
    }
  };

  // Tạo thói quen mặc định và lưu vào Firestore
  const createDefaultHabits = async () => {
    if (!auth.currentUser) return;

    try {
      const habitsRef = collection(db, 'habits');

      // Thói quen học từ vựng
      const vocabularyHabit = {
        userId: auth.currentUser.uid,
        title: 'Học từ vựng mỗi ngày',
        description: 'Học ít nhất 10 từ mới mỗi ngày',
        currentStreak: 0,
        todayCompleted: false,
        weeklyProgress: [false, false, false, false, false, false, false],
        monthlyProgress: Array(30).fill(false),
        createdAt: Timestamp.now(),
        type: 'vocabulary',
      };

      // Thói quen luyện nghe
      const listeningHabit = {
        userId: auth.currentUser.uid,
        title: 'Luyện nghe mỗi ngày',
        description: 'Nghe ít nhất 10 phút tiếng Anh mỗi ngày',
        currentStreak: 0,
        todayCompleted: false,
        weeklyProgress: [false, false, false, false, false, false, false],
        monthlyProgress: Array(30).fill(false),
        createdAt: Timestamp.now(),
        type: 'listening',
      };

      // Lưu vào Firestore
      await Promise.all([
        addDoc(habitsRef, vocabularyHabit),
        addDoc(habitsRef, listeningHabit),
      ]);

      // Tải lại thói quen
      loadHabits();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create default habits:', error);
      }
      loadMockHabits();
    }
  };

  useEffect(() => {
    // Call loadHabits when the component mounts or user changes
    loadHabits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.accessToken]);

  const toggleHabitCompletion = async (habitId: string) => {
    // Nếu không có người dùng đăng nhập, chỉ cập nhật trạng thái local
    if (!user.accessToken || !auth.currentUser) {
      updateLocalHabitState(habitId);
      return;
    }

    setLoading(true);
    try {
      // Tìm thói quen cần cập nhật
      const habitToToggle = habits.find(h => h.id === habitId);
      if (!habitToToggle) return;

      // Nếu ID bắt đầu bằng "local-", đây là dữ liệu mẫu, chỉ cập nhật trạng thái local
      if (habitId.startsWith('local-')) {
        updateLocalHabitState(habitId);
        setLoading(false);
        return;
      }

      // Cập nhật trong Firestore
      const habitRef = doc(db, 'habits', habitId);

      // Lấy ngày hiện tại
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Chủ Nhật, 1-6 = Thứ 2-Thứ 7
      const dayOfMonth = today.getDate() - 1; // 0-29 (hoặc 0-30 tùy tháng)

      // Cập nhật trạng thái hoàn thành và streak
      const newTodayCompleted = !habitToToggle.todayCompleted;
      const newStreak = newTodayCompleted
        ? habitToToggle.currentStreak + 1
        : Math.max(0, habitToToggle.currentStreak - 1);

      // Cập nhật tiến độ hàng tuần và hàng tháng
      const newWeeklyProgress = [...habitToToggle.weeklyProgress];
      // Chuyển đổi từ Sunday = 0 sang định dạng mảng của chúng ta (0 = Thứ 2, 6 = Chủ Nhật)
      const adjustedDayOfWeek = (dayOfWeek + 6) % 7;
      newWeeklyProgress[adjustedDayOfWeek] = newTodayCompleted;

      const newMonthlyProgress = [...habitToToggle.monthlyProgress];
      newMonthlyProgress[dayOfMonth] = newTodayCompleted;

      // Cập nhật trong Firestore
      await updateDoc(habitRef, {
        todayCompleted: newTodayCompleted,
        currentStreak: newStreak,
        weeklyProgress: newWeeklyProgress,
        monthlyProgress: newMonthlyProgress,
        lastUpdated: Timestamp.now(),
      });

      // Cập nhật trạng thái local
      updateLocalHabitState(habitId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling habit:', error);
      }
      // Nếu có lỗi, vẫn cập nhật UI để trải nghiệm người dùng tốt hơn
      updateLocalHabitState(habitId);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái local của thói quen
  const updateLocalHabitState = (habitId: string) => {
    // Tìm thói quen cần cập nhật
    const habitToToggle = habits.find(h => h.id === habitId);
    if (!habitToToggle) return;

    // Lấy ngày hiện tại
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ Nhật, 1-6 = Thứ 2-Thứ 7
    const dayOfMonth = today.getDate() - 1; // 0-29 (hoặc 0-30 tùy tháng)

    // Cập nhật trạng thái hoàn thành và streak
    const newTodayCompleted = !habitToToggle.todayCompleted;
    const newStreak = newTodayCompleted
      ? habitToToggle.currentStreak + 1
      : Math.max(0, habitToToggle.currentStreak - 1);

    // Cập nhật tiến độ hàng tuần và hàng tháng
    const newWeeklyProgress = [...habitToToggle.weeklyProgress];
    // Chuyển đổi từ Sunday = 0 sang định dạng mảng của chúng ta (0 = Thứ 2, 6 = Chủ Nhật)
    const adjustedDayOfWeek = (dayOfWeek + 6) % 7;
    newWeeklyProgress[adjustedDayOfWeek] = newTodayCompleted;

    const newMonthlyProgress = [...habitToToggle.monthlyProgress];
    newMonthlyProgress[dayOfMonth] = newTodayCompleted;

    // Cập nhật state
    const updatedHabits = habits.map(habit =>
      habit.id === habitId
        ? {
            ...habit,
            todayCompleted: newTodayCompleted,
            currentStreak: newStreak,
            weeklyProgress: newWeeklyProgress,
            monthlyProgress: newMonthlyProgress,
          }
        : habit,
    );

    setHabits(updatedHabits);

    // Cập nhật selected habit nếu đang ở chế độ xem chi tiết
    if (selectedHabit && selectedHabit.id === habitId) {
      setSelectedHabit(updatedHabits.find(h => h.id === habitId) || null);
    }

    // Hiệu ứng phản hồi khi đánh dấu hoàn thành
    if (newTodayCompleted) {
      // Tìm phần tử DOM của habit card để thêm hiệu ứng
      const habitCard = document.getElementById(`habit-card-${habitId}`);
      if (habitCard) {
        // Thêm class animation và xóa sau khi animation kết thúc
        habitCard.classList.add('scale-[1.02]', 'bg-green-50', 'shadow-lg');
        setTimeout(() => {
          habitCard.classList.remove(
            'scale-[1.02]',
            'bg-green-50',
            'shadow-lg',
          );
        }, 800);
      }
    }
  };

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

  if (currentView === 'detail' && selectedHabit) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-24 relative bg-white dark:bg-black">
        {/* Fixed Add New Habit Button */}
        <div className="fixed bottom-6 right-6 left-6 z-10">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
            onClick={() => setCurrentView('list')}
            disabled={loading}
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
            className="pl-0 text-blue-600 mb-4"
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
              <h1 className="text-blue-900 mb-1">{selectedHabit.title}</h1>
              <p className="text-gray-600">{selectedHabit.description}</p>
            </div>
          </div>
        </div>

        {/* Streak Status */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-900 mb-1">Streak hiện tại</h3>
                <p className="text-blue-700 text-sm">
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
                <div
                  key={index}
                  className="flex-1 text-center"
                  onClick={e => {
                    e.stopPropagation();
                    // Update weekly progress for the selected day
                    const newWeeklyProgress = [...selectedHabit.weeklyProgress];
                    newWeeklyProgress[index] = !completed;
                    // Update the habit
                    toggleHabitCompletion(selectedHabit.id);
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                      completed
                        ? selectedHabit.color + ' text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    } cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95`}
                  >
                    {completed && <Check className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {getDayLabel(index)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={() => toggleHabitCompletion(selectedHabit.id)}
          disabled={loading}
          className={`w-full rounded-xl transition-all duration-300 ${
            selectedHabit.todayCompleted
              ? 'bg-green-600 hover:bg-green-700 text-white scale-100'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : selectedHabit.todayCompleted ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Đã hoàn thành
            </>
          ) : (
            'Đánh dấu hoàn thành'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 pb-24 relative bg-white dark:bg-black">
      {/* Fixed Add New Habit Button */}
      <div className="fixed bottom-6 right-6 left-6 z-10">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
          onClick={createDefaultHabits}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Thêm thói quen mới
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-blue-900 mb-2">Thói quen học tập</h1>
        <p className="text-gray-600">Xây dựng thói quen học đều đặn mỗi ngày</p>
      </div>

      {/* Today's Progress */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-900">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Tiến trình hôm nay
          </CardTitle>
          <CardDescription className="text-green-700">
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
                <h3 className="text-sm font-medium text-gray-700">
                  Đánh dấu nhanh:
                </h3>
                <div className="space-y-2">
                  {habits.map(habit => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        habit.todayCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      } transition-all duration-200`}
                    >
                      <div
                        className="flex items-center"
                        onClick={() => viewHabitDetail(habit)}
                        style={{ cursor: 'pointer' }}
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
                              : 'text-gray-700'
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
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleHabitCompletion(habit.id)}
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
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4">
                Thêm thói quen mới để bắt đầu theo dõi tiến trình học tập của
                bạn
              </p>
              <Button
                onClick={createDefaultHabits}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm thói quen mẫu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habit list is now in the conditional rendering below */}

      {/* Habit list or empty state */}
      {habits.length === 0 ? (
        <Card className="mb-6 border-dashed border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Chưa có thói quen nào
                </h3>
                <p className="text-gray-600 mt-1 mb-4">
                  Thêm thói quen mới để bắt đầu theo dõi tiến trình học tập của
                  bạn
                </p>
                <Button
                  onClick={createDefaultHabits}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thói quen mẫu
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
                className="hover:shadow-lg transition-shadow cursor-pointer habit-card"
                onClick={() => viewHabitDetail(habit)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-12 rounded-xl ${habit.bgColor} flex items-center justify-center mr-4`}
                      >
                        <Icon className={`h-6 w-6 ${habit.textColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">
                          {habit.title}
                        </CardTitle>
                        <CardDescription>{habit.description}</CardDescription>
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
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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

                <CardContent>
                  {/* Weekly Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">7 ngày qua</span>
                      <span className="text-sm text-gray-600">
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
                        <div
                          key={index}
                          className="flex-1 text-center"
                          onClick={e => {
                            e.stopPropagation();
                            // Update weekly progress for the selected day
                            const newWeeklyProgress = [...habit.weeklyProgress];
                            newWeeklyProgress[index] = !completed;
                            // Update the habit
                            toggleHabitCompletion(habit.id);
                          }}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                              completed
                                ? habit.color + ' text-white'
                                : 'bg-gray-200 text-gray-400'
                            } cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95`}
                          >
                            {completed && <Check className="h-5 w-5" />}
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {getDayLabel(index)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={e => {
                      e.stopPropagation(); // Prevent card click event
                      toggleHabitCompletion(habit.id);
                    }}
                    disabled={loading}
                    className={`w-full rounded-xl transition-all duration-300 ${
                      habit.todayCompleted
                        ? 'bg-green-600 hover:bg-green-700 text-white scale-100'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : habit.todayCompleted ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Đã hoàn thành
                      </>
                    ) : (
                      'Đánh dấu hoàn thành'
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
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleDeleteHabit()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

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
}
