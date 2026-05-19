"use client";

import type { ComponentProps, ReactNode } from "react";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ThemeProvider } from "@/shared/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
  locale: string;
  messages: ComponentProps<typeof NextIntlClientProvider>["messages"];
};

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Asia/Ho_Chi_Minh"
      >
        <Suspense fallback={null}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}