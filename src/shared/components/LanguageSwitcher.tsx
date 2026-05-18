'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const options = [
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
  ] as const;

  const current = options.find(o => o.value === locale) ?? options[0];

  const handleLanguageChange = (newLocale: string) => {
    // Preserve the current path, but switch the locale
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Change language"
        className="flex h-9 items-center justify-center gap-2 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onClick={() => setOpen(prev => !prev)}
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:inline-block">{current.flag}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-md border border-border bg-popover py-1 shadow-lg">
            {options.map(option => {
              const isActive = locale === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground font-bold'
                      : 'text-popover-foreground hover:bg-accent'
                  }`}
                  onClick={() => handleLanguageChange(option.value)}
                >
                  <span className="text-lg">{option.flag}</span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
