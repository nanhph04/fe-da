"use client";

import { useMemo, useState } from "react";
import type { CategoryResponse } from "@/features/watch/services/mediaService";

interface CategorySectionProps {
  categories: CategoryResponse[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
}

export function CategorySection({
  categories,
  selectedCategoryId,
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

  const selectedCategory = categories.find(category => category.id === selectedCategoryId);

  return (
    <div className="space-y-6 rounded-lg border border-border/30 bg-card p-6">
      <div>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Category
            </label>
            <p className="text-xs text-muted-foreground">Select one active category required by media service.</p>
          </div>
          {selectedCategory ? (
            <span className="shrink-0 rounded-sm border border-secondary/30 bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
              {selectedCategory.slug}
            </span>
          ) : null}
        </div>

        <div className="relative mb-4">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground">
            search
          </span>
          <input
            type="search"
            aria-label="Search categories"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search category..."
            className="h-10 w-full rounded-sm border border-border/40 bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/60"
          />
        </div>

        <div className="max-h-72 overflow-y-auto pr-1 [scrollbar-color:#484847_#19191c] [scrollbar-width:thin]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {categories.length === 0 ? (
              <div className="col-span-full rounded-sm border border-dashed border-border/30 bg-background/60 px-4 py-6 text-center text-xs text-muted-foreground">
                Loading categories...
              </div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map(category => {
                const isSelected = selectedCategoryId === category.id;

                return (
                  <label key={category.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="upload-category"
                      className="peer sr-only"
                      checked={isSelected}
                      onChange={() => onChange(category.id)}
                    />
                    <div
                      title={category.name}
                      className={`min-h-11 rounded-lg border px-3 py-2 text-xs font-bold leading-snug transition-all ${
                        isSelected
                          ? "border-primary/70 bg-primary/10 text-primary"
                          : "border-border/30 bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="block truncate">{category.name}</span>
                      <span className="mt-0.5 block truncate text-[10px] font-medium text-muted-foreground/70">
                        {category.slug}
                      </span>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="col-span-full rounded-sm border border-dashed border-border/30 bg-background/60 px-4 py-6 text-center">
                <p className="text-xs font-medium text-muted-foreground">No matching category found.</p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">Try searching by category name or slug.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
