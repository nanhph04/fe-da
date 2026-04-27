import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  fetchPublicApi,
  type PublicApiError,
  type PublicApiResponse,
} from "@/shared/server/publicApi";

export interface PublicDiscoveryVideo {
  id: string;
  channelId: string;
  title: string;
  description: string;
  categories: string[];
  status: string;
  price: number;
  requiredTierLevel: number | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  resolutions: string[];
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  channel?: { name: string };
  metrics?: { viewsCount: number };
}

export interface PublicVideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  status: string;
  visibility: string;
  publishedAt: string | null;
  updatedAt: string;
}

export async function getLatestVideosCached(limit = 10) {
  "use cache";

  cacheLife("minutes");
  cacheTag("media:latest");

  const query = limit ? `?limit=${limit}` : "";
  try {
    return await fetchPublicApi<PublicDiscoveryVideo[]>(
      `/api/media/videos/discovery/latest${query}`
    );
  } catch (error) {
    const apiError = error as PublicApiError;

    return {
      success: false,
      code: apiError.code ?? 503,
      data: [],
      mess:
        apiError.mess ||
        apiError.message ||
        "Unable to load latest videos from the media service.",
      errors: apiError.errors,
    } satisfies PublicApiResponse<PublicDiscoveryVideo[]>;
  }
}

export async function getVideoMetadataCached(videoId: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("media:video", `media:video:${videoId}`);

  return fetchPublicApi<PublicVideoMetadata>(
    `/api/media/videos/${videoId}/metadata`
  );
}

export type { PublicApiError };
