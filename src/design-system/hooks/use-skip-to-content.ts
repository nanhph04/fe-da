import { useEffect, useRef } from 'react';

export function useSkipToContent() {
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'absolute left-4 top-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-md shadow-lg transform -translate-y-full transition-transform hover:translate-y-0';
    skipLink.setAttribute('aria-label', 'Skip to main content');

    document.body.appendChild(skipLink);

    return () => {
      document.body.removeChild(skipLink);
    };
  }, []);

  return mainContentRef;
}