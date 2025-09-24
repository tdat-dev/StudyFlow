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
} from 'firebase/firestore';

export interface Mission {
  id: string;
  text: string;
  completed: boolean;
  xp: number;
  type: 'review' | 'quiz' | 'challenge' | 'pomodoro' | 'habit';
  completedAt?: string;
}

export interface DailyMissions {
  id: string;
  userId: string;
  date: string;
  missions: Mission[];
  completedCount: number;
  totalXP: number;
  createdAt: string;
  updatedAt: string;
}

// Mission templates
const MISSION_TEMPLATES: Omit<Mission, 'id' | 'completed' | 'completedAt'>[] = [
  { text: 'Ôn tập 5 từ vựng đã học', xp: 10, type: 'review' },
  { text: 'Làm quiz kiểm tra nhanh', xp: 15, type: 'quiz' },
  { text: 'Thử thách 5 phút', xp: 8, type: 'challenge' },
  { text: 'Hoàn thành 1 Pomodoro', xp: 20, type: 'pomodoro' },
  { text: 'Cập nhật thói quen học tập', xp: 12, type: 'habit' },
];

// Lấy hoặc tạo daily missions
export async function getDailyMissions(userId: string): Promise<DailyMissions> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const missionsRef = doc(db, 'daily_missions', `${userId}_${today}`);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const missionsSnap = await Promise.race([
      getDoc(missionsRef),
      timeoutPromise,
    ]);

    if (missionsSnap.exists()) {
      return missionsSnap.data() as DailyMissions;
    } else {
      // Tạo missions mới cho ngày hôm nay
      const newMissions: Mission[] = MISSION_TEMPLATES.map(
        (template, index) => ({
          id: `${today}_${index + 1}`,
          ...template,
          completed: false,
        }),
      );

      const dailyMissions: DailyMissions = {
        id: `${userId}_${today}`,
        userId,
        date: today,
        missions: newMissions,
        completedCount: 0,
        totalXP: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await Promise.race([setDoc(missionsRef, dailyMissions), timeoutPromise]);
      return dailyMissions;
    }
  } catch (error: any) {
    console.error('Error getting daily missions:', error);
    // Return default missions on network error
    if (error.message === 'Operation timeout' || error.code === 'unavailable') {
      const today = new Date().toISOString().split('T')[0];
      return {
        id: `${userId}_${today}`,
        userId,
        date: today,
        missions: [],
        completedCount: 0,
        totalXP: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}

// Hoàn thành mission
export async function completeMission(
  userId: string,
  missionId: string,
): Promise<{ missions: DailyMissions; xpEarned: number }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const missionsRef = doc(db, 'daily_missions', `${userId}_${today}`);

    const currentMissions = await getDailyMissions(userId);
    const missionIndex = currentMissions.missions.findIndex(
      m => m.id === missionId,
    );

    if (missionIndex === -1) {
      throw new Error('Mission not found');
    }

    const mission = currentMissions.missions[missionIndex];
    if (mission.completed) {
      throw new Error('Mission already completed');
    }

    // Cập nhật mission
    const updatedMissions = [...currentMissions.missions];
    updatedMissions[missionIndex] = {
      ...mission,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    const completedCount = updatedMissions.filter(m => m.completed).length;
    const totalXP = updatedMissions
      .filter(m => m.completed)
      .reduce((sum, m) => sum + m.xp, 0);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), 10000);
    });

    const updatePromise = updateDoc(missionsRef, {
      missions: updatedMissions,
      completedCount,
      totalXP,
      updatedAt: new Date().toISOString(),
    });

    await Promise.race([updatePromise, timeoutPromise]);

    return {
      missions: {
        ...currentMissions,
        missions: updatedMissions,
        completedCount,
        totalXP,
      },
      xpEarned: mission.xp,
    };
  } catch (error) {
    console.error('Error completing mission:', error);
    throw error;
  }
}

// Hoàn thành mission theo type
export async function completeMissionByType(
  userId: string,
  type: Mission['type'],
): Promise<{ missions: DailyMissions; xpEarned: number } | null> {
  try {
    const currentMissions = await getDailyMissions(userId);
    const mission = currentMissions.missions.find(
      m => m.type === type && !m.completed,
    );

    if (!mission) {
      return null; // Không có mission nào của type này chưa hoàn thành
    }

    return await completeMission(userId, mission.id);
  } catch (error) {
    console.error('Error completing mission by type:', error);
    throw error;
  }
}

// Reset missions cho ngày mới (nếu cần)
export async function resetDailyMissions(
  userId: string,
): Promise<DailyMissions> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const missionsRef = doc(db, 'daily_missions', `${userId}_${today}`);

    const newMissions: Mission[] = MISSION_TEMPLATES.map((template, index) => ({
      id: `${today}_${index + 1}`,
      ...template,
      completed: false,
    }));

    const dailyMissions: DailyMissions = {
      id: `${userId}_${today}`,
      userId,
      date: today,
      missions: newMissions,
      completedCount: 0,
      totalXP: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(missionsRef, dailyMissions);
    return dailyMissions;
  } catch (error) {
    console.error('Error resetting daily missions:', error);
    throw error;
  }
}

// Lấy lịch sử missions
export async function getMissionsHistory(
  userId: string,
  days: number = 7,
): Promise<DailyMissions[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const missionsQuery = query(
      collection(db, 'daily_missions'),
      where('userId', '==', userId),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      where('date', '<=', endDate.toISOString().split('T')[0]),
    );

    const missionsSnap = await getDocs(missionsQuery);
    const missions: DailyMissions[] = [];

    missionsSnap.forEach(doc => {
      missions.push(doc.data() as DailyMissions);
    });

    return missions.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error getting missions history:', error);
    throw error;
  }
}

// Lấy thống kê missions
export async function getMissionsStats(userId: string): Promise<{
  totalCompleted: number;
  totalXP: number;
  averageCompletion: number;
  streak: number;
}> {
  try {
    const history = await getMissionsHistory(userId, 30);

    let totalCompleted = 0;
    let totalXP = 0;
    let totalPossible = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    // Tính toán từ ngày gần nhất
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayMissions = history.find(h => h.date === dateStr);

      if (dayMissions) {
        totalCompleted += dayMissions.completedCount;
        totalXP += dayMissions.totalXP;
        totalPossible += dayMissions.missions.length;

        if (dayMissions.completedCount === dayMissions.missions.length) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      } else {
        currentStreak = 0;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
      totalCompleted,
      totalXP,
      averageCompletion:
        totalPossible > 0
          ? Math.round((totalCompleted / totalPossible) * 100)
          : 0,
      streak: maxStreak,
    };
  } catch (error) {
    console.error('Error getting missions stats:', error);
    throw error;
  }
}
