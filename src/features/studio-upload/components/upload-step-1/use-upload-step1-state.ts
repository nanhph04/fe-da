"use client";

import { useEffect, useState } from "react";
import {
  mediaService,
  type CategoryResponse,
  type TagResponse,
} from "@/features/watch/services/mediaService";

const TAXONOMY_PAGE_LIMIT = 50;

async function loadAllCategories() {
  const firstPage = await mediaService.getCategories({ page: 1, limit: TAXONOMY_PAGE_LIMIT });

  if (!firstPage.success) {
    throw new Error(firstPage.mess || "Failed to load categories.");
  }

  const items = [...firstPage.data.items];
  const totalPages = firstPage.data.pagination.totalPages;

  if (totalPages <= 1) {
    return items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      mediaService.getCategories({ page: index + 2, limit: TAXONOMY_PAGE_LIMIT })
    )
  );

  remainingPages.forEach(response => {
    if (!response.success) {
      throw new Error(response.mess || "Failed to load categories.");
    }

    items.push(...response.data.items);
  });

  return items;
}

async function loadAllTags() {
  const firstPage = await mediaService.getTags({ page: 1, limit: TAXONOMY_PAGE_LIMIT });

  if (!firstPage.success) {
    throw new Error(firstPage.mess || "Failed to load tags.");
  }

  const items = [...firstPage.data.items];
  const totalPages = firstPage.data.pagination.totalPages;

  if (totalPages <= 1) {
    return items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      mediaService.getTags({ page: index + 2, limit: TAXONOMY_PAGE_LIMIT })
    )
  );

  remainingPages.forEach(response => {
    if (!response.success) {
      throw new Error(response.mess || "Failed to load tags.");
    }

    items.push(...response.data.items);
  });

  return items;
}

export function useUploadStep1State() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(true);
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchTaxonomy = async () => {
      try {
        setIsLoadingTaxonomy(true);
        setTaxonomyError(null);

        const [loadedCategories, loadedTags] = await Promise.all([
          loadAllCategories(),
          loadAllTags(),
        ]);

        if (!isActive) {
          return;
        }

        setCategories(loadedCategories);
        setTags(loadedTags);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setCategories([]);
        setTags([]);
        setTaxonomyError(err instanceof Error ? err.message : "Failed to load media taxonomy.");
      } finally {
        if (isActive) {
          setIsLoadingTaxonomy(false);
        }
      }
    };

    void fetchTaxonomy();

    return () => {
      isActive = false;
    };
  }, []);

  return { categories, tags, isLoadingTaxonomy, taxonomyError };
}
