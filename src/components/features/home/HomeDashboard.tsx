import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { Play, Calendar, Trophy, Zap, BookOpen, Target, Loader2, Clock } from 'lucide-react';
import { auth } from '../../../services/firebase/config';
import { getUserProfile, updateUserProfile, updateUserProgress } from '../../../services/firebase/firestore';

interface HomeDashboardProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export function HomeDashboard({ user, onUpdateUser }: HomeDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(user);

  // Định nghĩa hàm loadProfile trước khi sử dụng trong useEffect
  
  useEffect(() => {
    loadProfile();
  }, []);
  const loadProfile = async () => {
    if (!user.accessToken) {
      // Nếu không có người dùng, hiển thị dữ liệu mẫu
      loadMockProfile();
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        loadMockProfile();
        return;
      }

      const profile = await getUserProfile(currentUser.uid);
      
      if (profile) {
        setProfile(profile);
        onUpdateUser({ ...user, ...profile });
      } else {
        // Nếu không có profile, tạo profile mặc định
        await createDefaultProfile();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load profile:', error);
      }
      // Nếu có lỗi, hiển thị dữ liệu mẫu
      loadMockProfile();
    }
  };
  
  // Tải dữ liệu profile mẫu
  const loadMockProfile = () => {
    const mockProfile = {
      name: user.name || 'Học viên',
      email: user.email || 'student@example.com',
      streak: 7,
      level: 3,
      experience: 350,
      totalWordsLearned: 245,
      todayProgress: 15,
      dailyGoal: 20,
      totalStudyTime: 45,
      isPremium: true
    };
    
    setProfile(mockProfile);
    onUpdateUser({ ...user, ...mockProfile });
  };
  
  // Tạo profile mặc định và lưu vào Firestore
  const createDefaultProfile = async () => {
    if (!auth.currentUser) return;
    
    try {
      const defaultProfile = {
        name: user.name || 'Học viên',
        email: user.email,
        streak: 1,
        level: 1,
        experience: 0,
        totalWordsLearned: 0,
        todayProgress: 0,
        dailyGoal: 20,
        totalStudyTime: 0,
        isPremium: false,
        createdAt: new Date().toISOString()
      };
      
      await updateUserProfile(auth.currentUser.uid, defaultProfile);
      
      // Lấy profile sau khi đã cập nhật
      const updatedProfile = await getUserProfile(auth.currentUser.uid);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        onUpdateUser({ ...user, ...updatedProfile });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to create default profile');
        }
        loadMockProfile();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating default profile:', error);
      }
      loadMockProfile();
    }
  };

  const updateProgress = async (wordsLearned: number, studyTime: number = 5) => {
    if (!user.accessToken) {
      // Nếu không có người dùng, cập nhật local
      updateLocalProgress(wordsLearned, studyTime);
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        updateLocalProgress(wordsLearned, studyTime);
        return;
      }

      await updateUserProgress(currentUser.uid, { wordsLearned, studyTime });
      
      // Lấy profile sau khi đã cập nhật
      const updatedProfile = await getUserProfile(currentUser.uid);

      if (updatedProfile) {
        setProfile(updatedProfile);
        onUpdateUser({ ...user, ...updatedProfile });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to update progress');
        }
        // Nếu có lỗi, vẫn cập nhật UI để trải nghiệm người dùng tốt hơn
        updateLocalProgress(wordsLearned, studyTime);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating progress:', error);
      }
      // Nếu có lỗi, vẫn cập nhật UI
      updateLocalProgress(wordsLearned, studyTime);
    } finally {
      setLoading(false);
    }
  };
  
  // Cập nhật tiến độ local
  const updateLocalProgress = (wordsLearned: number, studyTime: number = 5) => {
    const updatedProfile = {
      ...profile,
      todayProgress: (profile.todayProgress || 0) + wordsLearned,
      totalWordsLearned: (profile.totalWordsLearned || 0) + wordsLearned,
      totalStudyTime: (profile.totalStudyTime || 0) + studyTime,
      // Cập nhật streak nếu là lần đầu học trong ngày
      streak: profile.todayProgress === 0 ? (profile.streak || 0) + 1 : profile.streak || 0
    };
    
    // Cập nhật level dựa trên tổng số từ đã học
    const totalWords = updatedProfile.totalWordsLearned;
    if (totalWords >= 500) updatedProfile.level = 5;
    else if (totalWords >= 300) updatedProfile.level = 4;
    else if (totalWords >= 150) updatedProfile.level = 3;
    else if (totalWords >= 50) updatedProfile.level = 2;
    else updatedProfile.level = 1;
    
    setProfile(updatedProfile);
    onUpdateUser({ ...user, ...updatedProfile });
  };

  const progressPercentage = Math.min(((profile.todayProgress || 0) / (profile.dailyGoal || 20)) * 100, 100);

  return (
    <div className="h-full overflow-y-auto p-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-blue-900">
              Chào {profile.name}! 👋
            </h1>
            <p className="text-gray-600">Hôm nay bạn muốn học gì?</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3 mr-1" />
              {profile.streak || 0} ngày
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Today */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
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
          <Progress value={progressPercentage} className="mb-3" />
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">
              {Math.round(progressPercentage)}% hoàn thành
            </span>
            <span className="text-blue-600">
              Còn {Math.max(0, (profile.dailyGoal || 20) - (profile.todayProgress || 0))} từ
            </span>
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
                Hoàn thành mục tiêu hôm nay để duy trì streak
              </p>
            </div>
            <Button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
              onClick={() => updateProgress(5)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Học ngay
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl text-purple-900 mb-1">Level {profile.level || 1}</p>
            <p className="text-sm text-gray-600">Cấp độ</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-2xl text-yellow-900 mb-1">{profile.totalStudyTime || 0}</p>
            <p className="text-sm text-gray-600">Giờ học tập</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Hoạt động nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={() => updateProgress(3)}
            disabled={loading}
          >
            <BookOpen className="h-4 w-4 mr-3 text-blue-600" />
            Ôn tập từ vựng đã học (+3 từ)
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={() => updateProgress(5)}
            disabled={loading}
          >
            <Target className="h-4 w-4 mr-3 text-green-600" />
            Quiz kiểm tra nhanh (+5 từ)
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={() => updateProgress(2)}
            disabled={loading}
          >
            <Zap className="h-4 w-4 mr-3 text-yellow-600" />
            Thử thách 5 phút (+2 từ)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}