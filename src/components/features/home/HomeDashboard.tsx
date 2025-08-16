import React, { useState, useEffect, useCallback } from 'react';

import Button from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import {
  Play,
  Calendar,
  Trophy,
  Zap,
  BookOpen,
  Target,
  Loader2,
  Clock,
} from 'lucide-react';
import { auth } from '../../../services/firebase/config';
import {
  getUserProfile,
  updateUserProfile,
  updateUserProgress,
} from '../../../services/firebase/firestore';

// Types definition
interface User {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  accessToken?: string;
  name?: string;
  streak?: number;
  level?: number;
  totalWordsLearned?: number;
  totalStudyTime?: number;
  todayProgress?: number;
  dailyGoal?: number;
}

interface HomeDashboardProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onTabChange?: (tab: string) => void;
}

export function HomeDashboard({
  user,
  onUpdateUser,
  onTabChange,
}: HomeDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(user);

  const loadProfile = useCallback(async () => {
    if (!user.accessToken) {
      loadMockProfile();
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        loadMockProfile();
        return;
      }

      const userProfile = await getUserProfile(currentUser.uid);

      if (userProfile) {
        setProfile(userProfile);
        onUpdateUser({ ...user, ...userProfile });
      } else {
        await createDefaultProfile();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading profile:', error);
      }
      loadMockProfile();
    }
  }, [user.accessToken, onUpdateUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadMockProfile = () => {
    const mockProfile = {
      ...user,
      streak: 3,
      level: 2,
      experience: 150,
      totalWordsLearned: 45,
      todayProgress: 12,
      dailyGoal: 20,
      totalStudyTime: 25,
      isPremium: false,
    };
    setProfile(mockProfile);
    onUpdateUser(mockProfile);
  };

  const createDefaultProfile = async () => {
    try {
      const defaultProfile = {
        uid: auth.currentUser?.uid || '',
        name: user.name || 'Người dùng',
        email: user.email,
        streak: 1,
        level: 1,
        experience: 0,
        totalWordsLearned: 0,
        todayProgress: 0,
        dailyGoal: 20,
        totalStudyTime: 0,
        isPremium: false,
        createdAt: new Date().toISOString(),
      };

      if (!auth.currentUser) {
        loadMockProfile();
        return;
      }

      await updateUserProfile(auth.currentUser.uid, defaultProfile);

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

  const updateProgress = async (
    wordsLearned: number,
    studyTime: number = 5,
  ) => {
    if (!user.accessToken) {
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

      const updatedProfile = await getUserProfile(currentUser.uid);

      if (updatedProfile) {
        setProfile(updatedProfile);
        onUpdateUser({ ...user, ...updatedProfile });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating progress:', error);
      }
      updateLocalProgress(wordsLearned, studyTime);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalProgress = (wordsLearned: number, studyTime: number = 5) => {
    const updatedProfile = {
      ...profile,
      todayProgress: (profile.todayProgress || 0) + wordsLearned,
      totalWordsLearned: (profile.totalWordsLearned || 0) + wordsLearned,
      totalStudyTime: (profile.totalStudyTime || 0) + studyTime,
      streak:
        profile.todayProgress === 0
          ? (profile.streak || 0) + 1
          : profile.streak || 0,
    };

    const totalWords = updatedProfile.totalWordsLearned;
    if (totalWords >= 500) updatedProfile.level = 5;
    else if (totalWords >= 300) updatedProfile.level = 4;
    else if (totalWords >= 150) updatedProfile.level = 3;
    else if (totalWords >= 50) updatedProfile.level = 2;
    else updatedProfile.level = 1;

    setProfile(updatedProfile);
    onUpdateUser({ ...user, ...updatedProfile });
  };

  const progressPercentage = Math.min(
    ((profile.todayProgress || 0) / (profile.dailyGoal || 20)) * 100,
    100,
  );

  return (
    <div className="w-full h-screen p-1 pb-16 xl:p-2 xl:pb-0 flex flex-col">
      {/* Header - Compact */}
      <div className="mb-2 xl:mb-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-[#f0f6fc] mb-1">
              Chào {profile.name}! 👋
            </h1>
            <p className="text-xs xl:text-sm text-gray-600 dark:text-[#f0f6fc]">
              Hôm nay bạn muốn học gì?
            </p>
          </div>
          <div className="mt-1 sm:mt-0">
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs"
            >
              <Zap
                className="text-yellow-500 dark:text-yellow-400"
                style={{ width: '10px', height: '10px', marginRight: '2px' }}
              />
              {profile.streak || 0} ngày
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Single Column Layout */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Content */}
        <div className="space-y-3 xl:space-y-4">
          {/* Progress Today - Full width */}
          <Card className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base xl:text-lg text-gray-900 dark:text-[#f0f6fc] flex items-center">
                <Target
                  className="text-blue-500 mr-2"
                  style={{ width: '16px', height: '16px' }}
                />
                Progress hôm nay
              </CardTitle>
              <CardDescription className="text-xs xl:text-sm text-gray-600 dark:text-[#f0f6fc]">
                Bạn đã học {profile.todayProgress || 0}/
                {profile.dailyGoal || 20} từ vựng
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Progress value={progressPercentage} className="mb-3 h-2" />
              <div className="flex justify-between text-xs">
                <span className="text-gray-900 dark:text-[#f0f6fc]">
                  {Math.round(progressPercentage)}% hoàn thành
                </span>
                <span className="text-gray-900 dark:text-[#f0f6fc]">
                  Còn{' '}
                  {Math.max(
                    0,
                    (profile.dailyGoal || 20) - (profile.todayProgress || 0),
                  )}{' '}
                  từ
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards - CSS Grid responsive: 1 col <480px, 2 cols <768px, 4 cols >=768px */}
          <div className="w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 xl:gap-4">
            {/* Row 1: Ngày liên tiếp + Từ đã học */}
            {/* Card 1: Ngày liên tiếp */}
            <Card className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-2">
                  <Calendar
                    className="text-blue-600 dark:text-blue-400"
                    size={18}
                  />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-[#f0f6fc] mb-1">
                  {profile.streak || 0}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-[#f0f6fc] leading-tight font-medium">
                  Ngày liên tiếp
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Từ đã học */}
            <Card className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-2">
                  <Trophy
                    className="text-green-600 dark:text-green-400"
                    size={18}
                  />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-[#f0f6fc] mb-1">
                  {profile.totalWordsLearned || 0}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-[#f0f6fc] leading-tight font-medium">
                  Từ đã học
                </p>
              </CardContent>
            </Card>

            {/* Row 2: Level + Giờ học tập */}
            {/* Card 3: Level */}
            <Card className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-2">
                  <BookOpen
                    className="text-purple-600 dark:text-purple-400"
                    size={18}
                  />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-[#f0f6fc] mb-1">
                  Level {profile.level || 1}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-[#f0f6fc] leading-tight font-medium">
                  Cấp độ
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Giờ học tập */}
            <Card className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-2">
                  <Clock
                    className="text-yellow-600 dark:text-yellow-400"
                    size={18}
                  />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-[#f0f6fc] mb-1">
                  {profile.totalStudyTime || 0}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-[#f0f6fc] leading-tight font-medium">
                  Giờ học tập
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning CTA - Compact */}
          <Card className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base xl:text-lg font-semibold text-gray-900 dark:text-[#f0f6fc] mb-1">
                    Tiếp tục học nào! 🚀
                  </h3>
                  <p className="text-xs xl:text-sm text-gray-600 dark:text-[#f0f6fc]">
                    Hoàn thành mục tiêu hôm nay để duy trì streak
                  </p>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm shrink-0"
                  onClick={() => {
                    updateProgress(5);
                    onTabChange && onTabChange('chat');
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2
                      className="text-yellow-400 animate-spin mr-2"
                      style={{ width: '14px', height: '14px' }}
                    />
                  ) : (
                    <Play
                      className="text-yellow-400 mr-2"
                      style={{ width: '14px', height: '14px' }}
                    />
                  )}
                  Học ngay
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Compact */}
          <Card className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base xl:text-lg text-gray-900 dark:text-[#f0f6fc]">
                Hoạt động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                onClick={() => updateProgress(3)}
                disabled={loading}
              >
                <BookOpen
                  className="text-blue-500 mr-3"
                  style={{ width: '16px', height: '16px' }}
                />
                <span className="text-left">Ôn tập từ vựng đã học (+3 từ)</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                onClick={() => updateProgress(5)}
                disabled={loading}
              >
                <Target
                  className="text-green-500 mr-3"
                  style={{ width: '16px', height: '16px' }}
                />
                <span className="text-left">Quiz kiểm tra nhanh (+5 từ)</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                onClick={() => updateProgress(2)}
                disabled={loading}
              >
                <Zap
                  className="text-yellow-500 mr-3"
                  style={{ width: '16px', height: '16px' }}
                />
                <span className="text-left">Thử thách 5 phút (+2 từ)</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
