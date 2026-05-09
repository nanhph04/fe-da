import { useCallback, useEffect } from 'react';

interface KeyboardNavigationOptions {
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  rtl?: boolean;
  activeIndex?: number;
  setActiveIndex?: (index: number) => void;
}

export function useKeyboardNavigation(
  items: unknown[],
  options: KeyboardNavigationOptions = {}
) {
  const {
    orientation = 'vertical',
    loop = true,
    rtl = false,
    activeIndex = -1,
    setActiveIndex,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isHorizontal = orientation === 'horizontal';

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          if (!isHorizontal) {
            move(-1);
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (!isHorizontal) {
            move(1);
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          if (isHorizontal) {
            move(rtl ? 1 : -1);
          }
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (isHorizontal) {
            move(rtl ? -1 : 1);
          }
          break;

        case 'Home':
          event.preventDefault();
          setActiveIndex?.(0);
          break;

        case 'End':
          event.preventDefault();
          setActiveIndex?.(items.length - 1);
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          break;
      }

      function move(direction: number) {
        if (!setActiveIndex) {
          return;
        }

        let newIndex = activeIndex + direction;

        if (loop) {
          if (newIndex < 0) newIndex = items.length - 1;
          if (newIndex >= items.length) newIndex = 0;
        } else {
          newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
        }

        setActiveIndex(newIndex);
      }
    },
    [activeIndex, items.length, loop, orientation, rtl, setActiveIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { handleKeyDown };
}
