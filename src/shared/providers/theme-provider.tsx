'use client';

import { useEffect } from 'react';

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'dark',
}: ThemeProviderProps) {
  useEffect(() => {
    if (attribute === 'class') {
      document.documentElement.classList.add(defaultTheme);
      return () => {
        document.documentElement.classList.remove(defaultTheme);
      };
    }

    document.documentElement.setAttribute(attribute, defaultTheme);
    return () => {
      document.documentElement.removeAttribute(attribute);
    };
  }, [attribute, defaultTheme]);

  return <>{children}</>;
}
