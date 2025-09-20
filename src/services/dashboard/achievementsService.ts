import { db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'words' | 'streak' | 'pomodoro' | 'level' | 'missions' | 'time';
  requirement: number;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// Achievement templates
const ACHIEVEMENT_TEMPLATES: Omit<Achievement, 'id' | 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Words achievements
  { title: "Học 10 từ", description: "Học được 10 từ vựng đầu tiên", icon: "📚", category: "words", requirement: 10, xpReward: 50, rarity: "common" },
  { title: "Học 50 từ", description: "Học được 50 từ vựng", icon: "📖", category: "words", requirement: 50, xpReward: 100, rarity: "common" },
  { title: "Học 100 từ", description: "Học được 100 từ vựng", icon: "📚", category: "words", requirement: 100, xpReward: 200, rarity: "rare" },
  { title: "Học 500 từ", description: "Học được 500 từ vựng", icon: "📚", category: "words", requirement: 500, xpReward: 500, rarity: "epic" },
  { title: "Học 1000 từ", description: "Học được 1000 từ vựng", icon: "📚", category: "words", requirement: 1000, xpReward: 1000, rarity: "legendary" },
  
  // Streak achievements
  { title: "Streak 3 ngày", description: "Học liên tiếp 3 ngày", icon: "🔥", category: "streak", requirement: 3, xpReward: 30, rarity: "common" },
  { title: "Streak 7 ngày", description: "Học liên tiếp 7 ngày", icon: "🔥", category: "streak", requirement: 7, xpReward: 100, rarity: "rare" },
  { title: "Streak 30 ngày", description: "Học liên tiếp 30 ngày", icon: "🔥", category: "streak", requirement: 30, xpReward: 500, rarity: "epic" },
  { title: "Streak 100 ngày", description: "Học liên tiếp 100 ngày", icon: "🔥", category: "streak", requirement: 100, xpReward: 1000, rarity: "legendary" },
  
  // Pomodoro achievements
  { title: "5 Pomodoro", description: "Hoàn thành 5 phiên Pomodoro", icon: "🍅", category: "pomodoro", requirement: 5, xpReward: 50, rarity: "common" },
  { title: "10 Pomodoro", description: "Hoàn thành 10 phiên Pomodoro", icon: "🍅", category: "pomodoro", requirement: 10, xpReward: 100, rarity: "rare" },
  { title: "50 Pomodoro", description: "Hoàn thành 50 phiên Pomodoro", icon: "🍅", category: "pomodoro", requirement: 50, xpReward: 300, rarity: "epic" },
  { title: "100 Pomodoro", description: "Hoàn thành 100 phiên Pomodoro", icon: "🍅", category: "pomodoro", requirement: 100, xpReward: 500, rarity: "legendary" },
  
  // Level achievements
  { title: "Level 5", description: "Đạt level 5", icon: "⭐", category: "level", requirement: 5, xpReward: 100, rarity: "common" },
  { title: "Level 10", description: "Đạt level 10", icon: "⭐", category: "level", requirement: 10, xpReward: 200, rarity: "rare" },
  { title: "Level 25", description: "Đạt level 25", icon: "⭐", category: "level", requirement: 25, xpReward: 500, rarity: "epic" },
  { title: "Level 50", description: "Đạt level 50", icon: "⭐", category: "level", requirement: 50, xpReward: 1000, rarity: "legendary" },
  
  // Missions achievements
  { title: "Hoàn thành 10 nhiệm vụ", description: "Hoàn thành 10 nhiệm vụ hàng ngày", icon: "🎯", category: "missions", requirement: 10, xpReward: 100, rarity: "common" },
  { title: "Hoàn thành 50 nhiệm vụ", description: "Hoàn thành 50 nhiệm vụ hàng ngày", icon: "🎯", category: "missions", requirement: 50, xpReward: 300, rarity: "rare" },
  { title: "Hoàn thành 100 nhiệm vụ", description: "Hoàn thành 100 nhiệm vụ hàng ngày", icon: "🎯", category: "missions", requirement: 100, xpReward: 500, rarity: "epic" },
  { title: "Hoàn thành 500 nhiệm vụ", description: "Hoàn thành 500 nhiệm vụ hàng ngày", icon: "🎯", category: "missions", requirement: 500, xpReward: 1000, rarity: "legendary" },
  
  // Time achievements
  { title: "Học 1 giờ", description: "Tổng thời gian học 1 giờ", icon: "⏰", category: "time", requirement: 60, xpReward: 50, rarity: "common" },
  { title: "Học 10 giờ", description: "Tổng thời gian học 10 giờ", icon: "⏰", category: "time", requirement: 600, xpReward: 200, rarity: "rare" },
  { title: "Học 50 giờ", description: "Tổng thời gian học 50 giờ", icon: "⏰", category: "time", requirement: 3000, xpReward: 500, rarity: "epic" },
  { title: "Học 100 giờ", description: "Tổng thời gian học 100 giờ", icon: "⏰", category: "time", requirement: 6000, xpReward: 1000, rarity: "legendary" }
];

