// 테스트용 File 객체
export const createMockFile = (size: number = 1024, type: string = 'image/jpeg'): File => {
  const blob = new Blob(['a'.repeat(size)], {type});
  return new File([blob], 'test-image.jpg', {type});
};

export const MOCK_IMAGE_URL = 'https://example.com/uploaded-image.jpg';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPT = ''