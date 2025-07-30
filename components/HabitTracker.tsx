import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Check, Plus, Calendar, TrendingUp, Target, BookOpen, Headphones, Loader2 } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface HabitTrackerProps {
  user: any;
}

export function HabitTracker({ user }: HabitTrackerProps) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    if (!user.accessToken) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1d3b8ecf/habits`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const { habits: serverHabits } = await response.json();
        
        // Add icons and colors to habits
        const habitsWithIcons = serverHabits.map((habit, index) => ({
          ...habit,
          icon: index === 0 ? BookOpen : Headphones,
          color: index === 0 ? 'text-blue-600' : 'text-green-600',
          bgColor: index === 0 ? 'bg-blue-100' : 'bg-green-100',
        }));
        
        setHabits(habitsWithIcons);
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
    }
  };

  const toggleHabitCompletion = async (habitId: number) => {
    if (!user.accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1d3b8ecf/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const { habits: updatedHabits } = await response.json();
        
        // Add icons and colors to updated habits
        const habitsWithIcons = updatedHabits.map((habit, index) => ({
          ...habit,
          icon: index === 0 ? BookOpen : Headphones,
          color: index === 0 ? 'text-blue-600' : 'text-green-600',
          bgColor: index === 0 ? 'bg-blue-100' : 'bg-green-100',
        }));
        
        setHabits(habitsWithIcons);
      } else {
        console.error('Failed to toggle habit');
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    } finally {
      setLoading(false);
    }
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
            <Card key={habit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl ${habit.bgColor} flex items-center justify-center mr-4`}>
                      <Icon className={`h-6 w-6 ${habit.color}`} />
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
                              ? 'bg-green-500 text-white' 
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
                  onClick={() => toggleHabitCompletion(habit.id)}
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