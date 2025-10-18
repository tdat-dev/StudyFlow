import React from 'react';
import { Progress } from './progress';

interface AchievementPreviewProps {
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    progress: number;
    requirement: number;
    xpReward: number;
    rarity: string;
  }>;
}

export function AchievementPreview({
  achievements = [],
}: AchievementPreviewProps) {
  // Fallback data if no achievements provided
  const fallbackAchievements = [
    {
      id: 'words-50',
      title: 'Học 50 từ',
      description: 'Bạn sắp mở khoá Huy hiệu Học 50 từ',
      icon: '📚',
      progress: 45,
      requirement: 50,
      xpReward: 100,
      rarity: 'common',
    },
    {
      id: 'streak-7',
      title: 'Streak 7 ngày',
      description: 'Bạn sắp mở khoá Huy hiệu Streak 7 ngày',
      icon: '🔥',
      progress: 5,
      requirement: 7,
      xpReward: 100,
      rarity: 'rare',
    },
    {
      id: 'pomodoro-10',
      title: '10 Pomodoro',
      description: 'Bạn sắp mở khoá Huy hiệu 10 Pomodoro',
      icon: '🍅',
      progress: 8,
      requirement: 10,
      xpReward: 100,
      rarity: 'rare',
    },
    {
      id: 'level-3',
      title: 'Level 3',
      description: 'Bạn sắp mở khoá Huy hiệu Level 3',
      icon: '⭐',
      progress: 2,
      requirement: 3,
      xpReward: 100,
      rarity: 'common',
    },
  ];

  const displayAchievements =
    achievements.length > 0 ? achievements : fallbackAchievements;
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium text-sm">
        Huy hiệu sắp mở khoá 🏆
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {displayAchievements.map(achievement => {
          const remaining = achievement.requirement - achievement.progress;
          const isClose = remaining <= 5;

          return (
            <div
              key={achievement.id}
              className={`bg-white/5 backdrop-blur-md rounded-xl p-3 text-center transition-all duration-200 hover:bg-white/10 ${
                isClose ? 'ring-1 ring-yellow-400/30' : ''
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                  {achievement.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-white text-xs font-medium leading-tight">
                    {achievement.title}
                  </h4>
                  <p className="text-white/60 text-xs leading-tight">
                    {isClose
                      ? `Còn ${remaining} nữa`
                      : `${achievement.progress}/${achievement.requirement}`}
                  </p>
                </div>
                <Progress
                  value={(achievement.progress / achievement.requirement) * 100}
                  className="h-1 bg-white/10"
                  indicatorClassName={
                    isClose
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                      : 'bg-white/20'
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
