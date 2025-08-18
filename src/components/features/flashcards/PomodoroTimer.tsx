import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, Check, Clock, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { db, auth } from '../utils/firebase/config';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface PomodoroTimerProps {
  habitId?: string;
  habitTitle?: string;
  onComplete?: (duration: number) => void;
}

export function PomodoroTimer({ habitId, habitTitle, onComplete }: PomodoroTimerProps) {
  // Cài đặt thời gian mặc định (phút)
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  
  // Trạng thái hiện tại
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  
  // Âm thanh
  const alarmSound = useRef<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Khởi tạo âm thanh
  useEffect(() => {
    alarmSound.current = new Audio('/sounds/alarm.mp3');
    return () => {
      if (alarmSound.current) {
        alarmSound.current.pause();
        alarmSound.current = null;
      }
    };
  }, []);
  
  // Cập nhật thời gian còn lại khi thay đổi mode
  useEffect(() => {
    switch (mode) {
      case 'focus':
        setTimeLeft(focusTime * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakTime * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakTime * 60);
        break;
    }
  }, [mode, focusTime, shortBreakTime, longBreakTime]);
  
  // Bộ đếm thời gian
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Khi hết thời gian
      if (soundEnabled && alarmSound.current) {
        alarmSound.current.play();
      }
      
      setIsActive(false);
      
      // Xử lý khi hoàn thành một phiên làm việc
      if (mode === 'focus') {
        const newCompletedSessions = completedSessions + 1;
        setCompletedSessions(newCompletedSessions);
        
        // Cập nhật dữ liệu lên Firestore nếu có habitId
        if (habitId && auth.currentUser) {
          updateHabitProgress(focusTime);
        }
        
        // Gọi callback onComplete nếu có
        if (onComplete) {
          onComplete(focusTime);
        }
        
        // Chuyển sang chế độ nghỉ phù hợp
        if (newCompletedSessions % longBreakInterval === 0) {
          setMode('longBreak');
          if (autoStartBreaks) setIsActive(true);
        } else {
          setMode('shortBreak');
          if (autoStartBreaks) setIsActive(true);
        }
      } else {
        // Khi kết thúc thời gian nghỉ, chuyển lại chế độ làm việc
        setMode('focus');
        if (autoStartPomodoros) setIsActive(true);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, completedSessions, habitId]);
  
  // Cập nhật tiến trình lên Firestore
  const updateHabitProgress = async (duration: number) => {
    if (!habitId || !auth.currentUser) return;
    
    try {
      const habitRef = doc(db, "habits", habitId);
      
      // Cập nhật số phút đã học và streak nếu chưa hoàn thành hôm nay
      await updateDoc(habitRef, {
        "studyMinutes": increment(duration),
        "todayCompleted": true
      });
      
      // Cập nhật tiến trình hàng tuần và hàng tháng
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Chủ Nhật, 1-6 = Thứ 2-Thứ 7
      const dayOfMonth = today.getDate() - 1; // 0-30
      
      // Cập nhật tiến trình tuần
      await updateDoc(habitRef, {
        [`weeklyProgress.${dayOfWeek}`]: true
      });
      
      // Cập nhật tiến trình tháng
      await updateDoc(habitRef, {
        [`monthlyProgress.${dayOfMonth}`]: true
      });
    } catch (error) {
      console.error('Error updating habit progress:', error);
    }
  };
  
  // Định dạng thời gian
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Tính toán phần trăm thời gian đã trôi qua
  const calculateProgress = (): number => {
    let totalSeconds;
    switch (mode) {
      case 'focus':
        totalSeconds = focusTime * 60;
        break;
      case 'shortBreak':
        totalSeconds = shortBreakTime * 60;
        break;
      case 'longBreak':
        totalSeconds = longBreakTime * 60;
        break;
      default:
        totalSeconds = focusTime * 60;
    }
    
    const elapsedSeconds = totalSeconds - timeLeft;
    return (elapsedSeconds / totalSeconds) * 100;
  };
  
  // Xử lý các hành động
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case 'focus':
        setTimeLeft(focusTime * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakTime * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakTime * 60);
        break;
    }
  };
  
  const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
  };
  
  // Xử lý lưu cài đặt
  const saveSettings = () => {
    setShowSettings(false);
  };
  
  return (
    <>
      <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-indigo-600" />
              <span>Pomodoro Timer</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="h-8 w-8 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
          {habitTitle && (
            <p className="text-sm text-indigo-700">Đang tập trung: {habitTitle}</p>
          )}
        </CardHeader>
        
        <CardContent>
          {/* Mode Selector */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={mode === 'focus' ? 'default' : 'outline'}
              className={mode === 'focus' ? 'bg-indigo-600' : ''}
              onClick={() => switchMode('focus')}
              size="sm"
            >
              Tập trung
            </Button>
            <Button
              variant={mode === 'shortBreak' ? 'default' : 'outline'}
              className={mode === 'shortBreak' ? 'bg-green-600' : ''}
              onClick={() => switchMode('shortBreak')}
              size="sm"
            >
              Nghỉ ngắn
            </Button>
            <Button
              variant={mode === 'longBreak' ? 'default' : 'outline'}
              className={mode === 'longBreak' ? 'bg-blue-600' : ''}
              onClick={() => switchMode('longBreak')}
              size="sm"
            >
              Nghỉ dài
            </Button>
          </div>
          
          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-indigo-900 mb-2">
              {formatTime(timeLeft)}
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={toggleTimer}
              className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
            >
              {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isActive ? 'Tạm dừng' : 'Bắt đầu'}
            </Button>
            <Button
              variant="outline"
              onClick={resetTimer}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Đặt lại
            </Button>
          </div>
          
          {/* Session Counter */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Đã hoàn thành: <span className="font-medium">{completedSessions}</span> phiên
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cài đặt Pomodoro</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="focusTime">Thời gian tập trung (phút)</Label>
              <Select
                value={focusTime.toString()}
                onValueChange={(value) => setFocusTime(Number(value))}
              >
                <SelectTrigger id="focusTime">
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  {[15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="shortBreakTime">Nghỉ ngắn (phút)</Label>
              <Select
                value={shortBreakTime.toString()}
                onValueChange={(value) => setShortBreakTime(Number(value))}
              >
                <SelectTrigger id="shortBreakTime">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="longBreakTime">Nghỉ dài (phút)</Label>
              <Select
                value={longBreakTime.toString()}
                onValueChange={(value) => setLongBreakTime(Number(value))}
              >
                <SelectTrigger id="longBreakTime">
                  <SelectValue placeholder="15" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 25, 30].map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="longBreakInterval">Số phiên trước nghỉ dài</Label>
              <Select
                value={longBreakInterval.toString()}
                onValueChange={(value) => setLongBreakInterval(Number(value))}
              >
                <SelectTrigger id="longBreakInterval">
                  <SelectValue placeholder="4" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((interval) => (
                    <SelectItem key={interval} value={interval.toString()}>
                      {interval}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="autoStartBreaks"
                checked={autoStartBreaks}
                onCheckedChange={setAutoStartBreaks}
              />
              <Label htmlFor="autoStartBreaks">Tự động bắt đầu giờ nghỉ</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="autoStartPomodoros"
                checked={autoStartPomodoros}
                onCheckedChange={setAutoStartPomodoros}
              />
              <Label htmlFor="autoStartPomodoros">Tự động bắt đầu phiên làm việc</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="soundEnabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <Label htmlFor="soundEnabled">Bật âm thanh thông báo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700">
              Lưu cài đặt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}