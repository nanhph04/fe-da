import type { ApiResponse } from "@/shared/api/types";
import type {
  CompletePartBody,
  CompletePartResponse,
  CompleteUploadResponse,
  GetPartUrlsResponse,
  RenewUploadSessionResponse,
  UploadRawVideoFileRequest,
  UploadResumableParams,
  UploadStatusResponse,
} from "@/features/watch/services/mediaService.types";

interface ResumableUploadApi {
  getUploadStatus: (videoId: string, uploadId: string) => Promise<ApiResponse<UploadStatusResponse>>;
  getPartUrls: (
    videoId: string,
    uploadId: string,
    partNumbers: number[]
  ) => Promise<ApiResponse<GetPartUrlsResponse>>;
  completePart: (
    videoId: string,
    uploadId: string,
    partNumber: number,
    data: CompletePartBody
  ) => Promise<ApiResponse<CompletePartResponse>>;
  completeUpload: (videoId: string, uploadId: string) => Promise<ApiResponse<CompleteUploadResponse>>;
  renewUploadSession: (videoId: string, uploadId: string) => Promise<ApiResponse<RenewUploadSessionResponse>>;
}

const DEFAULT_RENEW_BEFORE_EXPIRY_MS = 10 * 60 * 1000;
const DEFAULT_UPLOAD_CONCURRENCY = 4;

const createAbortError = () => new DOMException("Upload aborted", "AbortError");

const formatSizeInMb = (sizeBytes: number) => (sizeBytes / (1024 * 1024)).toFixed(2);

const assertFileMatchesUploadSession = (file: File, dbFileName?: string, dbFileSize?: number) => {
  if (!dbFileName || !dbFileSize) {
    return;
  }

  if (file.name === dbFileName && file.size === dbFileSize) {
    return;
  }

  throw new Error(
    `Tệp tin được chọn không khớp với video ban đầu của phiên upload này. Bản nháp này yêu cầu tệp "${dbFileName}" (${formatSizeInMb(dbFileSize)} MB), nhưng bạn đã chọn tệp "${file.name}" (${formatSizeInMb(file.size)} MB).`
  );
};

const getPendingPartNumbers = (totalParts: number, completedParts: number[]) => {
  const completedPartSet = new Set(completedParts);
  return Array.from({ length: totalParts }, (_, index) => index + 1).filter(
    partNumber => !completedPartSet.has(partNumber)
  );
};

const getCompletedBytes = (completedParts: number[], totalParts: number, partSizeBytes: number, fileSize: number) => {
  return completedParts.reduce((acc, partNum) => {
    const isLastPart = partNum === totalParts;
    const size = isLastPart ? fileSize - (totalParts - 1) * partSizeBytes : partSizeBytes;
    return acc + size;
  }, 0);
};

const normalizeConcurrency = (value?: number) => {
  if (!Number.isFinite(value) || !value || value < 1) {
    return DEFAULT_UPLOAD_CONCURRENCY;
  }

  return Math.floor(value);
};

const uploadChunk = ({
  uploadUrl,
  chunk,
  partNumber,
  signal,
  onProgress,
}: {
  uploadUrl: string;
  chunk: Blob;
  partNumber: number;
  signal?: AbortSignal;
  onProgress?: (loadedBytes: number) => void;
}) => {
  return new Promise<string>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const xhr = new XMLHttpRequest();
    let settled = false;

    const cleanup = () => {
      signal?.removeEventListener("abort", handleAbort);
    };

    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      callback();
    };

    const handleAbort = () => {
      xhr.abort();
      settle(() => reject(createAbortError()));
    };

    signal?.addEventListener("abort", handleAbort, { once: true });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");

    xhr.upload.onprogress = event => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress?.(event.loaded);
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        settle(() => reject(new Error(`Failed to upload part ${partNumber}: status ${xhr.status}`)));
        return;
      }

      const etagHeader = xhr.getResponseHeader("ETag");
      if (!etagHeader) {
        settle(() => reject(new Error(`No ETag header returned for part ${partNumber}`)));
        return;
      }

      settle(() => resolve(etagHeader.replace(/"/g, "")));
    };

    xhr.onerror = () => {
      settle(() => reject(new Error(`Failed to upload part ${partNumber} due to network error`)));
    };

    xhr.onabort = () => {
      settle(() => reject(createAbortError()));
    };

    xhr.send(chunk);
  });
};

