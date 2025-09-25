export interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  title: string;
}

export interface XPGain {
  action: string;
  amount: number;
  description: string;
}

// Định nghĩa các hoạt động trao XP
export const XP_ACTIONS = {
  COMPLETE_FLASHCARD: { amount: 5, description: 'Hoàn thành flashcard' },
  COMPLETE_POMODORO: { amount: 25, description: 'Hoàn thành phiên pomodoro' },
  CHAT_WITH_AI: { amount: 3, description: 'Trò chuyện với AI' },
  COMPLETE_HABIT: { amount: 10, description: 'Hoàn thành thói quen hàng ngày' },
  CREATE_FLASHCARD_DECK: { amount: 15, description: 'Tạo bộ flashcard mới' },
  DAILY_LOGIN: { amount: 5, description: 'Đăng nhập hàng ngày' },
  STREAK_BONUS_3: { amount: 20, description: 'Bonus 3 ngày liên tiếp' },
  STREAK_BONUS_7: { amount: 50, description: 'Bonus 7 ngày liên tiếp' },
  STREAK_BONUS_30: { amount: 200, description: 'Bonus 30 ngày liên tiếp' },
};

// Định nghĉa các level và XP cần thiết
export const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: 'Người mới bắt đầu' },
  { level: 2, xpRequired: 100, title: 'Học viên tập sự' },
  { level: 3, xpRequired: 250, title: 'Học viên chăm chỉ' },
  { level: 4, xpRequired: 500, title: 'Học sinh giỏi' },
  { level: 5, xpRequired: 800, title: 'Học sinh xuất sắc' },
  { level: 6, xpRequired: 1200, title: 'Chuyên gia nhỏ' },
  { level: 7, xpRequired: 1700, title: 'Chuyên gia' },
  { level: 8, xpRequired: 2300, title: 'Cao thủ' },
  { level: 9, xpRequired: 3000, title: 'Bậc thầy' },
  { level: 10, xpRequired: 4000, title: 'Đại sư' },
  { level: 11, xpRequired: 5200, title: 'Truyền thuyết' },
  { level: 12, xpRequired: 6600, title: 'Huyền thoại' },
  { level: 13, xpRequired: 8200, title: 'Thần thoại' },
  { level: 14, xpRequired: 10000, title: 'Vô địch thiên hạ' },
  { level: 15, xpRequired: 12000, title: 'Siêu phàm' },
];

/**
 * Tính toán level từ tổng XP
 */
export function calculateLevel(totalXP: number): UserLevel {
  let userLevel = LEVEL_THRESHOLDS[0];

  // Tìm level hiện tại
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xpRequired) {
      userLevel = LEVEL_THRESHOLDS[i];
      break;
    }
  }

  // Tìm level tiếp theo
  const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(
    l => l.level === userLevel.level + 1,
  );
  const nextLevel =
    nextLevelIndex !== -1 ? LEVEL_THRESHOLDS[nextLevelIndex] : null;

  const currentLevelXP = userLevel.xpRequired;
  const nextLevelXP = nextLevel?.xpRequired || totalXP;
  const currentXP = totalXP - currentLevelXP;
  const xpToNextLevel = nextLevelXP - totalXP;

  return {
    level: userLevel.level,
    currentXP: Math.max(0, currentXP),
    xpToNextLevel: Math.max(0, xpToNextLevel),
    totalXP,
    title: userLevel.title,
  };
}

/**
 * Thêm XP cho người dùng
 */
export function addXP(
  currentTotalXP: number,
  xpGain: number,
): {
  oldLevel: UserLevel;
  newLevel: UserLevel;
  levelUp: boolean;
  xpGained: number;
} {
  const oldLevel = calculateLevel(currentTotalXP);
  const newTotalXP = currentTotalXP + xpGain;
  const newLevel = calculateLevel(newTotalXP);

  return {
    oldLevel,
    newLevel,
    levelUp: newLevel.level > oldLevel.level,
    xpGained: xpGain,
  };
}

