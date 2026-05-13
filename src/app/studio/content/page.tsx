import { Suspense } from "react";
import { StudioContentFeature } from "@/features/studio-content";

export const metadata = {
  title: "Content | Aura Studio",
};

export default function StudioContentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading content library...</div>}>
      <StudioContentFeature />
    </Suspense>
  );
}
