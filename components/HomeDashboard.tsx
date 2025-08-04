import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Play, Calendar, Trophy, Zap, BookOpen, Target, Loader2, Clock } from 'lucide-react';
import { firebase } from '../utils/firebase/client';
import { auth } from '../utils/firebase/config';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface HomeDashboardProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export function HomeDashboard({ user, onUpdateUser }: HomeDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(user);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Memoize loadProfile để có thể sử dụng trong useEffect và các hàm khác
  const loadProfile = useCallback(async () => {
    if (!user.accessToken) return;

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const { profile: userProfile, error } = await firebase.firestore.getProfile(currentUser.uid);
      
      if (userProfile) {
        setProfile(userProfile);
        onUpdateUser({ ...user, ...userProfile });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, onUpdateUser]);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Tự động làm mới dữ liệu mỗi 5 phút
  useEffect(() => {
    const interval = setInterval(() => {
      loadProfile();
    }, 5 * 60 * 1000); // 5 phút
    
    return () => clearInterval(interval);
  }, [loadProfile]);

  const updateProgress = async (wordsLearned: number, studyTime: number = 5) => {
    if (!user.accessToken) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const { profile: updatedProfile, error } = await firebase.firestore.updateProgress(
        currentUser.uid, 
        { wordsLearned, studyTime }
      );

      if (updatedProfile) {
        setProfile(updatedProfile);
        onUpdateUser({ ...user, ...updatedProfile });
      } else if (error) {
        console.error('Failed to update progress:', error);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min(((profile.todayProgress || 0) / (profile.dailyGoal || 20)) * 100, 100);

  // Định dạng thời gian cập nhật cuối
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    return `Cập nhật lần cuối: ${format(lastUpdated, 'HH:mm', { locale: vi })}`;
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-blue-900">
              Chào {profile.name}! 👋
            </h1>
            <p className="text-gray-600">
              {profile.lastUpdateDate === new Date().toISOString().split('T')[0] 
                ? "Bạn đã học hôm nay. Tiếp tục nhé!" 
                : "Hôm nay bạn muốn học gì?"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3 mr-1" />
              {profile.streak || 0} ngày
            </Badge>
            {loading && (
              <Badge variant="outline" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Đang tải...
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">{getLastUpdatedText()}</p>
      </div>

      {/* Progress Today */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-blue-900">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Progress hôm nay
          </CardTitle>
          <CardDescription className="text-blue-700">
            Bạn đã học {profile.todayProgress || 0}/{profile.dailyGoal || 20} từ vựng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-4 bg-blue-100 rounded-full overflow-hidden mb-3">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out ${
                progressPercentage >= 100 ? 'animate-pulse' : ''
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
            {progressPercentage >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-md">🎉 Hoàn thành!</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-600 font-medium">
              {Math.round(progressPercentage)}% hoàn thành
            </span>
            {progressPercentage < 100 ? (
              <span className="text-blue-600">
                Còn {Math.max(0, (profile.dailyGoal || 20) - (profile.todayProgress || 0))} từ nữa!
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                Mục tiêu hoàn thành! 🏆
              </span>
            )}
          </div>
          {progressPercentage < 100 && (
            <p className="text-xs text-blue-500 mt-2 italic">
              Hoàn thành mục tiêu để duy trì streak và nhận thêm điểm xếp hạng!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Level Badge */}
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-purple-900 mb-1">
                  Bạn đạt cấp độ {Math.floor((profile.totalWordsLearned || 0) / 100) + 1} – {
                    (profile.totalWordsLearned || 0) < 100 ? 'Beginner' : 
                    (profile.totalWordsLearned || 0) < 300 ? 'Intermediate' : 
                    (profile.totalWordsLearned || 0) < 600 ? 'Advanced' : 'Master'
                  }
                </h3>
                <p className="text-purple-700 text-sm">
                  {(profile.totalWordsLearned || 0) < 100 ? 
                    `Còn ${100 - (profile.totalWordsLearned || 0)} từ để lên cấp tiếp theo!` : 
                    (profile.totalWordsLearned || 0) < 300 ?
                    `Còn ${300 - (profile.totalWordsLearned || 0)} từ để lên cấp Advanced!` :
                    (profile.totalWordsLearned || 0) < 600 ?
                    `Còn ${600 - (profile.totalWordsLearned || 0)} từ để lên cấp Master!` :
                    `Bạn đã đạt cấp độ cao nhất! Giỏi lắm! 🎓`
                  }
                </p>
              </div>
            </div>
            <Badge className="bg-purple-200 text-purple-800 px-3 py-1 text-xs">
              {profile.totalWordsLearned || 0} từ
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Continue Learning CTA */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-900 mb-1">Tiếp tục học nào! 🚀</h3>
              <p className="text-yellow-700 text-sm">
                {progressPercentage >= 100 
                  ? 'Tuyệt vời! Bạn đã hoàn thành mục tiêu hôm nay.' 
                  : 'Hoàn thành mục tiêu hôm nay để duy trì streak'}
              </p>
            </div>
            <Button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
              onClick={() => {
                // Chỉ chuyển tab mà không gọi updateProgress để tránh bị loading
                const event = new CustomEvent('navigate-tab', { detail: { tab: 'flashcards' } });
                window.dispatchEvent(event);
              }}
              disabled={false} // Không phụ thuộc vào trạng thái loading
            >
              <Play className="h-4 w-4 mr-2" />
              Học ngay
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl text-blue-900 mb-1">{profile.streak || 0}</p>
            <p className="text-sm text-gray-600">Ngày liên tiếp</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl text-green-900 mb-1">{profile.totalWordsLearned || 0}</p>
            <p className="text-sm text-gray-600">Từ đã học</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl text-purple-900 mb-1">
              {profile.lastStudyTime ? (
                format(new Date(profile.lastStudyTime), 'dd/MM', { locale: vi })
              ) : (
                '-'
              )}
            </p>
            <p className="text-sm text-gray-600">Lần học gần nhất</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Hoạt động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ôn tập từ vựng */}
          <div 
            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => {
              // Chỉ chuyển tab mà không gọi updateProgress để tránh bị loading
              const event = new CustomEvent('navigate-tab', { detail: { tab: 'flashcards' } });
              window.dispatchEvent(event);
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3 text-2xl">
                📖
              </div>
              <h3 className="font-medium text-blue-800 mb-1">Ôn tập từ vựng</h3>
              <p className="text-sm text-blue-600 mb-2">Xem lại những từ đã học</p>
              <Badge className="bg-blue-200 text-blue-700">+3 từ</Badge>
            </div>
          </div>
          
          {/* Quiz kiểm tra nhanh */}
          <div 
            className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => {
              // Chỉ chuyển tab mà không gọi updateProgress để tránh bị loading
              const event = new CustomEvent('navigate-tab', { detail: { tab: 'flashcards', mode: 'quiz' } });
              window.dispatchEvent(event);
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 text-2xl">
                ❓
              </div>
              <h3 className="font-medium text-green-800 mb-1">Quiz kiểm tra</h3>
              <p className="text-sm text-green-600 mb-2">Kiểm tra kiến thức của bạn</p>
              <Badge className="bg-green-200 text-green-700">+5 từ</Badge>
            </div>
          </div>
          
          {/* Thử thách 5 phút */}
          <div 
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => {
              // Chỉ chuyển tab mà không gọi updateProgress để tránh bị loading
              const event = new CustomEvent('navigate-tab', { detail: { tab: 'pomodoro' } });
              window.dispatchEvent(event);
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-3 text-2xl">
                ⏱️
              </div>
              <h3 className="font-medium text-yellow-800 mb-1">Pomodoro Timer</h3>
              <p className="text-sm text-yellow-600 mb-2">Tập trung học tập hiệu quả</p>
              <Badge className="bg-yellow-200 text-yellow-700">+2 từ</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}