"use client";

import type { ComponentProps, ReactNode } from "react";
import { Suspense, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { themeConfig } from "@/shared/config/theme";
import { ThemeProvider } from "@/shared/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
  locale: string;
  messages: ComponentProps<typeof NextIntlClientProvider>["messages"];
};

const injectedAttributePattern = /^(bis_|__processed_)/;

function isInjectedAttribute(attributeName: string) {
  return attributeName === "bis_register" || injectedAttributePattern.test(attributeName);
}

function removeInjectedAttrsFromElement(element: Element) {
  Array.from(element.attributes).forEach(attribute => {
    if (isInjectedAttribute(attribute.name)) {
      element.removeAttribute(attribute.name);
    }
  });
}

function removeInjectedAttrs(root: Element | null) {
  if (!root) {
    return;
  }

  removeInjectedAttrsFromElement(root);
  root.querySelectorAll("*").forEach(removeInjectedAttrsFromElement);
}

function ExtensionInjectedAttributeCleanup() {
  useEffect(() => {
    const removeDocumentAttrs = () => removeInjectedAttrs(document.documentElement);

    removeDocumentAttrs();

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === "attributes") {
          if (mutation.target instanceof Element) {
            removeInjectedAttrsFromElement(mutation.target);
          }
          return;
        }

        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) {
            removeInjectedAttrs(node);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    window.addEventListener("load", removeDocumentAttrs);
    const disconnectTimer = window.setTimeout(() => observer.disconnect(), 1000);

    return () => {
      window.removeEventListener("load", removeDocumentAttrs);
      window.clearTimeout(disconnectTimer);
      observer.disconnect();
    };
  }, []);

  return null;
}

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <>
      <ExtensionInjectedAttributeCleanup />
      <ThemeProvider
        attribute="class"
        defaultTheme={themeConfig.defaultTheme}
        forcedTheme={themeConfig.forcedTheme}
        enableSystem={themeConfig.enableSystem}
        themes={[...themeConfig.supportedThemes]}
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
    </>
  );
}