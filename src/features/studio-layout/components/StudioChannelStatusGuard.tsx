"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { api } from "@/shared/api/client";
import { getLockedStudioRedirectPathFromChannel } from "@/shared/auth/studio-access";
import type { MyChannelResponse } from "@/features/watch/services/mediaService.types";

export function StudioChannelStatusGuard() {
  const router = useRouter();
  const isCheckingRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  const checkChannelStatus = useCallback(async () => {
    if (isCheckingRef.current || hasRedirectedRef.current) {
      return;
    }

    isCheckingRef.current = true;

    try {
      const response = await api.get<MyChannelResponse>("/api/media/me/channel", {
        requireAuth: true,
        suppressAuthRedirect: true,
      });
      const redirectPath = getLockedStudioRedirectPathFromChannel(response.data);

      if (redirectPath) {
        hasRedirectedRef.current = true;
        router.replace(redirectPath);
      }
    } catch {
      // Existing server-side guards still protect direct navigation and refreshes.
    } finally {
      isCheckingRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    void checkChannelStatus();

    const handleFocus = () => {
      void checkChannelStatus();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkChannelStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkChannelStatus]);

  return null;
}
