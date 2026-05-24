"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mediaService, type CategoryResponse, type TagResponse } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";

type TaxonomyTab = "categories" | "tags";
type TaxonomyStatus = "active" | "inactive" | "pending" | "deleted";

type CategoryFormState = {
  name: string;
  description: string;
  displayOrder: string;
  status: "active" | "inactive" | "deleted";
};

type TagFormState = {
  name: string;
  status: TaxonomyStatus;
};

type EditingState =
  | { type: "category"; id: string }
  | { type: "tag"; id: string }
  | null;

const initialCategoryFormState: CategoryFormState = {
  name: "",
  description: "",
  displayOrder: "0",
  status: "active",
};

const initialTagFormState: TagFormState = {
  name: "",
  status: "active",
};

const tabOptions: Array<{ value: TaxonomyTab; label: string; icon: string }> = [
  { value: "categories", label: "Categories", icon: "category" },
  { value: "tags", label: "Tags", icon: "sell" },
];

function normalizeStatus(status: string): TaxonomyStatus {
  if (status === "inactive" || status === "pending" || status === "deleted") {
    return status;
  }

  return "active";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusClass(status: string) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "active") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (normalizedStatus === "pending") {
    return "border-secondary/30 bg-secondary/10 text-secondary";
  }

  if (normalizedStatus === "deleted") {
    return "border-primary/30 bg-primary/10 text-primary";
  }

  return "border-border/30 bg-muted text-muted-foreground";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(status)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function TaxonomyStatCard({ label, value, icon, tone = "default" }: { label: string; value: number; icon: string; tone?: "default" | "primary" | "secondary" }) {
  const toneClass = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-muted-foreground";

  return (
    <article className="relative overflow-hidden rounded-lg border border-border/30 bg-card p-5">
      <span className={`material-symbols-outlined absolute -right-2 -top-2 text-6xl opacity-10 ${toneClass}`} aria-hidden="true">
        {icon}
      </span>
      <p className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
    </article>
  );
}

function SkeletonRows({ columns }: { columns: number }) {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="animate-pulse border-b border-border/20 last:border-0">
      <td className="px-5 py-4" colSpan={columns}>
        <div className="h-12 rounded-sm bg-muted/60" />
      </td>
    </tr>
  ));
}

