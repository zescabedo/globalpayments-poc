import { useEffect, useRef, useState, RefObject } from 'react';

/**
 * Configuration options for scroll progress tracking
 */
export interface UseScrollProgressOptions {
  /**
   * Viewport position where animation starts (0-1)
   * 0 = top of viewport, 1 = bottom
   * @default 0.8 (starts when element is 80% down viewport)
   */
  startThreshold?: number;
  
  /**
   * Viewport position where animation completes (0-1)
   * @default 0.2 (completes when element is 20% from top)
   */
  endThreshold?: number;
  
  /**
   * If true, animation only runs once and locks at completion
   * @default false
   */
  once?: boolean;
  
  /**
   * Smoothing factor for progress changes (0-1)
   * Higher = smoother but more lag
   * @default 0 (no smoothing)
   */
  smoothing?: number;
}

/**
 * Return value for useScrollProgress hook
 */
export interface UseScrollProgressReturn {
  /**
   * Ref to attach to the element you want to track
   */
  elementRef: RefObject<HTMLDivElement | null>;
  
  /**
   * Scroll progress from 0 to 1 (0 = not started, 1 = complete)
   */
  progress: number;
}

/**
 * Custom hook that tracks an element's scroll progress through the viewport.
 * 
 * Calculates progress based on element position relative to viewport boundaries,
 * with configurable start/end thresholds for precise control over the animation zone.
 * 
 * @param options - Configuration for scroll tracking behavior
 * @returns Object containing element ref and current progress (0-1)
 * 
 * @example
 * ```tsx
 * const { elementRef, progress } = useScrollProgress({
 *   startThreshold: 0.8,
 *   endThreshold: 0.2,
 *   once: false,
 * });
 * 
 * <div ref={elementRef}>
 *   Progress: {Math.round(progress * 100)}%
 * </div>
 * ```
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}): UseScrollProgressReturn {
  const {
    startThreshold = 0.8,
    endThreshold = 0.2,
    once = false,
    smoothing = 0,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const targetProgressRef = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    /**
     * Calculate scroll progress based on element position
     * Formula: progress = (startPosition - elementTop) / (startPosition - endPosition + elementHeight)
     */
    const calculateProgress = (): void => {
      // If once=true and animation already completed, don't recalculate
      if (once && isComplete) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calculate viewport positions for start and end
      // startThreshold 0.8 = 80% down viewport = viewportHeight * 0.8
      // endThreshold 0.2 = 20% from top = viewportHeight * 0.2
      const startPosition = viewportHeight * startThreshold;
      const endPosition = viewportHeight * endThreshold;

      // Calculate raw progress
      let newProgress = 0;

      if (elementTop <= startPosition) {
        // Element has entered the animation zone
        const scrollDistance = startPosition - endPosition + elementHeight;
        const scrolled = startPosition - elementTop;
        newProgress = Math.min(1, Math.max(0, scrolled / scrollDistance));
      }

      // Apply smoothing if enabled
      if (smoothing > 0) {
        targetProgressRef.current = newProgress;
      } else {
        setProgress(newProgress);
      }

      // Mark as completed when progress reaches 1
      if (newProgress >= 1 && !isComplete) {
        setIsComplete(true);
      }
    };

    /**
     * Smooth animation loop using requestAnimationFrame
     */
    const smoothAnimation = (): void => {
      if (smoothing === 0) return;

      setProgress((currentProgress) => {
        const diff = targetProgressRef.current - currentProgress;
        const delta = diff * (1 - smoothing);
        
        // Continue animating if difference is significant
        if (Math.abs(diff) > 0.001) {
          rafRef.current = requestAnimationFrame(smoothAnimation);
          return currentProgress + delta;
        }
        
        return targetProgressRef.current;
      });
    };

    /**
     * Scroll event handler with performance optimization
     */
    const handleScroll = (): void => {
      calculateProgress();
      
      // Start smooth animation if smoothing is enabled
      if (smoothing > 0 && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(smoothAnimation);
      }
    };

    /**
     * Resize event handler to recalculate on viewport changes
     */
    const handleResize = (): void => {
      calculateProgress();
    };

    // Initial calculation on mount
    calculateProgress();

    // Add passive event listeners for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [startThreshold, endThreshold, once, smoothing, isComplete]);

  return { elementRef, progress };
}

export default useScrollProgress;




