"use client";

import { useMemo, useState } from "react";
import type { CategoryResponse } from "@/features/watch/services/mediaService";

interface CategorySectionProps {
  categories: CategoryResponse[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export function CategorySection({
  categories,
  selectedCategories,
  onChange,
}: CategorySectionProps) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter(category => {
      const name = category.name.toLowerCase();
      const slug = category.slug.toLowerCase();

      return name.includes(normalizedQuery) || slug.includes(normalizedQuery);
    });
  }, [categories, query]);

  return (
    <div className="space-y-6 rounded-lg border border-[#262528] bg-[#131315] p-6">
      <div>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Categories
            </label>
            <p className="text-xs text-zinc-400">Select at least one category</p>
          </div>
          {selectedCategories.length > 0 ? (
            <span className="shrink-0 rounded-sm border border-secondary/30 bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
              {selectedCategories.length} selected
            </span>
          ) : null}
        </div>

        <div className="relative mb-4">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">
            search
          </span>
          <input
            type="search"
            aria-label="Tìm category"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Tìm category..."
            className="h-10 w-full rounded-sm border border-border/40 bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary/60"
          />
        </div>

        <div className="max-h-72 overflow-y-auto pr-1 [scrollbar-color:#484847_#19191c] [scrollbar-width:thin]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {categories.length === 0 ? (
              <div className="col-span-full rounded-sm border border-dashed border-border/30 bg-background/60 px-4 py-6 text-center text-xs text-zinc-500">
                Loading categories...
              </div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat.slug);
                return (
                  <label key={cat.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={isSelected}
                      onChange={() => {
                        const nextCategories = isSelected
                          ? selectedCategories.filter(item => item !== cat.slug)
                          : [...selectedCategories, cat.slug];
                        onChange(nextCategories);
                      }}
                    />
                    <div
                      title={cat.name}
                      className={`min-h-11 rounded-lg border px-3 py-2 text-xs font-bold leading-snug transition-all ${
                        isSelected
                          ? "border-[#ff8e80] bg-[#ff8e80]/10 text-[#ff8e80]"
                          : "border-[#262528] bg-[#19191c] text-zinc-400 hover:bg-[#262528] hover:text-zinc-200"
                      }`}
                    >
                      <span className="block truncate">{cat.name}</span>
                      <span className="mt-0.5 block truncate text-[10px] font-medium text-zinc-600">
                        {cat.slug}
                      </span>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="col-span-full rounded-sm border border-dashed border-border/30 bg-background/60 px-4 py-6 text-center">
                <p className="text-xs font-medium text-zinc-400">Không tìm thấy category phù hợp.</p>
                <p className="mt-1 text-[10px] text-zinc-600">Thử tìm theo tên hoặc slug category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
