import type { Metadata } from "next";
import "@fontsource/material-symbols-outlined";
import { Inter, Manrope } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from "next/navigation";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ThemeProvider } from "@/shared/providers/theme-provider";
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
  title: "Media Commerce Platform",
  description: "The Cinematic Canvas",
  keywords: ["video monetization", "creator platform", "studio wallet", "media distribution"],
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
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: `(function () {
  function removeInjectedAttrs(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('[bis_skin_checked]').forEach(function (element) {
      element.removeAttribute('bis_skin_checked');
    });
  }

  removeInjectedAttrs(document);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
        mutation.target.removeAttribute('bis_skin_checked');
        return;
      }

      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          if (node.hasAttribute && node.hasAttribute('bis_skin_checked')) {
            node.removeAttribute('bis_skin_checked');
          }
          removeInjectedAttrs(node);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['bis_skin_checked']
  });

  window.addEventListener('load', function () {
    removeInjectedAttrs(document);
    window.setTimeout(function () { observer.disconnect(); }, 1000);
  });
})();` }} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
