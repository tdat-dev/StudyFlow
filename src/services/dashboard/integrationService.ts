import { db } from '../firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  getUserProgress,
  updateTodayProgress,
  updateXP,
} from './userProgressService';
import { completeMissionByType } from './missionsService';

/**
 * Service tích hợp các tính năng chính của ứng dụng
 * - Flashcard: tracking từ vựng đã học
 * - Pomodoro: tracking thời gian tập trung
 * - Habits: tracking thói quen hàng ngày
 */

export interface IntegratedProgress {
  // Flashcard progress
  wordsLearnedToday: number;
  totalWordsLearned: number;
  flashcardsCompleted: number;

  // Pomodoro progress
  pomodorosCompletedToday: number;
  totalFocusTimeMinutes: number;
  currentStreak: number;

  // Habits progress
  habitsCompletedToday: number;
  totalHabits: number;
  weeklyHabitProgress: number;

  // Overall stats
  dailyGoal: number;
  dailyProgress: number;
  level: number;
  xp: number;
  streak: number;
}

export interface QuickActionResult {
  success: boolean;
  xpEarned: number;
  progressUpdated: boolean;
  message: string;
}

/**
 * Cập nhật progress từ flashcard khi học xong từ vựng
 */
export async function updateFlashcardProgress(
  userId: string,
  wordsLearned: number,
  studyTimeMinutes: number = 0,
): Promise<QuickActionResult> {
  try {
    // Cập nhật progress tổng thể
    await updateTodayProgress(userId, wordsLearned, studyTimeMinutes);

    // Hoàn thành mission review nếu có
    const missionResult = await completeMissionByType(userId, 'review');
    const xpEarned = missionResult?.xpEarned || 0;

    // Cập nhật stats flashcard riêng biệt
    await updateFlashcardStats(userId, wordsLearned, studyTimeMinutes);

    return {
      success: true,
      xpEarned,
      progressUpdated: true,
      message: `Đã học ${wordsLearned} từ vựng mới! +${xpEarned} XP`,
    };
  } catch (error) {
    console.error('Error updating flashcard progress:', error);
    return {
      success: false,
      xpEarned: 0,
      progressUpdated: false,
      message: 'Có lỗi khi cập nhật tiến độ flashcard',
    };
  }
}

/**
 * Cập nhật progress từ pomodoro khi hoàn thành session
 */
export async function updatePomodoroProgress(
  userId: string,
  pomodorosCompleted: number = 1,
  focusTimeMinutes: number = 25,
): Promise<QuickActionResult> {
  try {
    // Cập nhật stats pomodoro
    await updatePomodoroStats(userId, pomodorosCompleted, focusTimeMinutes);

    // Hoàn thành mission pomodoro
    const missionResult = await completeMissionByType(userId, 'pomodoro');
    const xpEarned = missionResult?.xpEarned || 0;

    // Cập nhật XP dựa trên số pomodoro hoàn thành
    const pomodoroXP = pomodorosCompleted * 20; // 20 XP per pomodoro
    await updateXP(userId, pomodoroXP);

    return {
      success: true,
      xpEarned: xpEarned + pomodoroXP,
      progressUpdated: true,
      message: `Hoàn thành ${pomodorosCompleted} Pomodoro! +${pomodoroXP + xpEarned} XP`,
    };
  } catch (error) {
    console.error('Error updating pomodoro progress:', error);
    return {
      success: false,
      xpEarned: 0,
      progressUpdated: false,
      message: 'Có lỗi khi cập nhật tiến độ Pomodoro',
    };
  }
}

/**
 * Cập nhật progress từ habits khi đánh dấu hoàn thành
 */
