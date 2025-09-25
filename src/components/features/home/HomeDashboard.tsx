import React, { useState, useEffect } from 'react';

import Button from '../../ui/button';
import { DailyTipCard } from '../../ui/DailyTipCard';
import { AchievementPreview } from '../../ui/AchievementPreview';
import { useDashboardData } from '../../../hooks/useDashboardData';
import {
  useDashboardIntegration,
  useRealtimeUpdates,
} from '../../../hooks/useDashboardIntegration';
import { QuickActions } from './QuickActions';
import { WeeklyProgress } from './WeeklyProgress';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import {
  Play,
  Calendar,
  Trophy,
  Zap,
  BookOpen,
  Target,
  Clock,
  Check,
} from 'lucide-react';

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

export function HomeDashboard({ user, onTabChange }: HomeDashboardProps) {
  // Use integrated dashboard data
  const {
    progress: integratedProgress,
    completeFlashcardSession,
    refreshProgress,
  } = useDashboardIntegration(user);

  // Use real dashboard data for missions and achievements
  const {
    dailyMissions: realDailyMissions,
    upcomingAchievements,
    completeMission: completeMissionAction,
  } = useDashboardData(user);

  // Enable realtime updates
  useRealtimeUpdates(user);

  // Local state for UI
  const [profile, setProfile] = useState(user);

  // Use real daily missions or fallback to mock data
  const dailyMissions = realDailyMissions?.missions || [
    { id: 1, text: 'Ôn tập 5 từ vựng đã học', completed: false, xp: 10 },
    { id: 2, text: 'Làm quiz kiểm tra nhanh', completed: false, xp: 15 },
    { id: 3, text: 'Thử thách 5 phút', completed: false, xp: 8 },
    { id: 4, text: 'Hoàn thành 1 Pomodoro', completed: false, xp: 20 },
    { id: 5, text: 'Cập nhật thói quen học tập', completed: false, xp: 12 },
  ];

  const completedMissions = realDailyMissions?.completedCount || 0;
  const [showMissionComplete, setShowMissionComplete] = useState(false);

  // Update profile with integrated data
  useEffect(() => {
    if (integratedProgress) {
      const updatedProfile = {
        ...user,
        streak: integratedProgress.streak,
        todayProgress: integratedProgress.dailyProgress,
        dailyGoal: integratedProgress.dailyGoal,
        totalWordsLearned: integratedProgress.totalWordsLearned,
        level: integratedProgress.level,
        xp: integratedProgress.xp,
      };
      setProfile(updatedProfile);
    }
  }, [integratedProgress, user]);

  // Mission completion logic
  const toggleMission = async (missionId: string) => {
    try {
      const result = await completeMissionAction(missionId);
      if (result.xpEarned > 0) {
        setShowMissionComplete(true);
        setTimeout(() => setShowMissionComplete(false), 2000);
      }
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  // CTA button handler
  const handleStartLearningAction = async () => {
    try {
      // Sử dụng hệ thống tích hợp mới
      const result = await completeFlashcardSession(5, 15); // 5 từ vựng, 15 phút
      if (result.success) {
        // Refresh progress
        await refreshProgress();
      }
      onTabChange && onTabChange('flashcards');
    } catch (error) {
      console.error('Error in start learning:', error);
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-950 to-slate-900 p-1 xl:p-2 flex flex-col overflow-y-auto scrollbar-glass">
      {/* Header - Compact */}
      <div className="mb-2 xl:mb-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg xl:text-xl font-bold text-white mb-1 max-w-xl">
              Chào {profile.name}! 👋
            </h1>
            <p className="text-xs xl:text-sm text-white/70 max-w-xl">
              Hôm nay bạn muốn học gì?
            </p>
          </div>
          <div className="mt-1 sm:mt-0">
            <div className="flex items-center gap-2">
              {(profile.streak || 0) > 0 && (
                <div
                  className="flex items-center gap-1 text-yellow-400"
                  title={`${profile.streak} ngày liên tiếp`}
                >
                  <span className="text-lg">🔥</span>
                  <span className="text-xs font-medium">{profile.streak}</span>
                </div>
              )}
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs"
              >
                <Zap
                  className="text-yellow-500 dark:text-yellow-400 mr-1"
                  size={10}
                />
                {profile.streak || 0} ngày
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Single Column Layout */}
      <div className="flex-1 overflow-y-auto scrollbar-glass">
        {/* Main Content */}
        <div className="space-y-3 xl:space-y-4 max-w-full pb-6">
          {/* Quick Actions - New integrated component */}
          <QuickActions
            user={user}
            progress={integratedProgress}
            onTabChange={onTabChange}
          />

          {/* Weekly Progress - New integrated component */}
          <WeeklyProgress progress={integratedProgress} />

          {/* Stats Cards - CSS Grid responsive: 1 col <480px, 2 cols <768px, 4 cols >=768px */}
          <div className="w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 xl:gap-4">
            {/* Row 1: Ngày liên tiếp + Từ đã học */}
            {/* Card 1: Ngày liên tiếp */}
            <Card className="card-glass hover-scale overflow-hidden">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-2">
                  <Calendar
                    className="text-blue-600 dark:text-blue-400"
                    size={18}
                  />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {integratedProgress?.streak || 0}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-100 leading-tight font-medium">
                  Ngày liên tiếp
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Từ đã học */}
            <Card className="card-glass hover-scale overflow-hidden">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-2">
                  <Trophy
                    className="text-green-600 dark:text-green-400"
                    size={18}
                  />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {integratedProgress?.totalWordsLearned || 0}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-100 leading-tight font-medium">
                  Từ đã học
                </p>
              </CardContent>
            </Card>

            {/* Row 2: Level + Giờ học tập */}
            {/* Card 3: Level */}
            <Card className="card-glass hover-scale overflow-hidden">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-2">
                  <BookOpen
                    className="text-purple-600 dark:text-purple-400"
                    size={18}
                  />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Level {integratedProgress?.level || 1}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-100 leading-tight font-medium">
                  Cấp độ
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Pomodoro hôm nay */}
            <Card className="card-glass hover-scale overflow-hidden">
              <CardContent className="p-3 xl:p-4 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-2">
                  <Clock className="text-red-600 dark:text-red-400" size={18} />
                </div>
                <p className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {integratedProgress?.pomodorosCompletedToday || 0}
                </p>
                <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-100 leading-tight font-medium">
                  Pomodoro hôm nay
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning CTA - Compact */}
          <Card className="card-glass overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base xl:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Tiếp tục học nào! 🚀
                  </h3>
                  <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-100">
                    Hoàn thành mục tiêu hôm nay để duy trì streak
                  </p>
                </div>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-sm shrink-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleStartLearningAction}
                  disabled={false}
                >
                  <Play className="text-yellow-400 mr-2" size={14} />
                  Học ngay
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Missions Card */}
          <Card className="card-glass overflow-hidden">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-base xl:text-lg text-white flex items-center">
                <Target
                  className="text-blue-400 mr-2"
                  style={{ width: '16px', height: '16px' }}
                />
                Nhiệm vụ hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 pb-6">
              {/* Mission Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">
                    Tiến trình nhiệm vụ
                  </span>
                  <span className="text-sm text-white/70">
                    {completedMissions}/5 hoàn thành
                  </span>
                </div>
                <Progress
                  value={Math.min((completedMissions / 5) * 100, 100)}
                  className="h-2 bg-white/10"
                />
              </div>

              {/* Mission List */}
              <div className="space-y-3">
                {dailyMissions.map(mission => (
                  <div
                    key={mission.id}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 ${
                      mission.completed
                        ? 'bg-green-500/10 border border-green-500/20'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleMission(mission.id.toString())}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                        mission.completed
                          ? 'border-green-400 bg-green-400'
                          : 'border-white/30 hover:border-blue-400'
                      }`}
                    >
                      {mission.completed && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </button>
                    <span
                      className={`text-sm transition-all duration-200 break-words ${
                        mission.completed
                          ? 'text-green-300 line-through'
                          : 'text-white/80'
                      }`}
                    >
                      {mission.text}
                    </span>
                    {mission.completed && (
                      <span className="text-xs text-green-400 font-medium">
                        +{mission.xp} XP
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Completion Messages */}
              {showMissionComplete && (
                <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-center animate-pulse">
                  <span className="text-sm text-green-300">
                    🎉 Nhiệm vụ hoàn thành! +XP
                  </span>
                </div>
              )}

              {completedMissions === 5 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-center">
                  <span className="text-sm text-yellow-300 font-medium">
                    🏆 Tuyệt vời! Bạn đã hoàn thành tất cả nhiệm vụ hôm nay!
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="h-px bg-white/10 my-6" />

          {/* Daily Tip Card */}
          <DailyTipCard />

          {/* Achievement Preview */}
          <div className="mb-6">
            <AchievementPreview achievements={upcomingAchievements} />
          </div>
        </div>
      </div>
    </div>
  );
}
