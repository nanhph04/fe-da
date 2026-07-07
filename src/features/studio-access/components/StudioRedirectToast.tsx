"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { useToast } from "@/shared/components/toast";
import {
  LOCKED_CHANNEL_REDIRECT_DESCRIPTION,
  LOCKED_CHANNEL_TOAST_TITLE,
  LOCKED_STUDIO_REASON,
} from "../studio-access";

export function StudioRedirectToast() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const blockedReason = searchParams.get("studioBlocked");

  useEffect(() => {
    if (blockedReason !== LOCKED_STUDIO_REASON) {
      return;
    }

    toast({
      title: LOCKED_CHANNEL_TOAST_TITLE,
      description: LOCKED_CHANNEL_REDIRECT_DESCRIPTION,
      variant: "warning",
    });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("studioBlocked");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [blockedReason, pathname, router, searchParams, toast]);

  return null;
}
