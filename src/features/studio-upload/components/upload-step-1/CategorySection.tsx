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
  return (
    <div className="space-y-6 rounded-xl border border-[#262528] bg-[#131315] p-6">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
          Categories
        </label>
        <p className="mb-3 text-xs text-zinc-400">Select at least one category</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.length > 0 ? (
            categories.map(cat => {
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
                    className={`rounded-lg border p-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "border-[#ff8e80] bg-[#ff8e80]/10 text-[#ff8e80]"
                        : "border-[#262528] bg-[#19191c] text-zinc-400 hover:bg-[#262528]"
                    }`}
                  >
                    {cat.name}
                  </div>
                </label>
              );
            })
          ) : (
            <div className="col-span-2 py-2 text-xs text-zinc-500">
              Loading categories...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
