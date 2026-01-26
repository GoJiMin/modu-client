import {renderHook, act} from '@testing-library/react';
import useFileUpload from '../useFileUpload';
import {createMockFile, MOCK_IMAGE_URL, MAX_FILE_SIZE} from './stub';
import {ClientError} from '@/shared/lib/utils/client-error';
import {RequestError} from '@/shared/apis/request-error';

describe('src/features/review/editor/extension/image-upload/lib/useFileUpload.ts', () => {
  const mockUpload = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('정상 업로드', () => {
    it('파일 업로드 성공 시 URL을 반환하고 상태를 성공 상태로 변경한다.', async () => {
      mockUpload.mockResolvedValue(MOCK_IMAGE_URL);

      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const file = createMockFile(1024);
      let uploadResult: string | null = null;

      await act(async () => {
        uploadResult = await result.current.uploadFile(file);
      });

      expect(uploadResult).toBe(MOCK_IMAGE_URL);
      expect(result.current.fileItem?.status).toBe('success');
      expect(result.current.fileItem?.progress).toBe(100);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('업로드 중 진행률이 업데이트된다.', async () => {
      let captureOnProgress: ((event: {progress: number}) => void) | null = null;
      let resolveUpload: ((url: string) => void) | null = null;

      mockUpload.mockImplementation((_, onProgress) => {
        captureOnProgress = onProgress;
        return new Promise(resolve => {
          resolveUpload = resolve;
        });
      });

      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const file = createMockFile(1024);

      let uploadPromise: Promise<string | null>;
      act(() => {
        uploadPromise = result.current.uploadFile(file);
      });

      act(() => {
        captureOnProgress?.({progress: 25});
      });
      expect(result.current.fileItem?.progress).toBe(25);
      expect(result.current.fileItem?.status).toBe('uploading');

      act(() => {
        captureOnProgress?.({progress: 50});
      });
      expect(result.current.fileItem?.progress).toBe(50);

      await act(async () => {
        resolveUpload?.(MOCK_IMAGE_URL);
        await uploadPromise;
      });

      expect(result.current.fileItem?.status).toBe('success');
      expect(result.current.fileItem?.progress).toBe(100);
    });
  });

  describe('에러 케이스', () => {
    it('파일 크기가 최대 크기를 초과하면 에러가 발생한다.', async () => {
      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const largeFile = createMockFile(MAX_FILE_SIZE + 1);
      let uploadResult: string | null = null;

      await act(async () => {
        uploadResult = await result.current.uploadFile(largeFile);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.fileItem?.status).toBe('error');

      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError.mock.calls[0][0]).toBeInstanceOf(ClientError);
      expect(mockOnError.mock.calls[0][0].name).toBe('MAX_SIZE_EXCEEDED');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('업로드 함수가 null을 반환하면 업로드 실패 에러가 발생한다.', async () => {
      mockUpload.mockResolvedValue(null);

      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const file = createMockFile(1024);
      let uploadResult: string | null = null;

      await act(async () => {
        uploadResult = await result.current.uploadFile(file);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.fileItem?.status).toBe('error');
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError.mock.calls[0][0]).toBeInstanceOf(ClientError);
      expect(mockOnError.mock.calls[0][0].name).toBe('UPLOAD_FAILED');
    });

    it('클라이언트 검증 에러가 발생하면 에러 콜백에 전달한다.', async () => {
      const clientError = new ClientError('TOO_MANY_IMAGES_SELECTED');
      mockUpload.mockRejectedValue(clientError);

      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const file = createMockFile(1024);
      let uploadResult: string | null = null;

      await act(async () => {
        uploadResult = await result.current.uploadFile(file);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.fileItem?.status).toBe('error');
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(clientError);
    });

    it('네트워크 에러가 발생하면 에러 콜백에 전달한다.', async () => {
      const requestError = new RequestError({
        name: 'INTERNAL_SERVER_ERROR',
        message: '알 수 없는 에러가 발생했어요.',
        endpoint: '/test',
        method: 'POST',
        requestBody: null,
        status: 500,
      });
      mockUpload.mockRejectedValue(requestError);

      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const file = createMockFile(1024);
      let uploadResult: string | null = null;

      await act(async () => {
        uploadResult = await result.current.uploadFile(file);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.fileItem?.status).toBe('error');
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(requestError);
    });

    it('예측 불가능한 에러가 발생하면 기본값 에러를 생성한다.', async () => {
      mockUpload.mockRejectedValue(new Error('Unknown error'));

      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const file = createMockFile(1024);
      let uploadResult: string | null = null;

      await act(async () => {
        uploadResult = await result.current.uploadFile(file);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.fileItem?.status).toBe('error');
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError.mock.calls[0][0]).toBeInstanceOf(ClientError);
      expect(mockOnError.mock.calls[0][0].name).toBe('UPLOAD_FAILED');
    });
  });

  describe('업로드 중단', () => {
    const mockAbortableUpload = (file: File, onProgress: any, signal: AbortSignal) => {
      return new Promise<string>((resolve, reject) => {
        if (signal.aborted) {
          reject(new Error('Aborted'));
          return;
        }

        signal.addEventListener('abort', () => {
          reject(new Error('Aborted'));
        });
      });
    };

    it('업로드 중이지 않을 때 업로드 중단을 호출하면 아무 일도 일어나지 않는다.', async () => {
      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      expect(result.current.fileItem).toBeNull();

      act(() => {
        result.current.clearFileItem();
      });

      expect(result.current.fileItem).toBeNull();
    });

    it('업로드를 취소하면 업로드가 중단되고 파일 상태가 초기화된다.', async () => {
      mockUpload.mockImplementationOnce(mockAbortableUpload);

      const {result} = renderHook(() =>
        useFileUpload({
          maxSize: MAX_FILE_SIZE,
          upload: mockUpload,
          onError: mockOnError,
          accept: 'image/*',
        }),
      );

      const file = createMockFile(1024);
      let uploadPromise: Promise<string | null>;

      act(() => {
        uploadPromise = result.current.uploadFile(file);
      });

      expect(result.current.fileItem?.status).toBe('uploading');

      act(() => {
        result.current.clearFileItem();
      });

      const uploadResult = await uploadPromise!;

      expect(result.current.fileItem).toBeNull();
      expect(mockOnError).not.toHaveBeenCalled();
      expect(uploadResult).toBeNull();
    });
  });
});
