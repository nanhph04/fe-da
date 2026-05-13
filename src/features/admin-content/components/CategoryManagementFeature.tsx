"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mediaService, type CategoryResponse } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";

type CategoryFormState = {
  name: string;
  description: string;
  displayOrder: string;
  status: "active" | "inactive" | "deleted";
};

const initialFormState: CategoryFormState = {
  name: "",
  description: "",
  displayOrder: "0",
  status: "active",
};

export function CategoryManagementFeature() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formState, setFormState] = useState<CategoryFormState>(initialFormState);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadCategories = useCallback(async (query = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await mediaService.getAllCategoriesAdmin({ q: query.trim() || undefined });
      if (res.success && res.data) {
        setCategories(res.data);
        return;
      }

      setError(res.mess || "Unable to load categories.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load categories."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter(category => {
      return [category.name, category.slug, category.description ?? "", category.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [categories, searchQuery]);

  const resetForm = () => {
    setEditingCategoryId(null);
    setFormState(initialFormState);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formState.name.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      name,
      description: formState.description.trim() || undefined,
      displayOrder: Number(formState.displayOrder) || 0,
    };

    try {
      const res = editingCategoryId
        ? await mediaService.updateCategoryAdmin(editingCategoryId, {
            ...payload,
            status: formState.status,
          })
        : await mediaService.createCategoryAdmin(payload);

      if (res.success && res.data) {
        setNotice(editingCategoryId ? "Category updated." : "Category created.");
        resetForm();
        await loadCategories();
        return;
      }

      setError(res.mess || "Unable to save category.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save category."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategoryId(category.id);
    setFormState({
      name: category.name,
      description: category.description ?? "",
      displayOrder: String(category.displayOrder ?? 0),
      status: category.status === "deleted" ? "deleted" : category.status === "inactive" ? "inactive" : "active",
    });
  };

  const handleDelete = async (category: CategoryResponse) => {
    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const res = await mediaService.deleteCategoryAdmin(category.id);
      if (res.success) {
        setNotice(`Category ${category.name} moved to inactive.`);
        await loadCategories();
        return;
      }

      setError(res.mess || "Unable to delete category.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete category."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Taxonomy</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Category Management</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Organize active, inactive, and deleted content genres from media service.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-border/30 bg-card p-5 lg:grid-cols-[1fr_1.5fr_120px_140px_auto]">
        <Input
          value={formState.name}
          onChange={event => setFormState(current => ({ ...current, name: event.target.value }))}
          placeholder="Category name"
          className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
        />
        <Input
          value={formState.description}
          onChange={event => setFormState(current => ({ ...current, description: event.target.value }))}
          placeholder="Description"
          className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
        />
        <Input
          type="number"
          min={0}
          value={formState.displayOrder}
          onChange={event => setFormState(current => ({ ...current, displayOrder: event.target.value }))}
          placeholder="Order"
          className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
        />
        <select
          value={formState.status}
          onChange={event => setFormState(current => ({ ...current, status: event.target.value as CategoryFormState["status"] }))}
          disabled={!editingCategoryId}
          className="h-10 rounded-md border border-border/40 bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/60 disabled:opacity-60"
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="deleted">deleted</option>
        </select>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving} className="rounded-sm bg-primary px-5 font-headline font-bold text-primary-foreground transition-opacity hover:opacity-90">
            {editingCategoryId ? "Update" : "Create"}
          </Button>
          {editingCategoryId ? (
            <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      <div className="flex items-center gap-4 rounded-lg border border-border/30 bg-card p-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
          <Input
            className="w-full rounded-md border-border/30 bg-background py-6 pl-12 pr-5 text-foreground focus-visible:ring-primary"
            placeholder="Search categories by name, slug, description, or status..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />
        </div>
        <Button type="button" variant="outline" className="h-[50px] border-border/40 bg-transparent px-6 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => loadCategories()}>
          <span className="material-symbols-outlined mr-2">sync</span>
          Refresh
        </Button>
      </div>

      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      {notice ? <div className="rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">{notice}</div> : null}

      {isLoading ? (
        <div className="rounded-lg border border-border/30 bg-card py-12 text-center text-sm text-muted-foreground">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map(category => (
            <article key={category.id} className="group relative overflow-hidden rounded-lg border border-border/30 bg-card p-6 transition-colors hover:border-border">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline text-xl font-bold text-foreground">{category.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">/{category.slug}</p>
                </div>
                <span className={`rounded-sm bg-muted px-3 py-1 font-label text-xs font-bold uppercase tracking-widest ${category.status === "active" ? "text-secondary" : "text-muted-foreground"}`}>
                  {category.status}
                </span>
              </div>

              <p className="mb-6 line-clamp-2 h-10 font-body text-sm text-muted-foreground">{category.description || "No description."}</p>

              <div className="grid grid-cols-2 gap-3 border-t border-border/30 py-4 text-xs text-muted-foreground">
                <span>Order: {category.displayOrder}</span>
                <span>Parent: {category.parentId || "None"}</span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4">
                <button type="button" className="text-muted-foreground transition-colors hover:text-secondary" onClick={() => handleEdit(category)} aria-label={`Edit ${category.name}`}>
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button type="button" className="text-muted-foreground transition-colors hover:text-primary" onClick={() => handleDelete(category)} disabled={isSaving} aria-label={`Delete ${category.name}`}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </article>
          ))}

          {filteredCategories.length === 0 ? (
            <div className="col-span-full rounded-lg border border-border/30 bg-card py-12 text-center">
              <span className="material-symbols-outlined mb-4 text-4xl text-muted-foreground">category</span>
              <h2 className="font-headline text-xl font-bold text-foreground">No categories found</h2>
              <p className="mt-2 font-body text-sm text-muted-foreground">Try adjusting your search terms.</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
