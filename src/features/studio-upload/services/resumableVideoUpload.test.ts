import { createUploadResumableVideoFile } from './resumableVideoUpload';

const createApiResponse = <T>(data: T) => ({
  success: true,
  statusCode: 200,
  data,
});

const pendingRequests: MockXMLHttpRequest[] = [];

class MockXMLHttpRequest {
  status = 200;
  upload: { onprogress?: (event: ProgressEvent) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;

  open = jest.fn();
  setRequestHeader = jest.fn();
  getResponseHeader = jest.fn(() => '"etag-1"');
  abort = jest.fn(() => {
    this.onabort?.();
  });
  send = jest.fn(() => {
    pendingRequests.push(this);
  });

  progress(loaded: number, total: number): void {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded,
      total,
    } as ProgressEvent);
  }

  succeed(etag = `etag-${pendingRequests.indexOf(this) + 1}`): void {
    this.getResponseHeader = jest.fn(() => `"${etag}"`);
    this.onload?.();
  }

  fail(): void {
    this.onerror?.();
  }
}

const createUploadApi = ({
  totalParts,
  completedParts = [],
  expiresAt = '2026-01-02T10:00:00.000Z',
}: {
  totalParts: number;
  completedParts?: number[];
  expiresAt?: string;
}) => ({
  getUploadStatus: jest.fn().mockResolvedValue(
    createApiResponse({
      videoId: 'video-1',
      uploadId: 'upload-1',
      rawFileKey: 'uploads/raw/video-1/video.mp4',
      partSizeBytes: 1024,
      fileName: 'video.mp4',
      fileSize: totalParts * 1024,
      fileLastModified: '2026-01-01T09:00:00.000Z',
      status: 'active',
      expiresAt,
      parts: completedParts.map(partNumber => ({
        partNumber,
        etag: `etag-${partNumber}`,
        sizeBytes: 1024,
        uploadedAt: '2026-01-01T09:30:00.000Z',
      })),
    }),
  ),
  getPartUrls: jest.fn().mockImplementation((_videoId: string, _uploadId: string, partNumbers: number[]) =>
    Promise.resolve(
      createApiResponse({
        parts: partNumbers.map(partNumber => ({
          partNumber,
          uploadUrl: `https://storage.example.com/part-${partNumber}`,
          expiresAt: '2026-01-01T10:15:00.000Z',
        })),
      }),
    ),
  ),
  completePart: jest.fn().mockImplementation((_videoId: string, _uploadId: string, partNumber: number) =>
    Promise.resolve(
      createApiResponse({
        videoId: 'video-1',
        uploadId: 'upload-1',
        partNumber,
        completed: true,
      }),
    ),
  ),
  completeUpload: jest.fn().mockResolvedValue(
    createApiResponse({
      videoId: 'video-1',
      uploadId: 'upload-1',
      rawFileKey: 'uploads/raw/video-1/video.mp4',
      completed: true,
    }),
  ),
  renewUploadSession: jest.fn().mockResolvedValue(
    createApiResponse({
      videoId: 'video-1',
      uploadId: 'upload-1',
      expiresAt: '2026-01-02T10:00:00.000Z',
    }),
  ),
});

const flushPromises = async () => {
  for (let index = 0; index < 10; index += 1) {
    await Promise.resolve();
  }
};