// Khởi tạo achievements cho user
export async function initializeUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const userAchievements: UserAchievement[] = [];
    
    for (const template of ACHIEVEMENT_TEMPLATES) {
      const achievementId = template.title.toLowerCase().replace(/\s+/g, '_');
      const userAchievementRef = doc(db, 'user_achievements', `${userId}_${achievementId}`);
      
      const userAchievement: UserAchievement = {
        id: `${userId}_${achievementId}`,
        userId,
        achievementId,
        unlocked: false,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(userAchievementRef, userAchievement);
      userAchievements.push(userAchievement);
    }
    
    return userAchievements;
  } catch (error) {
    console.error('Error initializing user achievements:', error);
    throw error;
  }
}

// Lấy achievements của user
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  try {
    const achievements: Achievement[] = [];
    
    for (const template of ACHIEVEMENT_TEMPLATES) {
      const achievementId = template.title.toLowerCase().replace(/\s+/g, '_');
      const userAchievementRef = doc(db, 'user_achievements', `${userId}_${achievementId}`);
      const userAchievementSnap = await getDoc(userAchievementRef);
      
      if (userAchievementSnap.exists()) {
        const userAchievement = userAchievementSnap.data() as UserAchievement;
        achievements.push({
          id: achievementId,
          ...template,
          unlocked: userAchievement.unlocked,
          unlockedAt: userAchievement.unlockedAt,
          progress: userAchievement.progress
        });
      } else {
        // Tạo mới nếu chưa có
        const userAchievement: UserAchievement = {
          id: `${userId}_${achievementId}`,
          userId,
          achievementId,
          unlocked: false,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(userAchievementRef, userAchievement);
        achievements.push({
          id: achievementId,
          ...template,
          unlocked: false,
          progress: 0
        });
      }
    }
    
    return achievements;
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
}

// Cập nhật progress cho achievement
export async function updateAchievementProgress(
  userId: string,
  category: Achievement['category'],
  progressIncrement: number
): Promise<{ unlockedAchievements: Achievement[]; totalXPEarned: number }> {
  try {
    const achievements = await getUserAchievements(userId);
    const categoryAchievements = achievements.filter(a => a.category === category);
    const unlockedAchievements: Achievement[] = [];
    let totalXPEarned = 0;
    
    for (const achievement of categoryAchievements) {
      if (achievement.unlocked) continue;
      
      const achievementId = achievement.id;
      const userAchievementRef = doc(db, 'user_achievements', `${userId}_${achievementId}`);
      
      const newProgress = achievement.progress + progressIncrement;
      const shouldUnlock = newProgress >= achievement.requirement;
      
      await updateDoc(userAchievementRef, {
        progress: newProgress,
        unlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString()
      });
      
      if (shouldUnlock) {
        unlockedAchievements.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          progress: newProgress
        });
        totalXPEarned += achievement.xpReward;
      }
    }
    
    return { unlockedAchievements, totalXPEarned };
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    throw error;
  }
}

// Lấy achievements sắp mở khóa
export async function getUpcomingAchievements(userId: string, limit: number = 4): Promise<Achievement[]> {
  try {
    const achievements = await getUserAchievements(userId);
    const upcomingAchievements = achievements
      .filter(a => !a.unlocked && a.progress > 0)
      .sort((a, b) => {
        const aRemaining = a.requirement - a.progress;
        const bRemaining = b.requirement - b.progress;
        return aRemaining - bRemaining;
      })
      .slice(0, limit);
    
    return upcomingAchievements;
  } catch (error) {
    console.error('Error getting upcoming achievements:', error);
    throw error;
  }
}

// Lấy achievements đã mở khóa
export async function getUnlockedAchievements(userId: string): Promise<Achievement[]> {
  try {
    const achievements = await getUserAchievements(userId);
    return achievements.filter(a => a.unlocked);
  } catch (error) {
    console.error('Error getting unlocked achievements:', error);
    throw error;
  }
}

// Lấy thống kê achievements
export async function getAchievementStats(userId: string): Promise<{
  totalUnlocked: number;
  totalXP: number;
  byRarity: Record<Achievement['rarity'], number>;
  byCategory: Record<Achievement['category'], number>;
}> {
  try {
    const achievements = await getUserAchievements(userId);
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    
    const stats = {
      totalUnlocked: unlockedAchievements.length,
      totalXP: unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0),
      byRarity: {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      } as Record<Achievement['rarity'], number>,
      byCategory: {
        words: 0,
        streak: 0,
        pomodoro: 0,
        level: 0,
        missions: 0,
        time: 0
      } as Record<Achievement['category'], number>
    };
    
    unlockedAchievements.forEach(achievement => {
      stats.byRarity[achievement.rarity]++;
      stats.byCategory[achievement.category]++;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting achievement stats:', error);
    throw error;
  }
}
