import { db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

export interface UserProgress {
  id: string;
  userId: string;
  todayProgress: number;
  dailyGoal: number;
  totalWordsLearned: number;
  streak: number;
  level: number;
  xp: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyStats {
  date: string;
  wordsLearned: number;
  studyTime: number; // in minutes
  missionsCompleted: number;
  xpEarned: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalWords: number;
  totalStudyTime: number;
  totalMissions: number;
  totalXP: number;
  averageDailyWords: number;
}

// Lấy hoặc tạo user progress
export async function getUserProgress(userId: string): Promise<UserProgress> {
  try {
    const progressRef = doc(db, 'user_progress', userId);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      return progressSnap.data() as UserProgress;
    } else {
      // Tạo progress mới
      const newProgress: UserProgress = {
        id: userId,
        userId,
        todayProgress: 0,
        dailyGoal: 20,
        totalWordsLearned: 0,
        streak: 0,
        level: 1,
        xp: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(progressRef, newProgress);
      return newProgress;
    }
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
}

// Cập nhật progress hôm nay
export async function updateTodayProgress(
  userId: string, 
  wordsLearned: number, 
  studyTimeMinutes: number = 0
): Promise<UserProgress> {
  try {
    const progressRef = doc(db, 'user_progress', userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Lấy progress hiện tại
    const currentProgress = await getUserProgress(userId);
    
    // Kiểm tra nếu là ngày mới
    const isNewDay = currentProgress.lastActiveDate !== today;
    
    if (isNewDay) {
      // Reset progress hôm nay và cập nhật streak
      const newStreak = currentProgress.lastActiveDate === 
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        ? currentProgress.streak + 1 
        : 1;

      await updateDoc(progressRef, {
        todayProgress: wordsLearned,
        totalWordsLearned: increment(wordsLearned),
        streak: newStreak,
        lastActiveDate: today,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Cập nhật progress hiện tại
      await updateDoc(progressRef, {
        todayProgress: increment(wordsLearned),
        totalWordsLearned: increment(wordsLearned),
        updatedAt: new Date().toISOString()
      });
    }

    // Lưu daily stats
    await saveDailyStats(userId, today, wordsLearned, studyTimeMinutes);

    return await getUserProgress(userId);
  } catch (error) {
    console.error('Error updating today progress:', error);
    throw error;
  }
}

// Lưu daily stats
async function saveDailyStats(
  userId: string, 
  date: string, 
  wordsLearned: number, 
  studyTimeMinutes: number
): Promise<void> {
  try {
    const statsRef = doc(db, 'daily_stats', `${userId}_${date}`);
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      await updateDoc(statsRef, {
        wordsLearned: increment(wordsLearned),
        studyTime: increment(studyTimeMinutes),
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(statsRef, {
        userId,
        date,
        wordsLearned,
        studyTime: studyTimeMinutes,
        missionsCompleted: 0,
        xpEarned: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving daily stats:', error);
    throw error;
  }
}

// Cập nhật XP và level
export async function updateXP(userId: string, xpEarned: number): Promise<UserProgress> {
  try {
    const progressRef = doc(db, 'user_progress', userId);
    const currentProgress = await getUserProgress(userId);
    
    const newXP = currentProgress.xp + xpEarned;
    const newLevel = Math.floor(newXP / 100) + 1; // Mỗi 100 XP = 1 level

    await updateDoc(progressRef, {
      xp: newXP,
      level: newLevel,
      updatedAt: new Date().toISOString()
    });

    return await getUserProgress(userId);
  } catch (error) {
    console.error('Error updating XP:', error);
    throw error;
  }
}

// Lấy weekly stats
export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  try {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const statsQuery = query(
      collection(db, 'daily_stats'),
      where('userId', '==', userId),
      where('date', '>=', weekStart.toISOString().split('T')[0]),
      where('date', '<=', weekEnd.toISOString().split('T')[0])
    );

    const statsSnap = await getDocs(statsQuery);
    
    let totalWords = 0;
    let totalStudyTime = 0;
    let totalMissions = 0;
    let totalXP = 0;
    let dayCount = 0;

    statsSnap.forEach(doc => {
      const data = doc.data();
      totalWords += data.wordsLearned || 0;
      totalStudyTime += data.studyTime || 0;
      totalMissions += data.missionsCompleted || 0;
      totalXP += data.xpEarned || 0;
      dayCount++;
    });

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalWords,
      totalStudyTime,
      totalMissions,
      totalXP,
      averageDailyWords: dayCount > 0 ? Math.round(totalWords / dayCount) : 0
    };
  } catch (error) {
    console.error('Error getting weekly stats:', error);
    throw error;
  }
}

// Cập nhật daily goal
export async function updateDailyGoal(userId: string, newGoal: number): Promise<UserProgress> {
  try {
    const progressRef = doc(db, 'user_progress', userId);
    
    await updateDoc(progressRef, {
      dailyGoal: newGoal,
      updatedAt: new Date().toISOString()
    });

    return await getUserProgress(userId);
  } catch (error) {
    console.error('Error updating daily goal:', error);
    throw error;
  }
}
