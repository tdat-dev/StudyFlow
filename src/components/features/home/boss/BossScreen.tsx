import React, { useState } from 'react';
import { ArrowLeft, Swords, Target } from 'lucide-react';
import { Card, CardContent } from '../../../ui/card';
import Button from '../../../ui/button';
import { WeeklyBoss } from '../WeeklyBoss';
import BossBattleCanvas from '../../pomodoro/BossBattleCanvas';

interface BossScreenProps {
  user: any;
  onBack?: () => void;
}

export function BossScreen({ user, onBack }: BossScreenProps) {
  const [activeMode, setActiveMode] = useState<'weekly' | 'battle'>('weekly');

  return (
    <div className="h-full w-full bg-[var(--bg)] p-2 flex flex-col overflow-y-auto scrollbar-glass text-[var(--text)]">
      <div className="mb-2 flex items-center gap-2">
        <Button
          className="btn-ghost px-3 py-1 text-xs"
          aria-label="Quay lại"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
        <h2 className="text-base font-semibold">Boss</h2>
      </div>

      {/* Mode Toggle */}
      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setActiveMode('weekly')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${
            activeMode === 'weekly' ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          <Target className="h-4 w-4" />
          Boss Tuần
        </Button>
        <Button
          onClick={() => setActiveMode('battle')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${
            activeMode === 'battle' ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          <Swords className="h-4 w-4" />
          Boss Battle
        </Button>
      </div>

      {/* Content based on active mode */}
      {activeMode === 'weekly' ? (
        <div className="space-y-3">
          <WeeklyBoss userId={user?.uid} />

          <Card className="card-glass">
            <CardContent className="p-4 text-sm text-[var(--muted)]">
              - Học từ vựng, hoàn thành Pomodoro, đánh dấu thói quen để gây sát
              thương.
              <br />- Hạ gục Boss trước khi hết tuần để nhận thưởng XP một lần.
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="card-glass">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">
                Boss Battle Canvas
              </h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                Thử thách boss với hệ thống chiến đấu tương tác. Sử dụng các kỹ
                năng để hạ gục boss và nhận thưởng!
              </p>

              <BossBattleCanvas
                spriteUrl="/boss-sprite.svg"
                cols={4}
                rows={2}
                fps={8}
                use3D={false}
                maxHp={1000}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-4 text-sm text-[var(--muted)]">
              <h4 className="font-semibold text-[var(--text)] mb-2">
                Hướng dẫn:
              </h4>
              <ul className="space-y-1">
                <li>
                  • <strong>Attack:</strong> Tấn công thường (50-150 sát thương)
                </li>
                <li>
                  • <strong>Crit:</strong> Đòn chí mạng (100-300 sát thương)
                </li>
                <li>
                  • <strong>Heal:</strong> Hồi phục 100-300 HP
                </li>
                <li>
                  • <strong>Auto Attack:</strong> Tự động tấn công mỗi giây
                </li>
                <li>
                  • <strong>Reset:</strong> Khôi phục boss về trạng thái ban đầu
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BossScreen;
