"use client";

import { useEffect, useState } from "react";
import { mediaService, type CategoryResponse } from "@/features/watch/services/mediaService";

export function useUploadStep1State() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await mediaService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    void fetchCategories();
  }, []);

  return { categories };
}
