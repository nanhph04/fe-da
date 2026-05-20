import type { ApiResponse } from "@/shared/api/types";
import type {
  CompletePartBody,
  CompletePartResponse,
  CompleteUploadResponse,
  GetPartUrlsResponse,
  UploadRawVideoFileRequest,
  UploadResumableParams,
  UploadStatusResponse,
} from "./mediaService.types";

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
}

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
    let lastLoadedBytes = 0;

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

      const delta = event.loaded - lastLoadedBytes;
      lastLoadedBytes = event.loaded;
      onProgress?.(delta);
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
  }: UploadResumableParams): Promise<void> => {
    const fileSize = file.size;
    const totalParts = Math.ceil(fileSize / partSizeBytes);
    let completedParts: number[] = [];

    try {
      const statusRes = await uploadApi.getUploadStatus(videoId, uploadId);
      if (statusRes.success && statusRes.data) {
        assertFileMatchesUploadSession(file, statusRes.data.fileName, statusRes.data.fileSize);
        completedParts = statusRes.data.parts?.map(part => part.partNumber) ?? [];
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("không khớp với video ban đầu")) {
        throw err;
      }

      console.warn("Failed to fetch upload status, starting from scratch:", err);
    }

    const partsToUpload = getPendingPartNumbers(totalParts, completedParts);
    let uploadedBytes = getCompletedBytes(completedParts, totalParts, partSizeBytes, fileSize);

    const updateProgress = () => {
      if (onProgress) {
        const percentage = Math.round((uploadedBytes / fileSize) * 100);
        onProgress(Math.min(percentage, 100));
      }
    };

    updateProgress();

    if (partsToUpload.length === 0) {
      const completeRes = await uploadApi.completeUpload(videoId, uploadId);
      if (!completeRes.success) {
        throw new Error(completeRes.mess || "Failed to complete upload session");
      }
      return;
    }

    for (const partNumber of partsToUpload) {
      if (signal?.aborted) {
        throw createAbortError();
      }

      const startByte = (partNumber - 1) * partSizeBytes;
      const endByte = Math.min(partNumber * partSizeBytes, fileSize);
      const chunk = file.slice(startByte, endByte);
      const chunkSize = chunk.size;

      const urlRes = await uploadApi.getPartUrls(videoId, uploadId, [partNumber]);
      if (!urlRes.success || !urlRes.data?.parts?.length) {
        throw new Error(urlRes.mess || `Failed to get upload URL for part ${partNumber}`);
      }

      const partInfo = urlRes.data.parts.find(part => part.partNumber === partNumber);
      if (!partInfo) {
        throw new Error(`Upload URL for part ${partNumber} not found in response`);
      }

      const etag = await uploadChunk({
        uploadUrl: partInfo.uploadUrl,
        chunk,
        partNumber,
        signal,
        onProgress: delta => {
          uploadedBytes += delta;
          updateProgress();
        },
      });

      const completedRes = await uploadApi.completePart(videoId, uploadId, partNumber, {
        etag,
        sizeBytes: chunkSize,
      });

      if (!completedRes.success) {
        throw new Error(completedRes.mess || `Failed to register completion of part ${partNumber}`);
      }
    }

    if (signal?.aborted) {
      throw createAbortError();
    }

    const completeRes = await uploadApi.completeUpload(videoId, uploadId);
    if (!completeRes.success) {
      throw new Error(completeRes.mess || "Failed to complete upload session");
    }
  };
};
