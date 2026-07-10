import { api } from "@/shared/api/client";
import { createUploadResumableVideoFile, uploadPresignedFile } from "./resumableVideoUpload";
import type {
  CompletePartBody,
  CompletePartResponse,
  CompleteUploadResponse,
  GetPartUrlsResponse,
  InitUploadBody,
  InitUploadResponse,
  MetadataSuggestionsBody,
  MetadataSuggestionsResponse,
  RenewUploadSessionResponse,
  SubmitUploadBody,
  SubmitUploadResponse,
  UpdateVideoMetadataBody,
  UploadStatusResponse,
  VideoMetadataResponse,
} from "@/features/watch/services/mediaService.types";

const getPartUrls = async (videoId: string, uploadId: string, partNumbers: number[]) => {
  return api.post<GetPartUrlsResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/part-urls`,
    { partNumbers },
    { requireAuth: true }
  );
};

const completePart = async (videoId: string, uploadId: string, partNumber: number, data: CompletePartBody) => {
  return api.post<CompletePartResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/parts/${partNumber}/completed`,
    data,
    { requireAuth: true }
  );
};

const getUploadStatus = async (videoId: string, uploadId: string) => {
  return api.get<UploadStatusResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/status`,
    { requireAuth: true }
  );
};

const completeUpload = async (videoId: string, uploadId: string) => {
  return api.post<CompleteUploadResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/complete`,
    undefined,
    { requireAuth: true }
  );
};

const renewUploadSession = async (videoId: string, uploadId: string) => {
  return api.post<RenewUploadSessionResponse>(
    `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/renew`,
    undefined,
    { requireAuth: true }
  );
};

const uploadResumableVideoFile = createUploadResumableVideoFile({
  getUploadStatus,
  getPartUrls,
  completePart,
  completeUpload,
  renewUploadSession,
});

export const studioUploadService = {
  initUpload: async (data: InitUploadBody) => {
    return api.post<InitUploadResponse>("/api/media/studio/videos/uploads", data, { requireAuth: true });
  },
  getPartUrls,
  completePart,
  getUploadStatus,
  completeUpload,
  renewUploadSession,
  submitUpload: async (videoId: string, uploadId: string, data: SubmitUploadBody) => {
    return api.post<SubmitUploadResponse>(
      `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}/submit`,
      data,
      { requireAuth: true }
    );
  },
  cancelUpload: async (videoId: string, uploadId: string) => {
    return api.delete<{ videoId: string; cancelled: boolean }>(
      `/api/media/studio/videos/${encodeURIComponent(videoId)}/uploads/${encodeURIComponent(uploadId)}`,
      { requireAuth: true }
    );
  },
  updateVideoMetadata: async (id: string, data: UpdateVideoMetadataBody) => {
    return api.patch<VideoMetadataResponse>(
      `/api/media/studio/videos/${encodeURIComponent(id)}/metadata`,
      data,
      { requireAuth: true }
    );
  },
  getMetadataSuggestions: async (data: MetadataSuggestionsBody) => {
    return api.post<MetadataSuggestionsResponse>(
      "/api/media/studio/videos/metadata-suggestions",
      data,
      { requireAuth: true }
    );
  },
  uploadPresignedFile,
  uploadResumableVideoFile,
};
