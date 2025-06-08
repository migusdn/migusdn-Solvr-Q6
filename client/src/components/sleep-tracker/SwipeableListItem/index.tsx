import React, { useState, useRef, useEffect } from 'react';

interface SwipeableListItemProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  children,
  onClick,
  className = '',
}) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const swipeThreshold = 80; // Minimum distance to trigger action

  // Reset swipe state when component unmounts or when actions change
  useEffect(() => {
    return () => {
      setSwipeOffset(0);
      setIsSwiping(false);
    };
  }, [onSwipeLeft, onSwipeRight]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    // Limit the swipe distance
    const maxSwipe = 120;
    let newOffset = diff;

    // If no action for the direction, don't allow swiping that way
    if ((diff > 0 && !onSwipeRight) || (diff < 0 && !onSwipeLeft)) {
      newOffset = 0;
    }

    // Apply resistance as we get further from center
    if (Math.abs(diff) > 40) {
      const excess = Math.abs(diff) - 40;
      const dampen = 0.5; // Dampening factor
      newOffset = diff > 0 
        ? 40 + excess * dampen 
        : -40 - excess * dampen;
    }

    // Limit to max swipe distance
    newOffset = Math.max(-maxSwipe, Math.min(maxSwipe, newOffset));

    setSwipeOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    // If swiped far enough, trigger the action
    if (swipeOffset > swipeThreshold && onSwipeRight) {
      onSwipeRight();
    } else if (swipeOffset < -swipeThreshold && onSwipeLeft) {
      onSwipeLeft();
    }

    // Reset position
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  const handleClick = () => {
    // Only trigger click if not swiping significantly
    if (Math.abs(swipeOffset) < 10 && onClick) {
      onClick();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons that appear when swiped */}
      <div className="absolute inset-y-0 left-0 flex items-center justify-start">
        {rightAction}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center justify-end">
        {leftAction}
      </div>

      {/* Main content */}
      <div
        ref={itemRef}
        className={`relative ${className}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          {children}

          {/* Swipe indicator - only visible on small screens */}
          <div className="ml-2 sm:hidden flex items-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableListItem;
