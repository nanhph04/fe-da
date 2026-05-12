import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource/material-symbols-outlined";
import { Inter, Manrope } from "next/font/google";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Commerce Platform",
  description: "The Cinematic Canvas",
  keywords: ["video monetization", "creator platform", "studio wallet", "media distribution"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${manrope.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0e0e10] text-[#f9f5f8]" suppressHydrationWarning>
        <Script id="remove-extension-hydration-attrs" strategy="beforeInteractive">
          {`(function () {
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
})();`}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
