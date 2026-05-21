"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type ResolvedTheme = "light" | "dark";
type ThemeAttribute = "class" | `data-${string}`;

type ThemeProviderProps = {
  children: ReactNode;
  themes?: string[];
  forcedTheme?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  defaultTheme?: string;
  attribute?: ThemeAttribute | ThemeAttribute[];
  value?: Record<string, string>;
  disableTransitionOnChange?: boolean;
};

type UseThemeProps = {
  themes: string[];
  forcedTheme?: string;
  setTheme: Dispatch<SetStateAction<string>>;
  theme?: string;
  resolvedTheme?: string;
  systemTheme?: ResolvedTheme;
};

const DEFAULT_THEMES = ["light", "dark"];
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<UseThemeProps | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function resolveTheme(theme: string | undefined, enableSystem: boolean): ResolvedTheme {
  if (theme === "system" && enableSystem) {
    return getSystemTheme();
  }

  return theme === "light" ? "light" : "dark";
}

function getStoredTheme(storageKey: string, defaultTheme: string) {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  try {
    return localStorage.getItem(storageKey) ?? defaultTheme;
  } catch {
    return defaultTheme;
  }
}

function disableTransitions() {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode("*{transition:none!important;animation:none!important}"),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => style.remove());
    });
  };
}

export function ThemeProvider({
  children,
  themes = DEFAULT_THEMES,
  forcedTheme,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = "theme",
  defaultTheme = enableSystem ? "system" : "light",
  attribute = "data-theme",
  value,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() => getStoredTheme(storageKey, defaultTheme));
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  const applyTheme = useCallback(
    (nextTheme: string) => {
      const resolvedTheme = resolveTheme(nextTheme, enableSystem);
      const attributeValue = value?.[resolvedTheme] ?? resolvedTheme;
      const cleanupTransitions = disableTransitionOnChange ? disableTransitions() : undefined;
      const root = document.documentElement;
      const attributes = Array.isArray(attribute) ? attribute : [attribute];
      const removableValues = new Set(
        [...themes, "light", "dark"].map(themeName => value?.[themeName] ?? themeName),
      );

      attributes.forEach(attributeName => {
        if (attributeName === "class") {
          root.classList.remove(...removableValues);
          root.classList.add(attributeValue);
          return;
        }

        root.setAttribute(attributeName, attributeValue);
      });

      if (enableColorScheme) {
        root.style.colorScheme = resolvedTheme;
      }

      cleanupTransitions?.();
    },
    [attribute, disableTransitionOnChange, enableColorScheme, enableSystem, themes, value],
  );

  const setTheme = useCallback<Dispatch<SetStateAction<string>>>(
    nextTheme => {
      setThemeState(currentTheme => {
        const resolvedNextTheme = typeof nextTheme === "function" ? nextTheme(currentTheme) : nextTheme;

        try {
          localStorage.setItem(storageKey, resolvedNextTheme);
        } catch {
        }

        applyTheme(forcedTheme ?? resolvedNextTheme);
        return resolvedNextTheme;
      });
    },
    [applyTheme, forcedTheme, storageKey],
  );

  useEffect(() => {
    applyTheme(forcedTheme ?? theme);
  }, [applyTheme, forcedTheme, theme]);

  useEffect(() => {
    if (!enableSystem) {
      return;
    }

    const media = window.matchMedia(MEDIA_QUERY);
    const handleChange = () => {
      const nextSystemTheme = getSystemTheme();

      setSystemTheme(nextSystemTheme);
      setThemeState(currentTheme => {
        if ((forcedTheme ?? currentTheme) === "system") {
          applyTheme("system");
        }

        return currentTheme;
      });
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [applyTheme, enableSystem, forcedTheme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return;
      }

      const nextTheme = event.newValue ?? defaultTheme;
      setThemeState(nextTheme);
      applyTheme(forcedTheme ?? nextTheme);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [applyTheme, defaultTheme, forcedTheme, storageKey]);

  const contextValue = useMemo<UseThemeProps>(() => {
    const activeTheme = forcedTheme ?? theme;

    return {
      themes: enableSystem ? ["system", ...themes] : themes,
      forcedTheme,
      setTheme,
      theme: forcedTheme ?? theme,
      resolvedTheme: resolveTheme(activeTheme, enableSystem),
      systemTheme,
    };
  }, [enableSystem, forcedTheme, setTheme, systemTheme, theme, themes]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
