import {act, renderHook} from '@testing-library/react';
import {useChangeProfileImage} from '../useChangeProfileImage';
import {useUserNickname} from '@/entities/auth';
import {usePostProfileImage} from '@/entities/users';

jest.mock('@/entities/auth', () => ({
  useUserNickname: jest.fn(),
}));

jest.mock('@/entities/users', () => ({
  usePostProfileImage: jest.fn(),
}));

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockUsePostProfileImage = usePostProfileImage as jest.MockedFunction<typeof usePostProfileImage>;

describe('features/users/profileImage/lib/useChangeProfileImage', () => {
  const mockUpdateProfileImage = jest.fn();
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const mockCreateObjectURL = jest.fn();
  const mockRevokeObjectURL = jest.fn();

  beforeAll(() => {
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUserNickname.mockReturnValue('tester');
    mockUsePostProfileImage.mockReturnValue({
      updateProfileImage: mockUpdateProfileImage,
    } as any);

    mockCreateObjectURL.mockReturnValue('blob:preview-url');
  });

  describe('정상 케이스', () => {
    it('이미지를 선택한 뒤 업로드를 수행하면 사용자 정보와 함께 요청이 전달된다', () => {
      const appendSpy = jest.spyOn(FormData.prototype, 'append');
      const file = new File(['image'], 'profile.png', {type: 'image/png'});

      const {result} = renderHook(() => useChangeProfileImage());

      act(() => {
        result.current.handleSetFile(file);
      });

      expect(mockCreateObjectURL).toHaveBeenCalledWith(file);

      act(() => {
        result.current.handleSubmit();
      });

      expect(appendSpy).toHaveBeenCalledWith('profileImage', file);
      expect(mockUpdateProfileImage).toHaveBeenCalledTimes(1);

      const payload = mockUpdateProfileImage.mock.calls[0][0];
      expect(payload.userNickname).toBe('tester');
      expect(payload.imageData).toBeInstanceOf(FormData);

      appendSpy.mockRestore();
    });
  });

  describe('엣지 케이스', () => {
    it('이미지를 선택하지 않았다면 업로드 요청이 발생하지 않는다', () => {
      const {result} = renderHook(() => useChangeProfileImage());

      act(() => {
        result.current.handleSubmit();
      });

      expect(mockUpdateProfileImage).not.toHaveBeenCalled();
    });

    it('사용자 정보가 없다면 업로드 요청이 발생하지 않는다.', () => {
      mockUseUserNickname.mockReturnValue('');

      const file = new File(['image'], 'profile.png', {type: 'image/png'});
      const {result: noNicknameResult} = renderHook(() => useChangeProfileImage());

      act(() => {
        noNicknameResult.current.handleSetFile(file);
      });

      act(() => {
        noNicknameResult.current.handleSubmit();
      });

      expect(mockUpdateProfileImage).not.toHaveBeenCalled();
    });

    it('다시 선택을 수행하면 미리보기 주소를 정리하고 선택 상태를 초기화한다', () => {
      const file = new File(['image'], 'profile.png', {type: 'image/png'});

      const {result} = renderHook(() => useChangeProfileImage());

      act(() => {
        result.current.handleSetFile(file);
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:preview-url');
      expect(result.current.profileImage).toBeNull();
    });

    it('컴포넌트가 사라질 때 선택된 미리보기 주소가 정리된다', () => {
      const file = new File(['image'], 'profile.png', {type: 'image/png'});

      const {result, unmount} = renderHook(() => useChangeProfileImage());

      act(() => {
        result.current.handleSetFile(file);
      });

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:preview-url');
    });
  });
});
