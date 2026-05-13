"use client";

import { useEffect, useState } from "react";
import {
  mediaService,
  type CategoryResponse,
  type TagResponse,
} from "@/features/watch/services/mediaService";

export function useUploadStep1State() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);

  useEffect(() => {
    let isActive = true;

    const fetchTaxonomy = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          mediaService.getCategories(),
          mediaService.getTags(),
        ]);

        if (!isActive) {
          return;
        }

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        if (tagsRes.success && tagsRes.data) {
          setTags(tagsRes.data);
        }
      } catch (err) {
        console.error("Failed to load media taxonomy", err);
      }
    };

    void fetchTaxonomy();

    return () => {
      isActive = false;
    };
  }, []);

  return { categories, tags };
}