export function CategoryManagementFeature() {
  const [activeTab, setActiveTab] = useState<TaxonomyTab>("categories");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFormState, setCategoryFormState] = useState<CategoryFormState>(initialCategoryFormState);
  const [tagFormState, setTagFormState] = useState<TagFormState>(initialTagFormState);
  const [editingState, setEditingState] = useState<EditingState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTaxonomy = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [categoryRes, tagRes] = await Promise.all([
        mediaService.getAllCategoriesAdmin(),
        mediaService.getAllTagsAdmin(),
      ]);

      if (categoryRes.success && categoryRes.data) {
        setCategories(categoryRes.data);
      } else {
        setCategories([]);
      }

      if (tagRes.success && tagRes.data) {
        setTags(tagRes.data);
      } else {
        setTags([]);
      }

      const errors = [
        categoryRes.success ? null : categoryRes.mess || "Unable to load categories.",
        tagRes.success ? null : tagRes.mess || "Unable to load tags.",
      ].filter(Boolean);

      if (errors.length > 0) {
        setError(errors.join(" "));
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load taxonomy."));
      setCategories([]);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTaxonomy();
  }, [loadTaxonomy]);

  const stats = useMemo(() => {
    return {
      categoryTotal: categories.length,
      categoryActive: categories.filter(category => category.status === "active").length,
      tagTotal: tags.length,
      tagPending: tags.filter(tag => tag.status === "pending").length,
    };
  }, [categories, tags]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter(category => [category.name, category.slug, category.description ?? "", category.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery));
  }, [categories, searchQuery]);

  const filteredTags = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return tags;
    }

    return tags.filter(tag => [tag.name, tag.slug, tag.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery));
  }, [searchQuery, tags]);

  const resetForms = () => {
    setEditingState(null);
    setCategoryFormState(initialCategoryFormState);
    setTagFormState(initialTagFormState);
  };

  const handleTabChange = (tab: TaxonomyTab) => {
    setActiveTab(tab);
    setSearchQuery("");
    resetForms();
    setError(null);
    setNotice(null);
  };

  const handleCategoryEdit = (category: CategoryResponse) => {
    setActiveTab("categories");
    setEditingState({ type: "category", id: category.id });
    setCategoryFormState({
      name: category.name,
      description: category.description ?? "",
      displayOrder: String(category.displayOrder ?? 0),
      status: normalizeStatus(category.status) === "deleted" ? "deleted" : normalizeStatus(category.status) === "inactive" ? "inactive" : "active",
    });
  };

  const handleTagEdit = (tag: TagResponse) => {
    setActiveTab("tags");
    setEditingState({ type: "tag", id: tag.id });
    setTagFormState({
      name: tag.name,
      status: normalizeStatus(tag.status),
    });
  };

  const handleCategorySubmit = async () => {
    const name = categoryFormState.name.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      name,
      description: categoryFormState.description.trim() || undefined,
      displayOrder: Number(categoryFormState.displayOrder) || 0,
    };

    try {
      const res = editingState?.type === "category"
        ? await mediaService.updateCategoryAdmin(editingState.id, {
            ...payload,
            status: categoryFormState.status,
          })
        : await mediaService.createCategoryAdmin(payload);

      if (res.success && res.data) {
        setNotice(editingState?.type === "category" ? "Category updated." : "Category created.");
        resetForms();
        await loadTaxonomy();
        return;
      }

      setError(res.mess || "Unable to save category.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save category."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagSubmit = async () => {
    const name = tagFormState.name.trim();
    if (!name) {
      setError("Tag name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const res = editingState?.type === "tag"
        ? await mediaService.updateTagAdmin(editingState.id, {
            name,
            status: tagFormState.status,
          })
        : await mediaService.createTagAdmin({ name });

      if (res.success && res.data) {
        setNotice(editingState?.type === "tag" ? "Tag updated." : "Tag created.");
        resetForms();
        await loadTaxonomy();
        return;
      }

      setError(res.mess || "Unable to save tag.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save tag."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeTab === "categories") {
      await handleCategorySubmit();
      return;
    }

    await handleTagSubmit();
  };

  const handleCategoryStatusToggle = async (category: CategoryResponse) => {
    const nextStatus = normalizeStatus(category.status) === "active" ? "inactive" : "active";

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const res = await mediaService.updateCategoryAdmin(category.id, { status: nextStatus });
      if (res.success) {
        setNotice(`Category ${category.name} ${nextStatus === "active" ? "activated" : "set to inactive"}.`);
        if (editingState?.type === "category" && editingState.id === category.id) {
          setCategoryFormState(current => ({ ...current, status: nextStatus }));
        }
        await loadTaxonomy();
        return;
      }

      setError(res.mess || "Unable to update category status.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update category status."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagStatusToggle = async (tag: TagResponse) => {
    const nextStatus = normalizeStatus(tag.status) === "active" ? "inactive" : "active";

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const res = await mediaService.updateTagAdmin(tag.id, { status: nextStatus });
      if (res.success) {
        setNotice(`Tag ${tag.name} ${nextStatus === "active" ? "activated" : "set to inactive"}.`);
        if (editingState?.type === "tag" && editingState.id === tag.id) {
          setTagFormState(current => ({ ...current, status: nextStatus }));
        }
        await loadTaxonomy();
        return;
      }

      setError(res.mess || "Unable to update tag status.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update tag status."));
    } finally {
      setIsSaving(false);
    }
  };

  const activeTotal = activeTab === "categories" ? filteredCategories.length : filteredTags.length;
  const editorTitle = activeTab === "categories"
    ? editingState?.type === "category" ? "Edit Category" : "Create Category"
    : editingState?.type === "tag" ? "Edit Tag" : "Create Tag";

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Media Taxonomy</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Taxonomy Management</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            Organize discovery categories and searchable tags from the media service in one admin registry.
          </p>
        </div>
        <Button type="button" variant="outline" className="h-11 border-border/40 bg-transparent px-5 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={loadTaxonomy} disabled={isLoading || isSaving}>
          <span className="material-symbols-outlined mr-2 text-[18px]" aria-hidden="true">sync</span>
          Refresh
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TaxonomyStatCard label="Categories" value={stats.categoryTotal} icon="category" tone="primary" />
        <TaxonomyStatCard label="Active Categories" value={stats.categoryActive} icon="verified" />
        <TaxonomyStatCard label="Tags" value={stats.tagTotal} icon="sell" tone="secondary" />
        <TaxonomyStatCard label="Pending Tags" value={stats.tagPending} icon="pending_actions" tone="secondary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-border/30 bg-card p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex rounded-md border border-border/30 bg-background p-1">
                {tabOptions.map(tab => {
                  const isActive = activeTab === tab.value;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => handleTabChange(tab.value)}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-sm px-4 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{tab.icon}</span>
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground" aria-hidden="true">search</span>
                <Input
                  className="h-11 w-full rounded-md border-border/30 bg-background pl-11 pr-4 text-foreground focus-visible:ring-primary"
                  placeholder={activeTab === "categories" ? "Search categories..." : "Search tags..."}
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
          </div>

          {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
          {notice ? <div className="rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">{notice}</div> : null}

          <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
            <div className="border-b border-border/30 bg-background px-5 py-4">
              <p className="font-headline text-sm font-bold text-foreground">
                {activeTab === "categories" ? "Category Registry" : "Tag Registry"}
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                {isLoading ? "Loading taxonomy records..." : `${activeTotal} records match the current view.`}
              </p>
            </div>

            <div className="overflow-x-auto">
              {activeTab === "categories" ? (
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Slug</th>
                      <th className="px-5 py-4">Description</th>
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Parent</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {isLoading ? (
                      <SkeletonRows columns={7} />
                    ) : filteredCategories.length === 0 ? (
                      <tr>
                        <td className="px-5 py-12 text-center font-body text-sm text-muted-foreground" colSpan={7}>
                          No categories found. Create a category from the editor panel.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map(category => {
                        const isCategoryActive = normalizeStatus(category.status) === "active";

                        return (
                          <tr key={category.id} className="group transition-colors hover:bg-muted/35">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 bg-muted text-primary">
                                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">category</span>
                                </div>
                                <div>
                                  <p className="font-headline text-sm font-bold text-foreground">{category.name}</p>
                                  <p className="font-mono text-[10px] text-muted-foreground">{category.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">/{category.slug}</td>
                            <td className="max-w-[260px] px-5 py-4 font-body text-sm text-muted-foreground">
                              <span className="line-clamp-2">{category.description || "No description."}</span>
                            </td>
                            <td className="px-5 py-4 font-headline text-sm font-bold text-foreground">{category.displayOrder}</td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{category.parentId || "None"}</td>
                            <td className="px-5 py-4"><StatusBadge status={category.status} /></td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button type="button" className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary" onClick={() => handleCategoryEdit(category)} aria-label={`Edit ${category.name}`}>
                                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
                                </button>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isCategoryActive}
                                  onClick={() => handleCategoryStatusToggle(category)}
                                  disabled={isSaving}
                                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${
                                    isCategoryActive ? "border-emerald-500/40 bg-emerald-500/90" : "border-border/50 bg-input"
                                  }`}
                                  aria-label={`${isCategoryActive ? "Deactivate" : "Activate"} ${category.name}`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-sm transition-transform duration-200 ${
                                      isCategoryActive ? "translate-x-6" : "translate-x-1"
                                    }`}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <th className="px-5 py-4">Tag</th>
                      <th className="px-5 py-4">Slug</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Created</th>
                      <th className="px-5 py-4">Updated</th>
                      <th className="px-5 py-4 text-right">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {isLoading ? (
                      <SkeletonRows columns={6} />
                    ) : filteredTags.length === 0 ? (
                      <tr>
                        <td className="px-5 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                          No tags found. Create a tag from the editor panel.
                        </td>
                      </tr>
                    ) : (
                      filteredTags.map(tag => {
                        const isTagActive = normalizeStatus(tag.status) === "active";

                        return (
                          <tr key={tag.id} className="group transition-colors hover:bg-muted/35">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/30 bg-muted text-secondary">
                                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">sell</span>
                                </div>
                                <div>
                                  <p className="font-headline text-sm font-bold text-foreground">{tag.name}</p>
                                  <p className="font-mono text-[10px] text-muted-foreground">{tag.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">#{tag.slug}</td>
                            <td className="px-5 py-4"><StatusBadge status={tag.status} /></td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{formatDate(tag.createdAt)}</td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{formatDate(tag.updatedAt)}</td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button type="button" className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary" onClick={() => handleTagEdit(tag)} aria-label={`Edit ${tag.name}`}>
                                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
                                </button>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isTagActive}
                                  onClick={() => handleTagStatusToggle(tag)}
                                  disabled={isSaving}
                                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${
                                    isTagActive ? "border-emerald-500/40 bg-emerald-500/90" : "border-border/50 bg-input"
                                  }`}
                                  aria-label={`${isTagActive ? "Deactivate" : "Activate"} ${tag.name}`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-sm transition-transform duration-200 ${
                                      isTagActive ? "translate-x-6" : "translate-x-1"
                                    }`}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-border/30 bg-card p-5 xl:sticky xl:top-24 xl:self-start">
          <div className="mb-5 border-b border-border/30 pb-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Editor</p>
            <h2 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-foreground">{editorTitle}</h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {activeTab === "categories" ? "Shape discovery shelves with ordered categories." : "Maintain searchable tags used by uploads and discovery."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</span>
              <Input
                value={activeTab === "categories" ? categoryFormState.name : tagFormState.name}
                onChange={event => {
                  if (activeTab === "categories") {
                    setCategoryFormState(current => ({ ...current, name: event.target.value }));
                    return;
                  }

                  setTagFormState(current => ({ ...current, name: event.target.value }));
                }}
                placeholder={activeTab === "categories" ? "Category name" : "Tag name"}
                className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
              />
            </label>

            {activeTab === "categories" ? (
              <>
                <label className="block space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</span>
                  <Input
                    value={categoryFormState.description}
                    onChange={event => setCategoryFormState(current => ({ ...current, description: event.target.value }))}
                    placeholder="Discovery description"
                    className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Order</span>
                  <Input
                    type="number"
                    min={0}
                    value={categoryFormState.displayOrder}
                    onChange={event => setCategoryFormState(current => ({ ...current, displayOrder: event.target.value }))}
                    placeholder="0"
                    className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
                  />
                </label>
              </>
            ) : null}

            {(activeTab === "categories" && editingState?.type === "category") || (activeTab === "tags" && editingState?.type === "tag") ? (
              <label className="block space-y-2">
                <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                <select
                  value={activeTab === "categories" ? categoryFormState.status : tagFormState.status}
                  onChange={event => {
                    const status = event.target.value as TaxonomyStatus;
                    if (activeTab === "categories") {
                      setCategoryFormState(current => ({ ...current, status: status === "deleted" || status === "inactive" ? status : "active" }));
                      return;
                    }

                    setTagFormState(current => ({ ...current, status }));
                  }}
                  className="h-10 w-full rounded-md border border-border/40 bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/60"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  {activeTab === "tags" ? <option value="pending">pending</option> : null}
                  <option value="deleted">deleted</option>
                </select>
              </label>
            ) : null}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row xl:flex-col 2xl:flex-row">
              <Button type="submit" disabled={isSaving} className="rounded-sm bg-primary px-5 font-headline font-bold text-primary-foreground transition-opacity hover:opacity-90">
                {editingState ? "Update" : "Create"}
              </Button>
              {editingState ? (
                <Button type="button" variant="outline" onClick={resetForms} disabled={isSaving} className="border-border/40 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground">
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}
