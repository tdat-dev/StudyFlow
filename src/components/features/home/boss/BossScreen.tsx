import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../../ui/card';
import Button from '../../../ui/button';
import { WeeklyBoss } from '../WeeklyBoss';

interface BossScreenProps {
  user: any;
  onBack?: () => void;
}

export function BossScreen({ user, onBack }: BossScreenProps) {
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
        <h2 className="text-base font-semibold">Boss tuần</h2>
      </div>

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
    </div>
  );
}

export default BossScreen;
