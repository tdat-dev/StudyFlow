import React, { useEffect, useRef, useState } from 'react';

interface AnimatedBossProps {
  sprite?: string;
  bossName: string;
  onHit?: () => void;
  damageText?: string | null;
}

/**
 * Hiển thị boss với biểu tượng emoji tùy theo sprite và hiệu ứng nhận sát thương đơn giản.
 */
export function AnimatedBoss({
  sprite,
  bossName,
  onHit,
  damageText,
}: AnimatedBossProps) {
  const [isHit, setIsHit] = useState(false);
  const [shake, setShake] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (damageText) {
      setIsHit(true);
      setShake(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setIsHit(false);
        setShake(false);
      }, 500);
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [damageText]);

  const emoji =
    sprite === 'slime'
      ? '🟢'
      : sprite === 'golem'
        ? '🪨'
        : sprite === 'wyvern'
          ? '🐉'
          : sprite === 'mage'
            ? '🧙'
            : sprite === 'mech'
              ? '🤖'
              : '👾';

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        className={
          'w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl select-none transition-transform duration-150 ' +
          (shake
            ? 'animate-[wiggle_0.15s_ease-in-out_3] scale-95'
            : 'hover:scale-105')
        }
        aria-label={`Boss: ${bossName}`}
        title={bossName}
        onClick={onHit}
      >
        <span className={isHit ? 'opacity-80' : ''}>{emoji}</span>
      </button>

      {damageText && (
        <span className="absolute -top-3 text-xs text-red-400 animate-bounce select-none">
          -{damageText}
        </span>
      )}

      <style jsx>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-3px);
          }
          50% {
            transform: translateX(3px);
          }
          75% {
            transform: translateX(-2px);
          }
        }
      `}</style>
    </div>
  );
}

export default AnimatedBoss;
