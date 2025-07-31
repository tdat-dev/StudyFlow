import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from 'lucide-react';

interface HabitStreakChartProps {
  habitId: string;
  title: string;
  monthlyData: boolean[];
  color: string;
  textColor: string;
}

export function HabitStreakChart({
  habitId,
  title,
  monthlyData,
  color,
  textColor
}: HabitStreakChartProps) {
  // Lấy ngày hiện tại
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Tạo mảng các ngày trong tháng
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Tính toán streak hiện tại
  let currentStreak = 0;
  for (let i = monthlyData.length - 1; i >= 0; i--) {
    if (monthlyData[i]) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Tính toán streak dài nhất
  let longestStreak = 0;
  let currentCount = 0;
  for (let i = 0; i < monthlyData.length; i++) {
    if (monthlyData[i]) {
      currentCount++;
      longestStreak = Math.max(longestStreak, currentCount);
    } else {
      currentCount = 0;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-gray-900">
          <Calendar className="h-5 w-5 mr-2 text-gray-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Streak stats */}
          <div className="flex justify-between">
            <div className="text-center">
              <p className={`text-xl font-bold ${textColor}`}>{currentStreak}</p>
              <p className="text-xs text-gray-500">Hiện tại</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${textColor}`}>{longestStreak}</p>
              <p className="text-xs text-gray-500">Dài nhất</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${textColor}`}>
                {monthlyData.filter(Boolean).length}
              </p>
              <p className="text-xs text-gray-500">Tổng ngày</p>
            </div>
          </div>
          
          {/* Monthly calendar view */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Tháng {currentMonth + 1}/{currentYear}</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
                <div key={`header-${index}`} className="text-xs text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }, (_, i) => (
                <div key={`empty-start-${i}`} className="h-6"></div>
              ))}
              
              {/* Days of the month */}
              {days.map((day) => {
                const isToday = day === currentDay;
                const dayIndex = day - 1; // Adjust to 0-indexed
                const isCompleted = dayIndex < monthlyData.length && monthlyData[dayIndex];
                const isPast = day < currentDay;
                const isFuture = day > currentDay;
                
                return (
                  <div 
                    key={`day-${day}`} 
                    className={`
                      h-6 w-6 rounded-full flex items-center justify-center mx-auto text-xs
                      ${isToday ? 'border border-gray-300' : ''}
                      ${isCompleted ? `${color} text-white` : isPast ? 'bg-gray-200' : ''}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 