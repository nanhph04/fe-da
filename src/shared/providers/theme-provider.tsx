'use client';

import { useEffect, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (attribute === 'class') {
      document.documentElement.classList.add(defaultTheme);
      return;
    }

    document.documentElement.setAttribute(attribute, defaultTheme);
  }, [attribute, defaultTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
