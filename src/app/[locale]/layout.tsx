import type { Metadata } from "next";
import "@fontsource/material-symbols-outlined";
import { Inter, Manrope } from "next/font/google";
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from "next/navigation";
import { AppProviders } from "@/shared/providers/app-providers";
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
  var injectedAttributePattern = /^(bis_|__processed_)/;

  function isInjectedAttribute(attributeName) {
    return attributeName === 'bis_register' || injectedAttributePattern.test(attributeName);
  }

  function removeInjectedAttrsFromElement(element) {
    if (!element || !element.attributes) return;

    Array.prototype.slice.call(element.attributes).forEach(function (attribute) {
      if (isInjectedAttribute(attribute.name)) {
        element.removeAttribute(attribute.name);
      }
    });
  }

  function removeInjectedAttrs(root) {
    if (!root) return;

    if (root.nodeType === 1) {
      removeInjectedAttrsFromElement(root);
    }

    if (!root.querySelectorAll) return;

    root.querySelectorAll('*').forEach(removeInjectedAttrsFromElement);
  }

  removeInjectedAttrs(document.documentElement);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes') {
        removeInjectedAttrsFromElement(mutation.target);
        return;
      }

      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          removeInjectedAttrs(node);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true
  });

  window.addEventListener('load', function () {
    removeInjectedAttrs(document.documentElement);
    window.setTimeout(function () { observer.disconnect(); }, 1000);
  });
})();` }} />
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
