import { createUploadResumableVideoFile } from './mediaService.upload';

const createApiResponse = <T>(data: T) => ({
  success: true,
  statusCode: 200,
  data,
});

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
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded: 1024,
      total: 1024,
    } as ProgressEvent);
    this.onload?.();
  });
}

describe('createUploadResumableVideoFile', () => {
  const originalXMLHttpRequest = global.XMLHttpRequest;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:00.000Z'));
    global.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXMLHttpRequest;
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renews the upload session before requesting the next part URL when expiry is near', async () => {
    const uploadApi = {
      getUploadStatus: jest.fn().mockResolvedValue(
        createApiResponse({
          videoId: 'video-1',
          uploadId: 'upload-1',
          rawFileKey: 'uploads/raw/video-1/video.mp4',
          partSizeBytes: 1024,
          fileName: 'video.mp4',
          fileSize: 1024,
          fileLastModified: '2026-01-01T09:00:00.000Z',
          status: 'active',
          expiresAt: '2026-01-01T10:04:00.000Z',
          parts: [],
        }),
      ),
      getPartUrls: jest.fn().mockResolvedValue(
        createApiResponse({
          parts: [
            {
              partNumber: 1,
              uploadUrl: 'https://storage.example.com/part-1',
              expiresAt: '2026-01-01T10:15:00.000Z',
            },
          ],
        }),
      ),
      completePart: jest.fn().mockResolvedValue(
        createApiResponse({
          videoId: 'video-1',
          uploadId: 'upload-1',
          partNumber: 1,
          completed: true,
        }),
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
    };
    const upload = createUploadResumableVideoFile(uploadApi);

    await upload({
      videoId: 'video-1',
      uploadId: 'upload-1',
      file: new File([new Uint8Array(1024)], 'video.mp4'),
      partSizeBytes: 1024,
      renewBeforeExpiryMs: 10 * 60 * 1000,
    });

    expect(uploadApi.renewUploadSession).toHaveBeenCalledWith(
      'video-1',
      'upload-1',
    );
    expect(
      uploadApi.renewUploadSession.mock.invocationCallOrder[0],
    ).toBeLessThan(uploadApi.getPartUrls.mock.invocationCallOrder[0]);
  });
});