/**
 * Lấy thông tin level chi tiết với icon và color
 */
export function getLevelInfo(level: number): {
  level: number;
  name: string;
  icon: any;
  bgColor: string;
  color: string;
} {
  // Import React icons locally if needed or use emoji
  const levelData =
    LEVEL_THRESHOLDS.find(l => l.level === level) || LEVEL_THRESHOLDS[0];

  // Define icon classes based on level for now, can be improved with actual React icons
  let iconClass = 'User';
  let bgColor = 'bg-gray-100';
  let color = 'text-gray-600';

  if (level >= 15) {
    iconClass = 'Crown';
    bgColor = 'bg-purple-100';
    color = 'text-purple-600';
  } else if (level >= 12) {
    iconClass = 'Trophy';
    bgColor = 'bg-yellow-100';
    color = 'text-yellow-600';
  } else if (level >= 10) {
    iconClass = 'Award';
    bgColor = 'bg-orange-100';
    color = 'text-orange-600';
  } else if (level >= 8) {
    iconClass = 'Star';
    bgColor = 'bg-red-100';
    color = 'text-red-600';
  } else if (level >= 6) {
    iconClass = 'Target';
    bgColor = 'bg-blue-100';
    color = 'text-blue-600';
  } else if (level >= 4) {
    iconClass = 'BookOpen';
    bgColor = 'bg-green-100';
    color = 'text-green-600';
  } else if (level >= 2) {
    iconClass = 'Zap';
    bgColor = 'bg-yellow-100';
    color = 'text-yellow-600';
  }

  return {
    level,
    name: levelData.title,
    icon: iconClass as any, // Will be resolved at runtime
    bgColor,
    color,
  };
}

/**
 * Lấy tiến trình XP hiện tại
 */
export function getXPProgress(totalXP: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const userLevel = calculateLevel(totalXP);
  const current = userLevel.currentXP;
  const required = current + userLevel.xpToNextLevel;
  const percentage = required > 0 ? (current / required) * 100 : 100;

  return {
    current,
    required,
    percentage,
  };
}

/**
 * Lấy màu sắc theo level
 */
export function getLevelColor(level: number): string {
  if (level >= 15) return 'from-purple-600 to-pink-600'; // Siêu phàm
  if (level >= 12) return 'from-purple-500 to-indigo-600'; // Huyền thoại+
  if (level >= 10) return 'from-yellow-500 to-orange-500'; // Đại sư+
  if (level >= 8) return 'from-red-500 to-pink-500'; // Cao thủ+
  if (level >= 6) return 'from-blue-500 to-purple-500'; // Chuyên gia+
  if (level >= 4) return 'from-green-500 to-blue-500'; // Học sinh giỏi+
  if (level >= 2) return 'from-yellow-400 to-green-500'; // Học viên+
  return 'from-gray-400 to-blue-400'; // Người mới
}

/**
 * Lấy icon theo level
 */
export function getLevelIcon(level: number): string {
  if (level >= 15) return '👑'; // Siêu phàm
  if (level >= 12) return '🏆'; // Huyền thoại+
  if (level >= 10) return '🥇'; // Đại sư+
  if (level >= 8) return '🥈'; // Cao thủ+
  if (level >= 6) return '🥉'; // Chuyên gia+
  if (level >= 4) return '🎖️'; // Học sinh giỏi+
  if (level >= 2) return '🏅'; // Học viên+
  return '🌟'; // Người mới
}

/**
 * Tạo progress bar text
 */
export function getProgressText(userLevel: UserLevel): string {
  if (userLevel.xpToNextLevel === 0) {
    return 'Cấp độ tối đa!';
  }
  return `${userLevel.currentXP} / ${
    userLevel.currentXP + userLevel.xpToNextLevel
  } XP`;
}
