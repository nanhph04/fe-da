"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mediaService, type CategoryResponse, type TagResponse } from "@/features/watch/services/mediaService";
import { getErrorMessage } from "@/shared/api/client";
import type { ApiPagination } from "@/shared/api/types";

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

const taxonomyPageLimit = 20;
const initialPagination: ApiPagination = { page: 1, limit: taxonomyPageLimit, total: 0, totalPages: 0 };

const tabOptions: Array<{ value: TaxonomyTab; labelKey: "tabs.categories" | "tabs.tags"; icon: string }> = [
  { value: "categories", labelKey: "tabs.categories", icon: "category" },
  { value: "tags", labelKey: "tabs.tags", icon: "sell" },
];

function getIntlLocale(locale: string) {
  return locale === "en" ? "en-US" : "vi-VN";
}

function normalizeStatus(status: string): TaxonomyStatus {
  if (status === "inactive" || status === "pending" || status === "deleted") {
    return status;
  }

  return "active";
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
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

function getStatusLabel(status: string, t: ReturnType<typeof useTranslations>) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "active" || normalizedStatus === "inactive" || normalizedStatus === "pending" || normalizedStatus === "deleted") {
    return t(`statuses.${normalizedStatus}`);
  }

  return status;
}

function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-widest ${getStatusClass(status)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {getStatusLabel(status, t)}
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

function PaginationControls({
  pagination,
  isLoading,
  onPageChange,
  t,
}: {
  pagination: ApiPagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const hasPrevious = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;

  return (
    <div className="flex flex-col gap-3 border-t border-border/30 bg-background px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        {t.rich("pagination.summary", {
          page: pagination.page,
          totalPages: pagination.totalPages || 1,
          total: pagination.total,
          strong: chunks => <strong className="text-foreground">{chunks}</strong>,
        })}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!hasPrevious || isLoading}
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          className="h-10 border-border/40 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {t("pagination.previous")}
        </Button>
        <Button
          type="button"
          disabled={!hasNext || isLoading}
          onClick={() => onPageChange(pagination.page + 1)}
          className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {t("pagination.next")}
        </Button>
      </div>
    </div>
  );
}

