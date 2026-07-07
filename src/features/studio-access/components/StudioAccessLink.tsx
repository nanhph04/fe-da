"use client";

import type { AriaAttributes, MouseEvent, ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { api, getErrorMessage } from "@/shared/api/client";
import { useToast } from "@/shared/components/toast";
import type { MyChannelResponse } from "@/features/watch/services/mediaService.types";
import {
  isLockedChannelStatus,
  LOCKED_CHANNEL_TOAST_DESCRIPTION,
  LOCKED_CHANNEL_TOAST_TITLE,
} from "../studio-access";

type StudioAccessLinkProps = {
  href?: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: AriaAttributes["aria-current"];
};

export function StudioAccessLink({
  href = "/studio",
  className,
  children,
  "aria-current": ariaCurrent,
}: StudioAccessLinkProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    try {
      const response = await api.get<MyChannelResponse>("/api/media/me/channel", {
        requireAuth: true,
        suppressAuthRedirect: true,
      });

      if (isLockedChannelStatus(response.data?.status)) {
        toast({
          title: LOCKED_CHANNEL_TOAST_TITLE,
          description: LOCKED_CHANNEL_TOAST_DESCRIPTION,
          variant: "warning",
        });
        return;
      }

      router.push(href);
    } catch (error) {
      toast({
        title: "Không thể kiểm tra trạng thái kênh",
        description: getErrorMessage(error, "Vui lòng thử lại sau."),
        variant: "error",
      });
    }
  };

  return (
    <a href={href} aria-current={ariaCurrent} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
