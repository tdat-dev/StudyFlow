import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Check, X } from 'lucide-react';

interface SwipeableFlashcardProps {
  front: string;
  back: string;
  example?: string;
  exampleTranslation?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function SwipeableFlashcard({
  front,
  back,
  example,
  exampleTranslation,
  onSwipeLeft,
  onSwipeRight,
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
    setDragStartX(e.touches[0].clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const currentX = e.touches[0].clientX;
    const newOffset = currentX - dragStartX;
    updateDragPosition(newOffset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
    // Only flip if not dragging
    if (Math.abs(dragOffset) < 5) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="relative w-full max-w-sm aspect-[4/3] perspective-1000 select-none">
      {/* Swipe indicators */}
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center transition-opacity z-10 ${
          swipeIndicator === 'left' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <X className="text-red-600 h-6 w-6" />
      </div>

      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center transition-opacity z-10 ${
          swipeIndicator === 'right' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Check className="text-green-600 h-6 w-6" />
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className="relative w-full h-full transition-all duration-500"
        style={{
          transform: `translateX(${dragOffset}px)`,
        }}
      >
        <div
          className="relative w-full h-full transform-style-preserve-3d transition-transform duration-500"
          style={{
            transform: `rotateY(${isFlipped ? '180deg' : '0deg'})`,
          }}
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
          <Card className="absolute inset-0 backface-hidden cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent className="flex flex-col h-full p-6">
              <div className="w-full h-full flex flex-col">
                <div className="mb-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-md inline-block text-sm font-medium">
                  English
                </div>
                <div className="flex-grow flex items-center justify-center">
                  <h2 className="text-blue-900 text-2xl font-bold text-center leading-relaxed">
                    {front}
                  </h2>
                </div>

                {example && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 w-full">
                    <p className="text-gray-700 text-sm italic">
                      &quot;{example}&quot;
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-4 text-center">
                  <p className="text-gray-500 text-sm opacity-80">
                    Tap to see Vietnamese meaning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back - Vietnamese only */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent
              className="flex flex-col h-full p-6"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="w-full h-full flex flex-col">
                <div className="mb-4 px-3 py-1 bg-green-100 text-green-800 rounded-md inline-block text-sm font-medium">
                  Vietnamese
                </div>
                <div className="flex-grow flex items-center justify-center">
                  <h2 className="text-green-900 text-2xl font-bold text-center leading-relaxed">
                    {back}
                  </h2>
                </div>

                {exampleTranslation && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 w-full">
                    <p className="text-gray-700 text-sm italic">
                      &quot;{exampleTranslation}&quot;
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-4 text-center">
                  <p className="text-gray-500 text-sm opacity-80">
                    Tap to see English word
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
