import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Play, Pause, SkipForward, Settings, Volume2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { firebase } from '../utils/firebase/client';
import { formatTime } from '../src/lib/utils';

interface PomodoroScreenProps {
  user: any;
  habitId?: string;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  soundEnabled: boolean;
}

export function PomodoroScreen({ user, habitId }: PomodoroScreenProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default: 25 minutes in seconds
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: true,
    longBreakInterval: 4,
    soundEnabled: true
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load user settings and habits
  useEffect(() => {
    const initializeData = async () => {
      if (user?.uid) {
        setLoading(true);
        try {
          // Đảm bảo tải cài đặt trước
          await loadSettings();
          
          // Tải danh sách habits
          await loadHabits();
          
          // Nếu có habitId được truyền vào, tìm và chọn habit đó
          if (habitId) {
            await loadSpecificHabit(habitId);
          }
        } catch (error) {
          console.error('Error initializing data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    initializeData();
    
    // Create audio element - sử dụng đường dẫn tương đối
    try {
      audioRef.current = new Audio('./sounds/bell.mp3');
    } catch (error) {
      console.error('Error loading audio:', error);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user?.uid, habitId]);
  
  // Timer effect
  useEffect(() => {
    // Đảm bảo xóa timer cũ trước khi tạo timer mới
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isRunning) {
      console.log('Starting timer in mode:', mode, 'with time left:', timeLeft);
      // Sử dụng Date.now() để tính toán thời gian chính xác hơn
      const startTime = Date.now();
      const endTime = startTime + (timeLeft * 1000);
      
      timerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - currentTime) / 1000));
        
        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeLeft(0);
          handleTimerComplete();
        } else {
          setTimeLeft(remaining);
        }
      }, 500); // Cập nhật mỗi 500ms để đảm bảo độ chính xác
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, mode]);
  
  const loadSettings = async () => {
    try {
      console.log('Loading settings for user:', user.uid);
      const doc = await firebase.firestore
        .collection('users')
        .doc(user.uid)
        .collection('settings')
        .doc('pomodoro')
        .get();
        
      if (doc.exists) {
        const settingsData = doc.data();
        console.log('Settings loaded:', settingsData);
        setSettings(prevSettings => ({ ...prevSettings, ...settingsData }));
        return settingsData;
      }
      return null;
    } catch (error) {
      console.error('Error loading pomodoro settings:', error);
      return null;
    }
  };
  
  const loadHabits = async () => {
    try {
      console.log('Loading habits for user:', user.uid);
      const snapshot = await firebase.firestore
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .get();
      
      const habitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Habits loaded:', habitsData.length, 'items');
      
      setHabits(habitsData);
      
      // Select first habit by default if available and no habitId was provided
      if (habitsData.length > 0 && !selectedHabit && !habitId) {
        console.log('Selecting first habit:', habitsData[0].title);
        setSelectedHabit(habitsData[0]);
      }
      
      return habitsData;
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  };
  
  const loadSpecificHabit = async (id: string) => {
    try {
      console.log('Loading specific habit:', id);
      const habitDoc = await firebase.firestore
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .doc(id)
        .get();
        
      if (habitDoc.exists) {
        const habitData = { id: habitDoc.id, ...habitDoc.data() };
        console.log('Specific habit loaded:', habitData.title);
        setSelectedHabit(habitData);
        return habitData;
      } else {
        console.log('Habit not found:', id);
        return null;
      }
    } catch (error) {
      console.error('Error loading specific habit:', error);
      return null;
    }
  };
  
  const saveSettings = async () => {
    try {
      await firebase.firestore
        .collection('users')
        .doc(user.uid)
        .collection('settings')
        .doc('pomodoro')
        .set(settings, { merge: true });
    } catch (error) {
      console.error('Error saving pomodoro settings:', error);
    }
  };
  
  const handleTimerComplete = () => {
    console.log('Timer completed in mode:', mode);
    
    // Phát âm thanh khi hoàn thành
    if (settings.soundEnabled && audioRef.current) {
      try {
        audioRef.current.play().catch(error => {
          console.error('Error playing sound:', error);
        });
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
    
    if (mode === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1;
      console.log('Completed pomodoros:', newCompletedPomodoros);
      setCompletedPomodoros(newCompletedPomodoros);
      
      // Update habit study minutes if selected
      if (selectedHabit) {
        console.log('Updating study time for habit:', selectedHabit.title);
        updateHabitStudyTime(settings.work);
      } else {
        console.log('No habit selected, skipping study time update');
      }
      
      // Determine if it's time for a long break
      const isLongBreak = newCompletedPomodoros % settings.longBreakInterval === 0;
      const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
      console.log('Switching to mode:', nextMode);
      
      setMode(nextMode);
      setTimeLeft(settings[nextMode] * 60);
      
      if (settings.autoStartBreaks) {
        console.log('Auto-starting break');
        setIsRunning(true);
      } else {
        console.log('Pausing after work session');
        setIsRunning(false);
      }
    } else {
      // Break is over, back to work
      console.log('Break over, back to work');
      setMode('work');
      setTimeLeft(settings.work * 60);
      
      if (settings.autoStartPomodoros) {
        console.log('Auto-starting work session');
        setIsRunning(true);
      } else {
        console.log('Pausing after break');
        setIsRunning(false);
      }
    }
  };
  
  const updateHabitStudyTime = async (minutes: number) => {
    if (!selectedHabit) return;
    
    try {
      const habitRef = firebase.firestore
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .doc(selectedHabit.id);
      
      // Update study minutes
      await habitRef.update({
        studyMinutes: firebase.firebase.firestore.FieldValue.increment(minutes)
      });
      
      // Update local state
      setHabits(habits.map(habit => {
        if (habit.id === selectedHabit.id) {
          return {
            ...habit,
            studyMinutes: (habit.studyMinutes || 0) + minutes
          };
        }
        return habit;
      }));
      
      // Update selected habit
      setSelectedHabit({
        ...selectedHabit,
        studyMinutes: (selectedHabit.studyMinutes || 0) + minutes
      });
      
      // Update user progress
      await firebase.firestore
        .collection('users')
        .doc(user.uid)
        .update({
          totalStudyMinutes: firebase.firebase.firestore.FieldValue.increment(minutes)
        });
    } catch (error) {
      console.error('Error updating habit study time:', error);
    }
  };
  
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  };
  
  const skipToNext = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      const nextMode = (completedPomodoros + 1) % settings.longBreakInterval === 0 
        ? 'longBreak' 
        : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(settings[nextMode] * 60);
    } else {
      setMode('work');
      setTimeLeft(settings.work * 60);
    }
  };
  
  const handleSettingChange = (key: keyof TimerSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const saveAndCloseSettings = () => {
    saveSettings();
    setIsSettingsOpen(false);
    
    // Update current timer if needed
    setTimeLeft(settings[mode] * 60);
  };
  
  const selectHabit = (habit: any) => {
    setSelectedHabit(habit);
  };
  
  // Calculate progress percentage
  const progressPercentage = () => {
    const totalSeconds = settings[mode] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };
  
  // Get color based on current mode
  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'bg-red-500';
      case 'shortBreak': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
      default: return 'bg-red-500';
    }
  };
  
  const getModeTextColor = () => {
    switch (mode) {
      case 'work': return 'text-red-600';
      case 'shortBreak': return 'text-green-600';
      case 'longBreak': return 'text-blue-600';
      default: return 'text-red-600';
    }
  };
  
  const getModeBgColor = () => {
    switch (mode) {
      case 'work': return 'bg-red-50';
      case 'shortBreak': return 'bg-green-50';
      case 'longBreak': return 'bg-blue-50';
      default: return 'bg-red-50';
    }
  };
  
  const getModeBorderColor = () => {
    switch (mode) {
      case 'work': return 'border-red-200';
      case 'shortBreak': return 'border-green-200';
      case 'longBreak': return 'border-blue-200';
      default: return 'border-red-200';
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pomodoro Timer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timer Card */}
        <Card className={`col-span-1 md:col-span-2 ${getModeBgColor()} ${getModeBorderColor()}`}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant={mode === 'work' ? 'default' : 'outline'} 
                  onClick={() => { setMode('work'); setTimeLeft(settings.work * 60); }}
                  className={mode === 'work' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  Làm việc
                </Button>
                <Button 
                  variant={mode === 'shortBreak' ? 'default' : 'outline'} 
                  onClick={() => { setMode('shortBreak'); setTimeLeft(settings.shortBreak * 60); }}
                  className={mode === 'shortBreak' ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  Nghỉ ngắn
                </Button>
                <Button 
                  variant={mode === 'longBreak' ? 'default' : 'outline'} 
                  onClick={() => { setMode('longBreak'); setTimeLeft(settings.longBreak * 60); }}
                  className={mode === 'longBreak' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  Nghỉ dài
                </Button>
              </div>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cài đặt Pomodoro</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Thời gian làm việc (phút)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[settings.work]} 
                          min={1} 
                          max={60} 
                          step={1} 
                          onValueChange={(value) => handleSettingChange('work', value[0])} 
                        />
                        <span className="w-12 text-center">{settings.work}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Thời gian nghỉ ngắn (phút)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[settings.shortBreak]} 
                          min={1} 
                          max={30} 
                          step={1} 
                          onValueChange={(value) => handleSettingChange('shortBreak', value[0])} 
                        />
                        <span className="w-12 text-center">{settings.shortBreak}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Thời gian nghỉ dài (phút)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[settings.longBreak]} 
                          min={1} 
                          max={60} 
                          step={1} 
                          onValueChange={(value) => handleSettingChange('longBreak', value[0])} 
                        />
                        <span className="w-12 text-center">{settings.longBreak}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Số pomodoro trước khi nghỉ dài</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[settings.longBreakInterval]} 
                          min={1} 
                          max={8} 
                          step={1} 
                          onValueChange={(value) => handleSettingChange('longBreakInterval', value[0])} 
                        />
                        <span className="w-12 text-center">{settings.longBreakInterval}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Tự động bắt đầu nghỉ</Label>
                      <Switch 
                        checked={settings.autoStartBreaks} 
                        onCheckedChange={(checked) => handleSettingChange('autoStartBreaks', checked)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Tự động bắt đầu pomodoro</Label>
                      <Switch 
                        checked={settings.autoStartPomodoros} 
                        onCheckedChange={(checked) => handleSettingChange('autoStartPomodoros', checked)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Âm thanh thông báo</Label>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <Switch 
                          checked={settings.soundEnabled} 
                          onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)} 
                        />
                      </div>
                    </div>
                    
                    <Button onClick={saveAndCloseSettings} className="w-full mt-4">
                      Lưu cài đặt
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-7xl font-bold mb-8 tracking-tighter">
              {formatTime(timeLeft)}
            </div>
            
            <div className="w-full max-w-md h-4 bg-gray-200 rounded-full mb-8 overflow-hidden">
              <div 
                className={`h-full ${getModeColor()} transition-all duration-1000`}
                style={{ width: `${progressPercentage()}%` }}
              />
            </div>
            
            <div className="flex space-x-4">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg" className="bg-green-500 hover:bg-green-600">
                  <Play className="h-5 w-5 mr-2" />
                  Bắt đầu
                </Button>
              ) : (
                <Button onClick={pauseTimer} size="lg" variant="outline">
                  <Pause className="h-5 w-5 mr-2" />
                  Tạm dừng
                </Button>
              )}
              
              <Button onClick={skipToNext} variant="outline" size="lg">
                <SkipForward className="h-5 w-5 mr-2" />
                Bỏ qua
              </Button>
            </div>
            
            <div className="mt-8 flex items-center">
              <Badge className={`px-3 py-1 ${getModeTextColor()}`}>
                {mode === 'work' ? 'Đang làm việc' : mode === 'shortBreak' ? 'Đang nghỉ ngắn' : 'Đang nghỉ dài'}
              </Badge>
              <span className="mx-4">•</span>
              <Badge variant="outline">
                {completedPomodoros} pomodoro hoàn thành
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Habits Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Thói quen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : habits.length > 0 ? (
                habits.map(habit => (
                  <div 
                    key={habit.id}
                    className={`p-3 rounded-lg cursor-pointer border ${
                      selectedHabit?.id === habit.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => selectHabit(habit)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{habit.title}</h3>
                        <p className="text-sm text-gray-500">
                          {habit.studyMinutes || 0} phút đã học
                        </p>
                      </div>
                      {habit.iconName && (
                        <div className="text-2xl">{habit.iconName}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Chưa có thói quen nào. Hãy thêm thói quen trong tab Habits.
                </div>
              )}
            </div>
            
            {selectedHabit && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium mb-2">Đang tập trung vào:</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{selectedHabit.title}</p>
                    <p className="text-sm text-gray-600">{selectedHabit.description}</p>
                  </div>
                  {selectedHabit.iconName && (
                    <div className="text-3xl">{selectedHabit.iconName}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Stats Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Pomodoros hôm nay</p>
              <p className="text-2xl font-bold">{completedPomodoros}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Phút tập trung</p>
              <p className="text-2xl font-bold">{completedPomodoros * settings.work}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Mục tiêu</p>
              <p className="text-2xl font-bold">{selectedHabit ? selectedHabit.title : '--'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Tổng thời gian</p>
              <p className="text-2xl font-bold">
                {selectedHabit ? `${selectedHabit.studyMinutes || 0} phút` : '--'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}