export const uploadPresignedFile = ({ uploadUrl, file, onProgress }: UploadRawVideoFileRequest) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject(new Error(`File upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("File upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("File upload was cancelled."));
    xhr.send(file);
  });
};

export const createUploadResumableVideoFile = (uploadApi: ResumableUploadApi) => {
  return async ({
    videoId,
    uploadId,
    file,
    partSizeBytes,
    onProgress,
    signal,
    renewBeforeExpiryMs,
    concurrency,
  }: UploadResumableParams): Promise<void> => {
    const fileSize = file.size;
    const totalParts = Math.ceil(fileSize / partSizeBytes);
    let completedParts: number[] = [];
    let sessionExpiresAtMs: number | null = null;

    const renewIfNeeded = async () => {
      if (sessionExpiresAtMs === null) {
        return;
      }

      const thresholdMs = renewBeforeExpiryMs ?? DEFAULT_RENEW_BEFORE_EXPIRY_MS;
      if (sessionExpiresAtMs - Date.now() > thresholdMs) {
        return;
      }

      const renewRes = await uploadApi.renewUploadSession(videoId, uploadId);
      if (!renewRes.success || !renewRes.data) {
        throw new Error(renewRes.message || "Failed to renew upload session");
      }

      sessionExpiresAtMs = new Date(renewRes.data.expiresAt).getTime();
    };

    try {
      const statusRes = await uploadApi.getUploadStatus(videoId, uploadId);
      if (statusRes.success && statusRes.data) {
        assertFileMatchesUploadSession(file, statusRes.data.fileName, statusRes.data.fileSize);
        completedParts = statusRes.data.parts?.map(part => part.partNumber) ?? [];
        sessionExpiresAtMs = new Date(statusRes.data.expiresAt).getTime();
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("không khớp với video ban đầu")) {
        throw err;
      }

      console.warn("Failed to fetch upload status, starting from scratch:", err);
    }

    const partsToUpload = getPendingPartNumbers(totalParts, completedParts);
    let uploadedBytes = getCompletedBytes(completedParts, totalParts, partSizeBytes, fileSize);
    const activePartLoadedBytes = new Map<number, number>();

    const updateProgress = () => {
      if (onProgress) {
        const activeLoadedBytes = Array.from(activePartLoadedBytes.values()).reduce(
          (acc, loadedBytes) => acc + loadedBytes,
          0
        );
        const percentage = Math.round(((uploadedBytes + activeLoadedBytes) / fileSize) * 100);
        onProgress(Math.min(percentage, 100));
      }
    };

    updateProgress();

    if (partsToUpload.length === 0) {
      await renewIfNeeded();
      const completeRes = await uploadApi.completeUpload(videoId, uploadId);
      if (!completeRes.success) {
        throw new Error(completeRes.message || "Failed to complete upload session");
      }
      return;
    }

    const uploadOnePart = async (partNumber: number) => {
      if (signal?.aborted) {
        throw createAbortError();
      }

      await renewIfNeeded();
      const urlRes = await uploadApi.getPartUrls(videoId, uploadId, [partNumber]);
      if (!urlRes.success || !urlRes.data?.parts?.length) {
        throw new Error(urlRes.message || `Failed to get upload URL for part ${partNumber}`);
      }

      const partInfo = urlRes.data.parts.find(part => part.partNumber === partNumber);
      if (!partInfo) {
        throw new Error(`Upload URL for part ${partNumber} not found in response`);
      }

      const startByte = (partNumber - 1) * partSizeBytes;
      const endByte = Math.min(partNumber * partSizeBytes, fileSize);
      const chunk = file.slice(startByte, endByte);
      const chunkSize = chunk.size;

      let etag: string;
      try {
        etag = await uploadChunk({
          uploadUrl: partInfo.uploadUrl,
          chunk,
          partNumber,
          signal,
          onProgress: loadedBytes => {
            activePartLoadedBytes.set(partNumber, loadedBytes);
            updateProgress();
          },
        });
      } finally {
        activePartLoadedBytes.delete(partNumber);
      }

      uploadedBytes += chunkSize;
      updateProgress();

      await renewIfNeeded();
      const completedRes = await uploadApi.completePart(videoId, uploadId, partNumber, {
        etag,
        sizeBytes: chunkSize,
      });

      if (!completedRes.success) {
        throw new Error(completedRes.message || `Failed to register completion of part ${partNumber}`);
      }
    };

    let nextPartIndex = 0;
    let hasUploadFailed = false;
    const workerCount = Math.min(normalizeConcurrency(concurrency), partsToUpload.length);
    const workers = Array.from({ length: workerCount }, async () => {
      while (!hasUploadFailed && nextPartIndex < partsToUpload.length) {
        const partNumber = partsToUpload[nextPartIndex];
        nextPartIndex += 1;
        try {
          await uploadOnePart(partNumber);
        } catch (err) {
          hasUploadFailed = true;
          throw err;
        }
      }
    });

    await Promise.all(workers);

    if (signal?.aborted) {
      throw createAbortError();
    }

    await renewIfNeeded();
    const completeRes = await uploadApi.completeUpload(videoId, uploadId);
    if (!completeRes.success) {
      throw new Error(completeRes.message || "Failed to complete upload session");
    }
  };
};
