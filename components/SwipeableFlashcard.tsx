import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Check, X } from 'lucide-react';

interface SwipeableFlashcardProps {
  front: string;
  back: string;
  example?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function SwipeableFlashcard({
  front,
  back,
  example,
  onSwipeLeft,
  onSwipeRight
}: SwipeableFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeIndicator, setSwipeIndicator] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset card position when card changes
  useEffect(() => {
    setIsFlipped(false);
    setDragOffset(0);
    setSwipeIndicator(null);
  }, [front, back]);

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
        className="relative w-full h-full transition-all duration-300 transform-style-preserve-3d"
        style={{
          transform: `translateX(${dragOffset}px) rotateY(${isFlipped ? '180deg' : '0deg'})`,
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
        {/* Front */}
        <Card className="absolute inset-0 backface-hidden cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-blue-900 mb-4 text-xl">{front}</h3>
            <p className="text-gray-500 text-sm">Nhấn để xem nghĩa</p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-green-900 mb-2 text-xl">{back}</h3>
            {example && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{example}</p>
              </div>
            )}
          </CardContent>
        </Card>
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
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
} 