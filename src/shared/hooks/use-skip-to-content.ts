import { useEffect, useRef } from 'react';

export function useSkipToContent() {
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className =
      'absolute left-4 top-4 z-50 rounded-md bg-primary-600 px-4 py-2 text-foreground shadow-lg transition-transform hover:translate-y-0';
    skipLink.style.transform = 'translateY(-100%)';
    skipLink.setAttribute('aria-label', 'Skip to main content');

    document.body.appendChild(skipLink);

    return () => {
      document.body.removeChild(skipLink);
    };
  }, []);

  return mainContentRef;
}
