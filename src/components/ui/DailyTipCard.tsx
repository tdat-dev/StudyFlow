import React from 'react';
import { Lightbulb } from 'lucide-react';

interface DailyTipCardProps {
  tip?: string;
  author?: string;
}

export function DailyTipCard({ 
  tip = "Học từ vựng mỗi ngày 15 phút hiệu quả hơn học 2 giờ một lần. Hãy chia nhỏ thời gian học để não bộ có thể ghi nhớ tốt hơn!",
  author = "StudyFlow Team"
}: DailyTipCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 text-sm text-white/80">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium mb-2">Mẹo học hôm nay ✨</h3>
          <p className="text-white/70 leading-relaxed mb-2">
            "{tip}"
          </p>
          <p className="text-white/50 text-xs">
            — {author}
          </p>
        </div>
      </div>
    </div>
  );
}
