"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function GlobalLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);


  // 2. Complete route transition loader on pathname or search parameters change
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setLoading(false);
      setProgress(0);
    });
    return () => cancelAnimationFrame(handle);
  }, [pathname, searchParams]);

  // 3. Global click interceptor to trigger loading on internal navigations
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Check if it's an internal link
      const isInternal = href.startsWith("/") || href.startsWith(window.location.origin);
      const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const isTargetBlank = anchor.target === "_blank";

      if (isInternal && !isModified && !isTargetBlank) {
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Avoid triggering loader for anchor link scrolling on the same page
        if (
          url.pathname === currentUrl.pathname &&
          url.search === currentUrl.search &&
          url.hash !== currentUrl.hash
        ) {
          return;
        }

        // Set initial loading progress
        setLoading(true);
        setProgress(10);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  // 4. Simulate a progressive load animation
  useEffect(() => {
    if (!loading) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // cap progress until route changes
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [loading]);

  return (
    <>
      {loading && (
        <div
          className="fixed top-0 left-0 h-[3px] bg-primary z-[99999] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(229,9,20,0.8)]"
          style={{ width: `${progress}%` }}
        />
      )}
    </>
  );
}
