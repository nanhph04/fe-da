"use client";

import type { ReactNode } from "react";
import { VideoStatusEventsProvider } from "@/shared/hooks/use-video-status-events";

export function StudioVideoStatusEventsProvider({ children }: { children: ReactNode }) {
  return <VideoStatusEventsProvider>{children}</VideoStatusEventsProvider>;
}
