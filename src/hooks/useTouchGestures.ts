import { useEffect, useRef } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
}

export const useTouchGestures = (options: TouchGestureOptions) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialPinchDistanceRef = useRef<number>(0);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    threshold = 50
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - prepare for swipe or tap
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      } else if (e.touches.length === 2) {
        // Two touches - prepare for pinch
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialPinchDistanceRef.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && onPinch) {
        // Handle pinch gesture
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (initialPinchDistanceRef.current > 0) {
          const scale = distance / initialPinchDistanceRef.current;
          onPinch(scale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchStart = touchStartRef.current;
      if (!touchStart || e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check for tap vs swipe
      if (distance < threshold && deltaTime < 300) {
        // This is a tap
        const now = Date.now();
        if (now - lastTapRef.current < 300 && onDoubleTap) {
          // Double tap
          onDoubleTap();
          lastTapRef.current = 0; // Reset to prevent triple tap
        } else {
          // Single tap
          setTimeout(() => {
            if (now === lastTapRef.current && onTap) {
              onTap();
            }
          }, 300);
          lastTapRef.current = now;
        }
      } else if (distance >= threshold) {
        // This is a swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
      initialPinchDistanceRef.current = 0;
    };

    // Add passive event listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onTap, onDoubleTap, threshold]);

  return elementRef;
};

// Mobile vibration feedback
export const vibrate = (pattern?: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern || 50);
  }
};

// Check if device supports touch
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get device orientation
export const getOrientation = () => {
  if (screen.orientation) {
    return screen.orientation.angle;
  }
  return window.orientation || 0;
};

// Mobile-specific utilities
export const MobileUtils = {
  vibrate,
  isTouchDevice,
  getOrientation,
  
  // Prevent default touch behaviors
  preventDefaultTouch: (element: HTMLElement) => {
    element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  },
  
  // Enable smooth scrolling on iOS
  enableSmoothScrolling: (element: HTMLElement) => {
    (element.style as CSSStyleDeclaration & { webkitOverflowScrolling?: string }).webkitOverflowScrolling = 'touch';
  },
  
  // Get safe area insets for notched devices
  getSafeAreaInsets: () => ({
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'),
    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0'),
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0'),
    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0'),
  })
};