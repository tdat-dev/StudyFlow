import React, { useEffect, useMemo, useState } from 'react';
import { Swords, Skull, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import {
  getWeeklyBoss,
  getWeekCountdown,
  claimBossReward,
} from '../../../services/dashboard/bossService';
import type { WeeklyBoss as WeeklyBossType } from '../../../services/dashboard/bossService';
import Button from '../../ui/button';
import { updateXP } from '../../../services/dashboard/userProgressService';
import AnimatedBoss from './AnimatedBoss';

interface WeeklyBossProps {
  userId?: string;
}

export function WeeklyBoss({ userId }: WeeklyBossProps) {
  const [boss, setBoss] = useState<WeeklyBossType | null>(null);
  const [msRemaining, setMsRemaining] = useState<number>(0);
  const [lastDamage, setLastDamage] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    (async () => {
      if (!userId) return;
      const b = await getWeeklyBoss(userId);
      setBoss(b);
      setMsRemaining(getWeekCountdown().msRemaining);
      timer = setInterval(() => {
        setMsRemaining(getWeekCountdown().msRemaining);
      }, 1000);
    })();
    return () => timer && clearInterval(timer);
  }, [userId]);

  // Poll boss mỗi 2 giây để phát hiện giảm HP và hiển thị damage nổi
  useEffect(() => {
    if (!userId) return;
    let poller: any;
    let lastHp = boss?.hp ?? null;

    const startPolling = () => {
      poller = setInterval(async () => {
        try {
          const latest = await getWeeklyBoss(userId);
          // Tính damage khi HP giảm
          if (lastHp !== null && latest.hp < lastHp) {
            const dmg = lastHp - latest.hp;
            if (dmg > 0) {
              setLastDamage(dmg.toString());
            }
          }
          lastHp = latest.hp;
          setBoss(latest);
        } catch (e) {
          // ignore transient errors
        }
      }, 2000);
    };

    startPolling();
    return () => poller && clearInterval(poller);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const hpPercent = useMemo(() => {
    if (!boss) return 0;
    return boss.maxHp > 0 ? (boss.hp / boss.maxHp) * 100 : 0;
  }, [boss]);

  const timeLeftText = useMemo(() => {
    const sec = Math.floor(msRemaining / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [msRemaining]);

  if (!userId) return null;
  if (!boss) return null;

  return (
    <Card className="card-glass overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-base xl:text-lg text-[var(--text)] flex items-center gap-2">
          <Swords className="text-red-400 h-4 w-4" /> Boss tuần: {boss.bossName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text)]">
              Cấp {boss.level}
            </span>
            <span className="flex items-center gap-1" title="Thời gian còn lại">
              <Clock className="h-3 w-3" /> {timeLeftText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AnimatedBoss
              sprite={boss.sprite}
              bossName={boss.bossName}
              damageText={lastDamage}
              onHit={() => setLastDamage(null)}
            />
            <Skull className="h-3 w-3 text-red-400" />
            <span className="font-medium text-[var(--text)]">
              {boss.hp}/{boss.maxHp}
            </span>
          </div>
        </div>
        <Progress value={hpPercent} className="h-2" />
        {boss.defeated ? (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-green-400 text-xs">
              🎉 Đã hạ gục Boss tuần!{' '}
              {boss.rewardXP ? `+${boss.rewardXP} XP` : ''}
            </div>
            {!boss.rewardsClaimed && (
              <Button
                className="btn-primary px-3 py-1 text-xs"
                aria-label="Nhận thưởng Boss tuần"
                onClick={async () => {
                  if (!userId) return;
                  const updated = await claimBossReward(
                    userId,
                    async (uid, xp) => {
                      await updateXP(uid, xp);
                    },
                  );
                  setBoss(updated);
                  setLastDamage(null);
                }}
              >
                Nhận thưởng
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-2 text-[var(--muted)] text-xs">
            Gây sát thương bằng cách học từ vựng, hoàn thành Pomodoro, và thói
            quen.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
