import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Check, Plus, Calendar, TrendingUp, Target, BookOpen, Headphones, Loader2, ArrowLeft } from 'lucide-react';
import { firebase } from '../utils/firebase/client';
import { auth, db } from '../utils/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { HabitStreakChart } from './HabitStreakChart';

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

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    if (!user.accessToken || !auth.currentUser) return;

    try {
      const habitsRef = collection(db, "habits");
      const q = query(habitsRef, where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const serverHabits: any[] = [];
      querySnapshot.forEach((doc) => {
        serverHabits.push({ 
          id: doc.id,
          ...doc.data()
        });
      });
        
        // Add icons and colors to habits
        const habitsWithIcons = serverHabits.map((habit, index) => ({
          ...habit,
          icon: index === 0 ? BookOpen : Headphones,
        color: index === 0 ? 'bg-blue-500' : 'bg-green-500',
          bgColor: index === 0 ? 'bg-blue-100' : 'bg-green-100',
        textColor: index === 0 ? 'text-blue-600' : 'text-green-600',
        }));
        
        setHabits(habitsWithIcons);
    } catch (error) {
      console.error('Failed to load habits:', error);
      
      // Mock data for demo
      const mockHabits = [
        {
          id: "1",
          title: "Học từ vựng mỗi ngày",
          description: "Học ít nhất 10 từ mới mỗi ngày",
          currentStreak: 5,
          todayCompleted: true,
          weeklyProgress: [true, true, true, true, true, false, false],
          monthlyProgress: generateMockMonthData(5),
          icon: BookOpen,
          color: 'bg-blue-500',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
        },
        {
          id: "2",
          title: "Luyện nghe mỗi ngày",
          description: "Nghe ít nhất 10 phút tiếng Anh mỗi ngày",
          currentStreak: 3,
          todayCompleted: false,
          weeklyProgress: [true, true, true, false, false, false, false],
          monthlyProgress: generateMockMonthData(3),
          icon: Headphones,
          color: 'bg-green-500',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
        }
      ];
      setHabits(mockHabits);
    }
  };

  // Tạo dữ liệu giả cho biểu đồ 30 ngày
  function generateMockMonthData(currentStreak: number) {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
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

  const toggleHabitCompletion = async (habitId: string) => {
    if (!user.accessToken || !auth.currentUser) return;

    setLoading(true);
    try {
      // Find the habit to toggle
      const habitToToggle = habits.find(h => h.id === habitId);
      if (!habitToToggle) return;
      
      // Update in Firestore
      const habitRef = doc(db, "habits", habitId);
      await updateDoc(habitRef, {
        todayCompleted: !habitToToggle.todayCompleted,
        // Update streak and weekly progress as needed
        currentStreak: habitToToggle.todayCompleted 
          ? Math.max(0, habitToToggle.currentStreak - 1) 
          : habitToToggle.currentStreak + 1
      });
      
      // Update local state
      const updatedHabits = habits.map(habit => 
        habit.id === habitId 
          ? { 
              ...habit, 
              todayCompleted: !habit.todayCompleted,
              currentStreak: habit.todayCompleted 
                ? Math.max(0, habit.currentStreak - 1) 
                : habit.currentStreak + 1,
              // Update weekly progress for today
              weeklyProgress: habit.weeklyProgress.map((day, index) => 
                index === habit.weeklyProgress.length - 1 ? !habit.todayCompleted : day
              ),
              // Update monthly progress for today
              monthlyProgress: habit.monthlyProgress.map((day, index) => 
                index === new Date().getDate() - 1 ? !habit.todayCompleted : day
              )
            } 
          : habit
      );
      
      setHabits(updatedHabits);
      
      // Update selected habit if in detail view
      if (selectedHabit && selectedHabit.id === habitId) {
        setSelectedHabit(updatedHabits.find(h => h.id === habitId) || null);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    } finally {
      setLoading(false);
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
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  if (currentView === 'detail' && selectedHabit) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-20">
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
            <div className={`w-12 h-12 rounded-xl ${selectedHabit.bgColor} flex items-center justify-center mr-4`}>
              <selectedHabit.icon className={`h-6 w-6 ${selectedHabit.textColor}`} />
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
              <div className={`w-16 h-16 rounded-full ${selectedHabit.color} flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{selectedHabit.currentStreak}</span>
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
            <div className="flex space-x-1">
              {selectedHabit.weeklyProgress.map((completed, index) => (
                <div key={index} className="flex-1 text-center">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                      completed 
                        ? selectedHabit.color + ' text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {completed && <Check className="h-4 w-4" />}
                  </div>
                  <span className="text-xs text-gray-500">{getDayLabel(index)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={() => toggleHabitCompletion(selectedHabit.id)}
          disabled={loading}
          className={`w-full rounded-xl ${
            selectedHabit.todayCompleted
              ? 'bg-green-600 hover:bg-green-700 text-white'
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
    <div className="h-full overflow-y-auto p-6 pb-20">
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
            {completedToday}/{totalHabits} thói quen đã hoàn thành
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="mb-2" />
          <p className="text-sm text-green-600">
            {Math.round(completionRate)}% hoàn thành
          </p>
        </CardContent>
      </Card>

      {/* Habit List */}
      <div className="space-y-4 mb-6">
        {habits.map((habit) => {
          const Icon = habit.icon;
          const completedDays = habit.weeklyProgress?.filter(Boolean).length || 0;
          
          return (
            <Card 
              key={habit.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => viewHabitDetail(habit)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl ${habit.bgColor} flex items-center justify-center mr-4`}>
                      <Icon className={`h-6 w-6 ${habit.textColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">{habit.title}</CardTitle>
                      <CardDescription>{habit.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={habit.todayCompleted ? "default" : "secondary"}>
                    {habit.currentStreak || 0} ngày
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Weekly Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">7 ngày qua</span>
                    <span className="text-sm text-gray-600">{completedDays}/7 ngày</span>
                  </div>
                  <div className="flex space-x-1">
                    {(habit.weeklyProgress || [false, false, false, false, false, false, false]).map((completed, index) => (
                      <div key={index} className="flex-1 text-center">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                            completed 
                              ? habit.color + ' text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {completed && <Check className="h-4 w-4" />}
                        </div>
                        <span className="text-xs text-gray-500">{getDayLabel(index)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    toggleHabitCompletion(habit.id);
                  }}
                  disabled={loading}
                  className={`w-full rounded-xl ${
                    habit.todayCompleted
                      ? 'bg-green-600 hover:bg-green-700 text-white'
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

      {/* Add New Habit Button */}
      <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
        <Plus className="h-4 w-4 mr-2" />
        Thêm thói quen mới
      </Button>
    </div>
  );
}