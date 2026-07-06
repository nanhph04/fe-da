import type { Metadata } from "next";
import "@fontsource/material-symbols-outlined";
import { Inter, Manrope } from "next/font/google";
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from "next/navigation";
import { themeConfig } from "@/shared/config/theme";
import { AppProviders } from "@/shared/providers/app-providers";
import { GlobalLoader } from "@/shared/components/GlobalLoader";
import { InitialLoader } from "@/shared/components/InitialLoader";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
});

function isSupportedLocale(locale: string): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export const metadata: Metadata = {
  title: "Velvet Gallery",
  description: "The Cinematic Canvas",
  keywords: ["video monetization", "creator platform", "studio wallet", "media distribution"],
  icons: {
    icon: "/images/logo-no-text.jpg",
    shortcut: "/images/logo-no-text.jpg",
    apple: "/images/logo-no-text.jpg",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${manrope.variable} ${themeConfig.forcedTheme} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {/* HTML/CSS-only splash loader to display instantly on initial load */}
        <InitialLoader />
        <style dangerouslySetInnerHTML={{ __html: `
          .initial-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #0e0e0e;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            opacity: 1;
            transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .initial-loader.fade-out {
            opacity: 0;
          }
          .loader-logo {
            color: #ffffff;
            font-family: var(--font-headline), sans-serif;
            font-size: 2.25rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 1.5rem;
            animation: breathing 2s ease-in-out infinite;
          }
          .loader-bar {
            width: 120px;
            height: 2px;
            background-color: #262626;
            position: relative;
            overflow: hidden;
            border-radius: 9999px;
          }
          .loader-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 50%;
            background-color: #E50914;
            border-radius: 9999px;
            animation: loading-slide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            box-shadow: 0 0 8px rgba(229, 9, 20, 0.6);
          }
          @keyframes breathing {
            0%, 100% { opacity: 0.6; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 10px rgba(229, 9, 20, 0.3)); }
          }
          @keyframes loading-slide {
            0% { left: -50%; }
            100% { left: 100%; }
          }
        `}} />

        <AppProviders locale={locale} messages={messages}>
          <GlobalLoader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