export function CategoryManagementFeature() {
  const t = useTranslations("Admin.content.taxonomy");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TaxonomyTab>("categories");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [categoryPagination, setCategoryPagination] = useState<ApiPagination>(initialPagination);
  const [tagPagination, setTagPagination] = useState<ApiPagination>(initialPagination);
  const [categoryPage, setCategoryPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFormState, setCategoryFormState] = useState<CategoryFormState>(initialCategoryFormState);
  const [tagFormState, setTagFormState] = useState<TagFormState>(initialTagFormState);
  const [editingState, setEditingState] = useState<EditingState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const loadTaxonomy = useCallback(async () => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    setIsLoading(true);
    setError(null);

    const normalizedQuery = searchQuery.trim() || undefined;

    try {
      const [categoryRes, tagRes] = await Promise.all([
        mediaService.getAllCategoriesAdmin({ page: categoryPage, limit: taxonomyPageLimit, q: normalizedQuery }),
        mediaService.getAllTagsAdmin({ page: tagPage, limit: taxonomyPageLimit, q: normalizedQuery }),
      ]);

      if (latestRequestId.current !== requestId) {
        return;
      }

      if (categoryRes.success && categoryRes.data) {
        setCategories(categoryRes.data.items);
        setCategoryPagination(categoryRes.data.pagination);
      } else {
        setCategories([]);
        setCategoryPagination(initialPagination);
      }

      if (tagRes.success && tagRes.data) {
        setTags(tagRes.data.items);
        setTagPagination(tagRes.data.pagination);
      } else {
        setTags([]);
        setTagPagination(initialPagination);
      }

      const errors = [
        categoryRes.success ? null : categoryRes.message || t("errors.loadCategoriesFailed"),
        tagRes.success ? null : tagRes.message || t("errors.loadTagsFailed"),
      ].filter(Boolean);

      if (errors.length > 0) {
        setError(errors.join(" "));
      }
    } catch (err) {
      if (latestRequestId.current !== requestId) {
        return;
      }

      setError(getErrorMessage(err, t("errors.loadFailed")));
      setCategories([]);
      setTags([]);
      setCategoryPagination(initialPagination);
      setTagPagination(initialPagination);
    } finally {
      if (latestRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [categoryPage, searchQuery, tagPage, t]);

  useEffect(() => {
    void loadTaxonomy();
  }, [loadTaxonomy]);

  const stats = useMemo(() => {
    return {
      categoryTotal: categoryPagination.total,
      categoryActive: categories.filter(category => category.status === "active").length,
      tagTotal: tagPagination.total,
      tagPending: tags.filter(tag => tag.status === "pending").length,
    };
  }, [categories, categoryPagination.total, tagPagination.total, tags]);

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
    setCategoryPage(1);
    setTagPage(1);
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
      setError(t("errors.categoryNameRequired"));
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
        setNotice(editingState?.type === "category" ? t("notices.categoryUpdated") : t("notices.categoryCreated"));
        resetForms();
        await loadTaxonomy();
        return;
      }

      setError(res.message || t("errors.saveCategoryFailed"));
    } catch (err) {
      setError(getErrorMessage(err, t("errors.saveCategoryFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagSubmit = async () => {
    const name = tagFormState.name.trim();
    if (!name) {
      setError(t("errors.tagNameRequired"));
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
        setNotice(editingState?.type === "tag" ? t("notices.tagUpdated") : t("notices.tagCreated"));
        resetForms();
        await loadTaxonomy();
        return;
      }

      setError(res.message || t("errors.saveTagFailed"));
    } catch (err) {
      setError(getErrorMessage(err, t("errors.saveTagFailed")));
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
        setNotice(t(nextStatus === "active" ? "notices.categoryActivated" : "notices.categoryInactivated", { name: category.name }));
        if (editingState?.type === "category" && editingState.id === category.id) {
          setCategoryFormState(current => ({ ...current, status: nextStatus }));
        }
        await loadTaxonomy();
        return;
      }

      setError(res.message || t("errors.updateCategoryStatusFailed"));
    } catch (err) {
      setError(getErrorMessage(err, t("errors.updateCategoryStatusFailed")));
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
        setNotice(t(nextStatus === "active" ? "notices.tagActivated" : "notices.tagInactivated", { name: tag.name }));
        if (editingState?.type === "tag" && editingState.id === tag.id) {
          setTagFormState(current => ({ ...current, status: nextStatus }));
        }
        await loadTaxonomy();
        return;
      }

      setError(res.message || t("errors.updateTagStatusFailed"));
    } catch (err) {
      setError(getErrorMessage(err, t("errors.updateTagStatusFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  const activePagination = activeTab === "categories" ? categoryPagination : tagPagination;
  const activeTotal = activePagination.total;
  const editorTitle = activeTab === "categories"
    ? editingState?.type === "category" ? t("editor.editCategory") : t("editor.createCategory")
    : editingState?.type === "tag" ? t("editor.editTag") : t("editor.createTag");

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">{t("header.eyebrow")}</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">{t("header.title")}</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
            {t("header.description")}
          </p>
        </div>
        <Button type="button" variant="outline" className="h-11 border-border/40 bg-transparent px-5 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={loadTaxonomy} disabled={isLoading || isSaving}>
          <span className="material-symbols-outlined mr-2 text-[18px]" aria-hidden="true">sync</span>
          {t("actions.refresh")}
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TaxonomyStatCard label={t("stats.categories")} value={stats.categoryTotal} icon="category" tone="primary" />
        <TaxonomyStatCard label={t("stats.activeOnPage")} value={stats.categoryActive} icon="verified" />
        <TaxonomyStatCard label={t("stats.tags")} value={stats.tagTotal} icon="sell" tone="secondary" />
        <TaxonomyStatCard label={t("stats.pendingOnPage")} value={stats.tagPending} icon="pending_actions" tone="secondary" />
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
                      {t(tab.labelKey)}
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground" aria-hidden="true">search</span>
                <Input
                  className="h-11 w-full rounded-md border-border/30 bg-background pl-11 pr-4 text-foreground focus-visible:ring-primary"
                  placeholder={activeTab === "categories" ? t("filters.searchCategories") : t("filters.searchTags")}
                  value={searchQuery}
                  onChange={event => {
                    setSearchQuery(event.target.value);
                    setCategoryPage(1);
                    setTagPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
          {notice ? <div className="rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">{notice}</div> : null}

          <div className="overflow-hidden rounded-lg border border-border/30 bg-card">
            <div className="border-b border-border/30 bg-background px-5 py-4">
              <p className="font-headline text-sm font-bold text-foreground">
                {activeTab === "categories" ? t("registry.categoryTitle") : t("registry.tagTitle")}
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                {isLoading ? t("registry.loading") : t("registry.summary", { count: activeTotal })}
              </p>
            </div>

            <div className="overflow-x-auto">
              {activeTab === "categories" ? (
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border/30 bg-background text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <th className="px-5 py-4">{t("table.category")}</th>
                      <th className="px-5 py-4">{t("table.slug")}</th>
                      <th className="px-5 py-4">{t("table.description")}</th>
                      <th className="px-5 py-4">{t("table.order")}</th>
                      <th className="px-5 py-4">{t("table.parent")}</th>
                      <th className="px-5 py-4">{t("table.status")}</th>
                      <th className="px-5 py-4 text-right">{t("table.active")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {isLoading ? (
                      <SkeletonRows columns={7} />
                    ) : filteredCategories.length === 0 ? (
                      <tr>
                        <td className="px-5 py-12 text-center font-body text-sm text-muted-foreground" colSpan={7}>
                          {t("empty.categories")}
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
                              <span className="line-clamp-2">{category.description || t("empty.noDescription")}</span>
                            </td>
                            <td className="px-5 py-4 font-headline text-sm font-bold text-foreground">{category.displayOrder}</td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{category.parentId || t("empty.none")}</td>
                            <td className="px-5 py-4"><StatusBadge status={category.status} t={t} /></td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button type="button" className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary" onClick={() => handleCategoryEdit(category)} aria-label={t("actions.editCategory", { name: category.name })}>
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
                                  aria-label={t(isCategoryActive ? "actions.deactivateCategory" : "actions.activateCategory", { name: category.name })}
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
                      <th className="px-5 py-4">{t("table.tag")}</th>
                      <th className="px-5 py-4">{t("table.slug")}</th>
                      <th className="px-5 py-4">{t("table.status")}</th>
                      <th className="px-5 py-4">{t("table.created")}</th>
                      <th className="px-5 py-4">{t("table.updated")}</th>
                      <th className="px-5 py-4 text-right">{t("table.active")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {isLoading ? (
                      <SkeletonRows columns={6} />
                    ) : filteredTags.length === 0 ? (
                      <tr>
                        <td className="px-5 py-12 text-center font-body text-sm text-muted-foreground" colSpan={6}>
                          {t("empty.tags")}
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
                            <td className="px-5 py-4"><StatusBadge status={tag.status} t={t} /></td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{formatDate(tag.createdAt, locale)}</td>
                            <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{formatDate(tag.updatedAt, locale)}</td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button type="button" className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary" onClick={() => handleTagEdit(tag)} aria-label={t("actions.editTag", { name: tag.name })}>
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
                                  aria-label={t(isTagActive ? "actions.deactivateTag" : "actions.activateTag", { name: tag.name })}
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
            <PaginationControls
              pagination={activePagination}
              isLoading={isLoading}
              t={t}
              onPageChange={page => {
                if (activeTab === "categories") {
                  setCategoryPage(page);
                  return;
                }

                setTagPage(page);
              }}
            />
          </div>
        </div>

        <aside className="rounded-lg border border-border/30 bg-card p-5 xl:sticky xl:top-24 xl:self-start">
          <div className="mb-5 border-b border-border/30 pb-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{t("editor.eyebrow")}</p>
            <h2 className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-foreground">{editorTitle}</h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {activeTab === "categories" ? t("editor.categoryDescription") : t("editor.tagDescription")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("form.name")}</span>
              <Input
                value={activeTab === "categories" ? categoryFormState.name : tagFormState.name}
                onChange={event => {
                  if (activeTab === "categories") {
                    setCategoryFormState(current => ({ ...current, name: event.target.value }));
                    return;
                  }

                  setTagFormState(current => ({ ...current, name: event.target.value }));
                }}
                placeholder={activeTab === "categories" ? t("form.categoryNamePlaceholder") : t("form.tagNamePlaceholder")}
                className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
              />
            </label>

            {activeTab === "categories" ? (
              <>
                <label className="block space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("form.description")}</span>
                  <Input
                    value={categoryFormState.description}
                    onChange={event => setCategoryFormState(current => ({ ...current, description: event.target.value }))}
                    placeholder={t("form.descriptionPlaceholder")}
                    className="border-border/40 bg-background text-foreground focus-visible:ring-primary"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("form.displayOrder")}</span>
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
                <span className="font-label text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("form.status")}</span>
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
                  <option value="active">{t("statuses.active")}</option>
                  <option value="inactive">{t("statuses.inactive")}</option>
                  {activeTab === "tags" ? <option value="pending">{t("statuses.pending")}</option> : null}
                  <option value="deleted">{t("statuses.deleted")}</option>
                </select>
              </label>
            ) : null}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row xl:flex-col 2xl:flex-row">
              <Button type="submit" disabled={isSaving} className="rounded-sm bg-primary px-5 font-headline font-bold text-primary-foreground transition-opacity hover:opacity-90">
                {editingState ? t("actions.update") : t("actions.create")}
              </Button>
              {editingState ? (
                <Button type="button" variant="outline" onClick={resetForms} disabled={isSaving} className="border-border/40 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground">
                  {t("actions.cancel")}
                </Button>
              ) : null}
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}
