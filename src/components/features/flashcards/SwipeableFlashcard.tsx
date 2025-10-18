import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface SwipeableFlashcardProps {
  front: string;
  back: string;
  example?: string;
  exampleTranslation?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
}

export function SwipeableFlashcard({
  front,
  back,
  example,
  exampleTranslation,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: SwipeableFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeIndicator, setSwipeIndicator] = useState<'left' | 'right' | null>(
    null,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset card position when card changes
  useEffect(() => {
    setIsFlipped(false);
    setDragOffset(0);
    setSwipeIndicator(null);
  }, [front, back]);

  // Ensure only one side is visible at a time
  useEffect(() => {
    const flipContainer = cardRef.current?.querySelector(
      '.transform-style-preserve-3d',
    );
    if (flipContainer) {
      const frontCard = flipContainer.querySelector(
        '.backface-hidden:not(.rotate-y-180)',
      );
      const backCard = flipContainer.querySelector(
        '.backface-hidden.rotate-y-180',
      );

      if (frontCard && backCard) {
        if (isFlipped) {
          (frontCard as HTMLElement).style.visibility = 'hidden';
          (backCard as HTMLElement).style.visibility = 'visible';
        } else {
          (frontCard as HTMLElement).style.visibility = 'visible';
          (backCard as HTMLElement).style.visibility = 'hidden';
        }
      }
    }
  }, [isFlipped]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setDragStartX(e.touches[0].clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setDragStartX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return;
    if (dragStartX === null) return;
    const currentX = e.touches[0].clientX;
    const newOffset = currentX - dragStartX;
    updateDragPosition(newOffset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled) return;
    if (dragStartX === null) return;
    const currentX = e.clientX;
    const newOffset = currentX - dragStartX;
    updateDragPosition(newOffset);
  };

  const updateDragPosition = (offset: number) => {
    // Limit the drag distance
    const maxDrag = 150;
    const limitedOffset = Math.max(Math.min(offset, maxDrag), -maxDrag);

    setDragOffset(limitedOffset);

    // Show swipe indicator based on drag direction and distance
    if (limitedOffset > 80) {
      setSwipeIndicator('right');
    } else if (limitedOffset < -80) {
      setSwipeIndicator('left');
    } else {
      setSwipeIndicator(null);
    }
  };

  const handleDragEnd = () => {
    if (disabled) return;
    if (dragStartX === null) return;

    // If dragged far enough, trigger the appropriate action
    if (dragOffset > 100) {
      onSwipeRight();
    } else if (dragOffset < -100) {
      onSwipeLeft();
    } else {
      // Reset position with animation
      setDragOffset(0);
    }

    setDragStartX(null);
    setSwipeIndicator(null);
  };

  const handleClick = () => {
    if (disabled) return;
    // Only flip if not dragging
    if (Math.abs(dragOffset) < 5) {
      setIsFlipped(!isFlipped);
    }
  };

  // Tạo lớp transform theo bậc để tránh inline style
  const dragClass = (() => {
    if (dragOffset > 100) return 'translate-x-24 rotate-3 drop-shadow-lg';
    if (dragOffset > 60) return 'translate-x-16 rotate-2 drop-shadow';
    if (dragOffset > 20) return 'translate-x-8 rotate-1';
    if (dragOffset < -100) return '-translate-x-24 -rotate-3 drop-shadow-lg';
    if (dragOffset < -60) return '-translate-x-16 -rotate-2 drop-shadow';
    if (dragOffset < -20) return '-translate-x-8 -rotate-1';
    return 'translate-x-0 rotate-0';
  })();

  return (
    <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl aspect-[4/3] perspective-1000 select-none mx-auto">
      {/* Enhanced Swipe indicators with glow effects */}
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/30 backdrop-blur-sm border border-red-500/30 flex items-center justify-center transition-all duration-300 z-10 ${
          swipeIndicator === 'left'
            ? 'opacity-100 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
            : 'opacity-0 scale-90'
        }`}
      >
        <X className="text-red-400 h-8 w-8 drop-shadow-lg" />
      </div>

      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-green-500/30 flex items-center justify-center transition-all duration-300 z-10 ${
          swipeIndicator === 'right'
            ? 'opacity-100 scale-110 shadow-[0_0_30px_rgba(34,197,94,0.5)]'
            : 'opacity-0 scale-90'
        }`}
      >
        <Check className="text-green-400 h-8 w-8 drop-shadow-lg" />
      </div>

      {/* Card with enhanced drag effects */}
      <div
        ref={cardRef}
        className={`relative w-full h-full transition-all duration-300 ${
          dragOffset !== 0 ? 'z-20' : 'z-10'
        } ${dragClass}`}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* Front - English only */}
          <div className="absolute inset-0 [backface-visibility:hidden] flashcard-enhanced">
            <div className="flex flex-col h-full min-h-0">
              <div className="flashcard-label flex-shrink-0">English</div>
              <div className="flex-grow flex items-center justify-center min-h-0 py-4">
                <h2 className="flashcard-title text-center">{front}</h2>
              </div>

              {example && (
                <div className="flashcard-example flex-shrink-0">
                  <p className="text-[var(--text)]/90 text-sm italic leading-relaxed">
                    &quot;{example}&quot;
                  </p>
                </div>
              )}

              <div className="flashcard-hint flex-shrink-0">
                Tap to see Vietnamese meaning
              </div>
            </div>
          </div>

          {/* Back - Vietnamese only */}
          <div className="absolute inset-0 [backface-visibility:hidden] flashcard-enhanced [transform:rotateY(180deg)]">
            <div className="flex flex-col h-full min-h-0">
              <div className="flashcard-label flex-shrink-0">Vietnamese</div>
              <div className="flex-grow flex items-center justify-center min-h-0 py-4">
                <h2 className="flashcard-title text-center">{back}</h2>
              </div>

              {exampleTranslation && (
                <div className="flashcard-example flex-shrink-0">
                  <p className="text-[var(--text)]/90 text-sm italic leading-relaxed">
                    &quot;{exampleTranslation}&quot;
                  </p>
                </div>
              )}

              <div className="flashcard-hint flex-shrink-0">
                Tap to see English word
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control buttons below flashcard */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => !disabled && onSwipeLeft()}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 
                     border border-red-500/30 rounded-xl transition-all duration-200
                     backdrop-blur-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
                     text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <span className="text-xl">✖</span>
          <span>Chưa nhớ</span>
        </button>

        <button
          onClick={() => !disabled && onSwipeRight()}
          className="flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 
                     border border-green-500/30 rounded-xl transition-all duration-200
                     backdrop-blur-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]
                     text-green-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <span className="text-xl">✓</span>
          <span>Đã nhớ</span>
        </button>
      </div>

      {/* Tailwind arbitrary properties are used instead of styled-jsx */}
    </div>
  );
}
