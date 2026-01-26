import handleImageUpload from '../handleImageUpload';
import {getPresigned, uploadImage} from '@/entities/review';

jest.mock('@/entities/review');

const mockGetPresigned = getPresigned as jest.MockedFunction<typeof getPresigned>;
const mockUploadImage = uploadImage as jest.MockedFunction<typeof uploadImage>;

describe('src/features/review/editor/lib/handleImageUpload.ts', () => {
  const mockOnProgress = jest.fn();
  const mockAbortController = new AbortController();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('정상 업로드', () => {
    it('임시 URL을 받아 이미지를 업로드하고 URL을 반환한다.', async () => {
      const mockPresignedUrl = 'https://s3.amazonaws.com/bucket/upload';
      const mockUuid = 'test-uuid-123';
      const mockImageUrl = 'https://cdn.example.com/images/test-uuid-123.jpg';

      mockGetPresigned.mockResolvedValue({
        presignedUrl: mockPresignedUrl,
        uuid: mockUuid,
      });
      mockUploadImage.mockResolvedValue(mockImageUrl);

      const file = new File(['test'], 'test.jpg', {type: 'image/jpeg'});

      const result = await handleImageUpload(file, mockOnProgress, mockAbortController.signal);

      expect(mockGetPresigned).toHaveBeenCalledTimes(1);
      expect(mockGetPresigned).toHaveBeenCalledWith('jpeg');

      expect(mockUploadImage).toHaveBeenCalledTimes(1);
      expect(mockUploadImage).toHaveBeenCalledWith({
        file,
        fileType: 'jpeg',
        presignedUrl: mockPresignedUrl,
        imageId: mockUuid,
        onProgress: mockOnProgress,
        abortSignal: mockAbortController.signal,
      });

      expect(result).toBe(mockImageUrl);
    });

    it('파일 타입을 올바르게 추출한다.', async () => {
      mockGetPresigned.mockResolvedValue({
        presignedUrl: 'https://s3.amazonaws.com/bucket/upload',
        uuid: 'test-uuid',
      });
      mockUploadImage.mockResolvedValue('https://cdn.example.com/image.png');

      const file = new File(['test'], 'test.png', {type: 'image/png'});

      await handleImageUpload(file, mockOnProgress, mockAbortController.signal);

      expect(mockGetPresigned).toHaveBeenCalledWith('png');
      expect(mockUploadImage).toHaveBeenCalledWith(
        expect.objectContaining({
          fileType: 'png',
        }),
      );
    });

    it('onProgress와 abortSignal을 uploadImage에 전달한다.', async () => {
      mockGetPresigned.mockResolvedValue({
        presignedUrl: 'https://s3.amazonaws.com/bucket/upload',
        uuid: 'test-uuid',
      });
      mockUploadImage.mockResolvedValue('https://cdn.example.com/image.jpg');

      const file = new File(['test'], 'test.jpg', {type: 'image/jpeg'});
      const customOnProgress = jest.fn();
      const customAbortController = new AbortController();

      await handleImageUpload(file, customOnProgress, customAbortController.signal);

      expect(mockUploadImage).toHaveBeenCalledWith(
        expect.objectContaining({
          onProgress: customOnProgress,
          abortSignal: customAbortController.signal,
        }),
      );
    });
  });

  describe('에러 케이스', () => {
    it('임시 URL 발급에 실패하면 에러를 던진다.', async () => {
      const error = new Error('Presigned URL 생성 실패');
      mockGetPresigned.mockRejectedValue(error);

      const file = new File(['test'], 'test.jpg', {type: 'image/jpeg'});

      try {
        await handleImageUpload(file, mockOnProgress, mockAbortController.signal);
        fail('임시 URL 발급에 실패합니다.');
      } catch (error) {
        expect(error).toStrictEqual(error);
      }

      expect(mockGetPresigned).toHaveBeenCalledTimes(1);
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('이미지 업로드가 실패하면 에러를 던진다.', async () => {
      mockGetPresigned.mockResolvedValue({
        presignedUrl: 'https://s3.amazonaws.com/bucket/upload',
        uuid: 'test-uuid',
      });

      const error = new Error('이미지 업로드 실패');
      mockUploadImage.mockRejectedValue(error);

      const file = new File(['test'], 'test.jpg', {type: 'image/jpeg'});

      try {
        await handleImageUpload(file, mockOnProgress, mockAbortController.signal);
        fail('이미지 업로드에 실패합니다.');
      } catch (error) {
        expect(error).toStrictEqual(error);
      }

      expect(mockGetPresigned).toHaveBeenCalledTimes(1);
      expect(mockUploadImage).toHaveBeenCalledTimes(1);
    });
  });
});