export async function updateHabitProgress(
  userId: string,
  habitId: string,
  completed: boolean,
): Promise<QuickActionResult> {
  try {
    // Cập nhật habit completion
    await updateHabitCompletion(userId, habitId, completed);

    // Hoàn thành mission habit nếu đây là habit đầu tiên hoàn thành hôm nay
    const missionResult = await completeMissionByType(userId, 'habit');
    const xpEarned = missionResult?.xpEarned || 0;

    // Cập nhật XP cho habit completion
    const habitXP = completed ? 10 : -5; // Reward completion, small penalty for unchecking
    await updateXP(userId, habitXP);

    return {
      success: true,
      xpEarned: xpEarned + habitXP,
      progressUpdated: true,
      message: completed
        ? `Hoàn thành thói quen! +${habitXP + xpEarned} XP`
        : `Bỏ đánh dấu thói quen. ${habitXP} XP`,
    };
  } catch (error) {
    console.error('Error updating habit progress:', error);
    return {
      success: false,
      xpEarned: 0,
      progressUpdated: false,
      message: 'Có lỗi khi cập nhật tiến độ thói quen',
    };
  }
}

/**
 * Lấy tổng hợp progress từ tất cả các tính năng
 */
export async function getIntegratedProgress(
  userId: string,
): Promise<IntegratedProgress> {
  try {
    const [userProgress, flashcardStats, pomodoroStats, habitStats] =
      await Promise.all([
        getUserProgress(userId),
        getFlashcardStats(userId),
        getPomodoroStats(userId),
        getHabitStats(userId),
      ]);

    return {
      wordsLearnedToday: flashcardStats.wordsLearnedToday,
      totalWordsLearned: userProgress.totalWordsLearned,
      flashcardsCompleted: flashcardStats.flashcardsCompleted,

      pomodorosCompletedToday: pomodoroStats.pomodorosCompletedToday,
      totalFocusTimeMinutes: pomodoroStats.totalFocusTimeMinutes,
      currentStreak: userProgress.streak,

      habitsCompletedToday: habitStats.habitsCompletedToday,
      totalHabits: habitStats.totalHabits,
      weeklyHabitProgress: habitStats.weeklyHabitProgress,

      dailyGoal: userProgress.dailyGoal,
      dailyProgress: userProgress.todayProgress,
      level: userProgress.level,
      xp: userProgress.xp,
      streak: userProgress.streak,
    };
  } catch (error) {
    console.error('Error getting integrated progress:', error);
    // Return default values
    return {
      wordsLearnedToday: 0,
      totalWordsLearned: 0,
      flashcardsCompleted: 0,
      pomodorosCompletedToday: 0,
      totalFocusTimeMinutes: 0,
      currentStreak: 0,
      habitsCompletedToday: 0,
      totalHabits: 0,
      weeklyHabitProgress: 0,
      dailyGoal: 20,
      dailyProgress: 0,
      level: 1,
      xp: 0,
      streak: 0,
    };
  }
}

/**
 * Reset habits hàng tuần và cập nhật realtime
 */
