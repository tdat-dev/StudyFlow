import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface WeeklyBoss {
  id: string;
  userId: string;
  weekStart: string; // ISO date (yyyy-mm-dd)
  weekEnd: string; // ISO date
  bossName: string;
  sprite?: string;
  level: number;
  maxHp: number;
  hp: number;
  totalDamage: number;
  defeated: boolean;
  rewardsClaimed: boolean;
  rewardXP?: number; // XP thưởng khi hạ boss
  createdAt: string;
  updatedAt: string;
}

function getWeekRange(date = new Date()): { start: Date; end: Date } {
  // Start Monday 00:00:00, End Sunday 23:59:59
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday=0
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getWeekId(
  userId: string,
  date = new Date(),
): { id: string; startStr: string; endStr: string } {
  const { start, end } = getWeekRange(date);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  return { id: `${userId}_${startStr}`, startStr, endStr };
}

function calculateBossTemplate(level: number): {
  name: string;
  maxHp: number;
  sprite: string;
} {
  // Simple scaling: base 1000 HP + 250 per level
  const base = 1000 + (level - 1) * 250;
  const maxHp = Math.max(500, base);
  const bosses = [
    { name: 'Slime Chúa', sprite: 'slime' },
    { name: 'Golem Đá', sprite: 'golem' },
    { name: 'Wyvern Băng', sprite: 'wyvern' },
    { name: 'Pháp Sư Bóng Đêm', sprite: 'mage' },
    { name: 'Cơ Giáp Titan', sprite: 'mech' },
  ];
  const pick = bosses[(level - 1) % bosses.length];
  return { name: pick.name, maxHp, sprite: pick.sprite };
}

export async function getOrCreateWeeklyBoss(
  userId: string,
  level: number = 1,
): Promise<WeeklyBoss> {
  const { id, startStr, endStr } = getWeekId(userId);
  const ref = doc(db, 'weekly_boss', id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as WeeklyBoss;
  }

  const { name, maxHp, sprite } = calculateBossTemplate(level);
  const boss: WeeklyBoss = {
    id,
    userId,
    weekStart: startStr,
    weekEnd: endStr,
    bossName: name,
    sprite,
    level,
    maxHp,
    hp: maxHp,
    totalDamage: 0,
    defeated: false,
    rewardsClaimed: false,
    rewardXP: Math.round(maxHp * 0.1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(ref, boss);
  return boss;
}

export async function getWeeklyBoss(userId: string): Promise<WeeklyBoss> {
  // Default level 1 for first creation; could be read from user progress later
  return await getOrCreateWeeklyBoss(userId, 1);
}

export async function attackBoss(
  userId: string,
  damage: number,
): Promise<WeeklyBoss> {
  if (damage <= 0) {
    return await getWeeklyBoss(userId);
  }

  const boss = await getWeeklyBoss(userId);
  if (boss.defeated) {
    return boss;
  }

  const newHp = Math.max(0, boss.hp - damage);
  const defeated = newHp === 0;
  const ref = doc(db, 'weekly_boss', boss.id);

  await updateDoc(ref, {
    hp: newHp,
    totalDamage: boss.totalDamage + damage,
    defeated,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getDoc(ref);
  return updated.data() as WeeklyBoss;
}

export function getWeekCountdown(): { msRemaining: number } {
  const { end } = getWeekRange();
  const msRemaining = Math.max(0, end.getTime() - Date.now());
  return { msRemaining };
}

export async function claimBossReward(
  userId: string,
  grantXP: (userId: string, xp: number) => Promise<void>,
): Promise<WeeklyBoss> {
  const boss = await getWeeklyBoss(userId);
  if (!boss.defeated || boss.rewardsClaimed) return boss;

  const reward = boss.rewardXP || 0;
  if (reward > 0) {
    await grantXP(userId, reward);
  }

  const ref = doc(db, 'weekly_boss', boss.id);
  await updateDoc(ref, {
    rewardsClaimed: true,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getDoc(ref);
  return updated.data() as WeeklyBoss;
}
