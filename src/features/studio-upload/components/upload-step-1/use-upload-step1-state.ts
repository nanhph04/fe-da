"use client";

import { useEffect, useState } from "react";
import { mediaService, type CategoryResponse } from "@/features/watch/services/mediaService";

export function useUploadStep1State() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
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

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isUploading && uploadProgress < 100) {
      interval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.floor(Math.random() * 10) + 5;
          if (next >= 100) {
            setUploadComplete(true);
            setIsUploading(false);
            return 100;
          }
          return next;
        });
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isUploading, uploadProgress]);

  const handleStartUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  return {
    categories,
    uploadProgress,
    isUploading,
    uploadComplete,
    handleStartUpload,
  };
}