describe('createUploadResumableVideoFile', () => {
  const originalXMLHttpRequest = global.XMLHttpRequest;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:00.000Z'));
    pendingRequests.length = 0;
    global.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXMLHttpRequest;
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renews the upload session before requesting the next part URL when expiry is near', async () => {
    const uploadApi = createUploadApi({ totalParts: 1, expiresAt: '2026-01-01T10:04:00.000Z' });
    const upload = createUploadResumableVideoFile(uploadApi);

    const uploadPromise = upload({
      videoId: 'video-1',
      uploadId: 'upload-1',
      file: new File([new Uint8Array(1024)], 'video.mp4'),
      partSizeBytes: 1024,
      renewBeforeExpiryMs: 10 * 60 * 1000,
    });

    await flushPromises();
    pendingRequests[0].progress(1024, 1024);
    pendingRequests[0].succeed('etag-1');
    await uploadPromise;

    expect(uploadApi.renewUploadSession).toHaveBeenCalledWith(
      'video-1',
      'upload-1',
    );
    expect(
      uploadApi.renewUploadSession.mock.invocationCallOrder[0],
    ).toBeLessThan(uploadApi.getPartUrls.mock.invocationCallOrder[0]);
  });

  it('uploads pending parts concurrently up to the configured concurrency', async () => {
    const uploadApi = createUploadApi({ totalParts: 5 });
    const upload = createUploadResumableVideoFile(uploadApi);

    const uploadPromise = upload({
      videoId: 'video-1',
      uploadId: 'upload-1',
      file: new File([
        new Uint8Array(1024),
        new Uint8Array(1024),
        new Uint8Array(1024),
        new Uint8Array(1024),
        new Uint8Array(1024),
      ], 'video.mp4'),
      partSizeBytes: 1024,
      concurrency: 3,
    });

    await flushPromises();

    expect(pendingRequests).toHaveLength(3);
    expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(1, 'video-1', 'upload-1', [1]);
    expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(2, 'video-1', 'upload-1', [2]);
    expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(3, 'video-1', 'upload-1', [3]);

    pendingRequests[0].progress(1024, 1024);
    pendingRequests[0].succeed('etag-1');
    await flushPromises();

    expect(pendingRequests).toHaveLength(4);
    expect(uploadApi.getPartUrls).toHaveBeenNthCalledWith(4, 'video-1', 'upload-1', [4]);

    for (let index = 1; index < pendingRequests.length; index += 1) {
      const request = pendingRequests[index];
      request.progress(1024, 1024);
      request.succeed();
      await flushPromises();
    }

    await uploadPromise;
    expect(uploadApi.completeUpload).toHaveBeenCalledWith('video-1', 'upload-1');
  });

  it('does not schedule new parts after a concurrent part upload fails', async () => {
    const uploadApi = createUploadApi({ totalParts: 5 });
    const upload = createUploadResumableVideoFile(uploadApi);

    const uploadResultPromise = upload({
      videoId: 'video-1',
      uploadId: 'upload-1',
      file: new File([
        new Uint8Array(1024),
        new Uint8Array(1024),
        new Uint8Array(1024),
        new Uint8Array(1024),
        new Uint8Array(1024),
      ], 'video.mp4'),
      partSizeBytes: 1024,
      concurrency: 3,
    }).catch((error: Error) => error);

    await flushPromises();
    expect(pendingRequests).toHaveLength(3);

    pendingRequests[0].fail();
    const error = await uploadResultPromise;

    expect(error).toBeInstanceOf(Error);
    if (!(error instanceof Error)) {
      throw new Error('Expected upload to reject with an Error');
    }
    expect(error.message).toContain('Failed to upload part 1');

    pendingRequests[1].progress(1024, 1024);
    pendingRequests[1].succeed('etag-2');
    pendingRequests[2].progress(1024, 1024);
    pendingRequests[2].succeed('etag-3');
    await flushPromises();

    expect(pendingRequests).toHaveLength(3);
    expect(uploadApi.completeUpload).not.toHaveBeenCalled();
  });

  it('tracks progress from parallel parts without double-counting loaded bytes', async () => {
    const onProgress = jest.fn();
    const uploadApi = createUploadApi({ totalParts: 2 });
    const upload = createUploadResumableVideoFile(uploadApi);

    const uploadPromise = upload({
      videoId: 'video-1',
      uploadId: 'upload-1',
      file: new File([new Uint8Array(1024), new Uint8Array(1024)], 'video.mp4'),
      partSizeBytes: 1024,
      concurrency: 2,
      onProgress,
    });

    await flushPromises();

    pendingRequests[0].progress(512, 1024);
    pendingRequests[1].progress(512, 1024);
    pendingRequests[0].progress(1024, 1024);

    expect(onProgress).toHaveBeenLastCalledWith(75);

    pendingRequests[0].succeed('etag-1');
    pendingRequests[1].progress(1024, 1024);
    pendingRequests[1].succeed('etag-2');

    await uploadPromise;
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });
});
