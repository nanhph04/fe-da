"use client";

import { useState } from "react";

interface CreatorSectionProps {
  description: string;
}

export function CreatorSection({ description }: CreatorSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDescription = Boolean(description.trim());

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-lg border border-border/20 bg-card p-8 transition-all duration-300">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-foreground">Mô tả video</h2>
            <p className="text-xs text-muted-foreground">Thông tin được đồng bộ từ media service.</p>
          </div>
        </div>

        <p className={`whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground/80 ${isExpanded ? "" : "line-clamp-4"}`}>
          {hasDescription ? description : "Chưa có mô tả cho video này."}
        </p>

        {hasDescription && description.length > 220 ? (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-6 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
