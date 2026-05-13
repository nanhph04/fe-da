"use client";

import { useMemo, useState } from "react";
import type { TagResponse } from "@/features/watch/services/mediaService";

interface TagSectionProps {
  tags: TagResponse[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSection({ tags, selectedTagIds, onChange }: TagSectionProps) {
  const [query, setQuery] = useState("");

  const filteredTags = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tags;
    }

    return tags.filter(tag => {
      const name = tag.name.toLowerCase();
      const slug = tag.slug.toLowerCase();

      return name.includes(normalizedQuery) || slug.includes(normalizedQuery);
    });
  }, [query, tags]);

  return (
    <div className="space-y-5 rounded-lg border border-border/30 bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Tags
          </label>
          <p className="text-xs text-muted-foreground">Optional active tags for discovery and search.</p>
        </div>
        {selectedTagIds.length > 0 ? (
          <span className="shrink-0 rounded-sm border border-secondary/30 bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
            {selectedTagIds.length} selected
          </span>
        ) : null}
      </div>

      <div className="relative">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground">
          sell
        </span>
        <input
          type="search"
          aria-label="Search tags"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search tags..."
          className="h-10 w-full rounded-sm border border-border/40 bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/60"
        />
      </div>

      <div className="max-h-56 overflow-y-auto pr-1 [scrollbar-color:#484847_#19191c] [scrollbar-width:thin]">
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <div className="w-full rounded-sm border border-dashed border-border/30 bg-background/60 px-4 py-6 text-center text-xs text-muted-foreground">
              Loading tags...
            </div>
          ) : filteredTags.length > 0 ? (
            filteredTags.map(tag => {
              const isSelected = selectedTagIds.includes(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    const nextTagIds = isSelected
                      ? selectedTagIds.filter(item => item !== tag.id)
                      : [...selectedTagIds, tag.id];
                    onChange(nextTagIds);
                  }}
                  className={`rounded-sm border px-3 py-2 text-xs font-bold transition-colors ${
                    isSelected
                      ? "border-primary/70 bg-primary/10 text-primary"
                      : "border-border/30 bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  #{tag.slug}
                </button>
              );
            })
          ) : (
            <div className="w-full rounded-sm border border-dashed border-border/30 bg-background/60 px-4 py-6 text-center text-xs text-muted-foreground">
              No matching tag found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