export async function resetWeeklyHabits(userId: string): Promise<void> {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    // Kiểm tra nếu đã reset tuần này chưa
    const lastResetRef = doc(db, 'habit_resets', userId);
    const lastResetSnap = await getDoc(lastResetRef);

    const lastResetDate = lastResetSnap.exists()
      ? new Date(lastResetSnap.data()?.lastResetDate || 0)
      : new Date(0);

    if (lastResetDate < startOfWeek) {
      // Reset habits cho tuần mới
      await resetHabitsForWeek(userId);

      // Cập nhật ngày reset cuối
      await setDoc(lastResetRef, {
        userId,
        lastResetDate: startOfWeek.toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error resetting weekly habits:', error);
  }
}

// Helper functions

async function updateFlashcardStats(
  userId: string,
  wordsLearned: number,
  studyTimeMinutes: number,
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, 'flashcard_stats', `${userId}_${today}`);

  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    await updateDoc(statsRef, {
      wordsLearned: increment(wordsLearned),
      studyTime: increment(studyTimeMinutes),
      flashcardsCompleted: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } else {
    await setDoc(statsRef, {
      userId,
      date: today,
      wordsLearned,
      studyTime: studyTimeMinutes,
      flashcardsCompleted: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function updatePomodoroStats(
  userId: string,
  pomodorosCompleted: number,
  focusTimeMinutes: number,
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, 'pomodoro_stats', `${userId}_${today}`);

  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    await updateDoc(statsRef, {
      pomodorosCompleted: increment(pomodorosCompleted),
      focusTime: increment(focusTimeMinutes),
      updatedAt: new Date().toISOString(),
    });
  } else {
    await setDoc(statsRef, {
      userId,
      date: today,
      pomodorosCompleted,
      focusTime: focusTimeMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function updateHabitCompletion(
  userId: string,
  habitId: string,
  completed: boolean,
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const completionRef = doc(
    db,
    'habit_completions',
    `${userId}_${habitId}_${today}`,
  );

  await setDoc(completionRef, {
    userId,
    habitId,
    date: today,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function getFlashcardStats(userId: string): Promise<{
  wordsLearnedToday: number;
  flashcardsCompleted: number;
}> {
  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, 'flashcard_stats', `${userId}_${today}`);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    const data = statsSnap.data();
    return {
      wordsLearnedToday: data.wordsLearned || 0,
      flashcardsCompleted: data.flashcardsCompleted || 0,
    };
  }

  return { wordsLearnedToday: 0, flashcardsCompleted: 0 };
}

async function getPomodoroStats(userId: string): Promise<{
  pomodorosCompletedToday: number;
  totalFocusTimeMinutes: number;
}> {
  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, 'pomodoro_stats', `${userId}_${today}`);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    const data = statsSnap.data();
    return {
      pomodorosCompletedToday: data.pomodorosCompleted || 0,
      totalFocusTimeMinutes: data.focusTime || 0,
    };
  }

  return { pomodorosCompletedToday: 0, totalFocusTimeMinutes: 0 };
}

async function getHabitStats(userId: string): Promise<{
  habitsCompletedToday: number;
  totalHabits: number;
  weeklyHabitProgress: number;
}> {
  const today = new Date().toISOString().split('T')[0];

  // Lấy tất cả habits của user
  const habitsRef = collection(db, 'habits');
  const habitsQuery = query(habitsRef, where('userId', '==', userId));
  const habitsSnap = await getDocs(habitsQuery);

  const totalHabits = habitsSnap.size;
  let habitsCompletedToday = 0;

  // Đếm habits hoàn thành hôm nay
  for (const habitDoc of habitsSnap.docs) {
    const completionRef = doc(
      db,
      'habit_completions',
      `${userId}_${habitDoc.id}_${today}`,
    );
    const completionSnap = await getDoc(completionRef);

    if (completionSnap.exists() && completionSnap.data()?.completed) {
      habitsCompletedToday++;
    }
  }

  // Tính weekly progress (7 ngày gần nhất)
  const weeklyHabitProgress = await calculateWeeklyHabitProgress(userId);

  return {
    habitsCompletedToday,
    totalHabits,
    weeklyHabitProgress,
  };
}

async function calculateWeeklyHabitProgress(userId: string): Promise<number> {
  const today = new Date();
  let totalProgress = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Lấy habits hoàn thành trong ngày này
    const habitsRef = collection(db, 'habits');
    const habitsQuery = query(habitsRef, where('userId', '==', userId));
    const habitsSnap = await getDocs(habitsQuery);

    let dayProgress = 0;
    for (const habitDoc of habitsSnap.docs) {
      const completionRef = doc(
        db,
        'habit_completions',
        `${userId}_${habitDoc.id}_${dateStr}`,
      );
      const completionSnap = await getDoc(completionRef);

      if (completionSnap.exists() && completionSnap.data()?.completed) {
        dayProgress++;
      }
    }

    totalProgress += dayProgress;
  }

  return totalProgress;
}

async function resetHabitsForWeek(userId: string): Promise<void> {
  // Reset weekly progress cho tất cả habits
  const habitsRef = collection(db, 'habits');
  const habitsQuery = query(habitsRef, where('userId', '==', userId));
  const habitsSnap = await getDocs(habitsQuery);

  for (const habitDoc of habitsSnap.docs) {
    await updateDoc(doc(db, 'habits', habitDoc.id), {
      weeklyProgress: [false, false, false, false, false, false, false], // 7 ngày
      updatedAt: new Date().toISOString(),
    });
  }
}
