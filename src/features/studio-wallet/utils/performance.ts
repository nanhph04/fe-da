// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from 'react';

// Debounce utility
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle utility
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExec = useRef<number>(0);

  useEffect(() => {
    const handler = () => {
      const now = Date.now();
      if (now - lastExec.current >= delay) {
        setThrottledValue(value);
        lastExec.current = now;
      }
    };

    const timerId = setTimeout(handler, delay);
    return () => clearTimeout(timerId);
  }, [value, delay]);

  return throttledValue;
};

// Intersection Observer for infinite scroll
export const useIntersectionObserver = (
  threshold: number = 0.1
): [React.RefObject<HTMLDivElement>, boolean] => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

// Performance tracking hook
export const usePerformanceTracker = (name: string) => {
  const startTime = useRef<number>(0);
  const endTime = useRef<number>(0);

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    endTime.current = performance.now();
    const duration = endTime.current - startTime.current;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }, [name]);

  const track = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      start();
      try {
        const result = await fn();
        end();
        return result;
      } catch (error) {
        end();
        throw error;
      }
    },
    [start, end]
  );

  return { start, end, track };
};

// Virtual scroll hook
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = {
    startIndex: Math.max(0, Math.floor(scrollTop / itemHeight) - overscan),
    endIndex: Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    ),
  };

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return {
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
    containerProps: {
      style: {
        height: containerHeight,
        overflowY: 'auto',
        position: 'relative',
      } as React.CSSProperties,
    },
    listProps: {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: totalHeight,
      } as React.CSSProperties,
    },
    getItemStyle: (index: number) => ({
      position: 'absolute',
      top: index * itemHeight,
      left: 0,
      width: '100%',
      height: itemHeight,
    }) as React.CSSProperties,
  };
};

// Lazy load images
export const useLazyImage = (src: string, threshold: number = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setImageSrc(src);
        }
      },
      { threshold }
    );

    if (imageRef) {
      observer.observe(imageRef);
    }

    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, threshold, imageRef]);

  return {
    imageSrc,
    imageRef,
    isInView,
  };
};

// Memoize expensive calculations
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  return useCallback(callback, deps);
};

// Bundle size analyzer (development only)
export const useBundleAnalyzer = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Import bundle analyzer if needed
      import('next-bundle-analyzer').then((analyzer) => {
        // Run bundle analysis
        analyzer.default({
          openAnalyzer: false,
        });
      });
    }
  }, []);
};

// Error boundary for performance monitoring
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const captureError = useCallback((error: Error) => {
    setError(error);
    console.error('Performance Error Boundary:', error);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return { error, captureError, resetError };
};

// Component render time tracker
export const useRenderTime = (componentName: string) => {
  const renderStart = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    if (renderTime > 16) { // More than 16ms (60fps)
      console.warn(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  });
};
