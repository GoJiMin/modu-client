import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditProfileImage from '../EditProfileImage';
import {useUserNickname} from '@/entities/auth';
import {deleteProfileImage, getProfileImageByUserNickname, postProfileImage} from '@/entities/users/apis/api-service';
import {NO_PROFILE_IMAGE_URL} from '@/entities/users';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import {useUpdateGlobalError} from '@/entities/error';

jest.mock('@/entities/auth');
jest.mock('@/entities/users/apis/api-service');
jest.mock('@/entities/error');

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockGetProfileImageByUserNickname = getProfileImageByUserNickname as jest.MockedFunction<
  typeof getProfileImageByUserNickname
>;
const mockPostProfileImage = postProfileImage as jest.MockedFunction<typeof postProfileImage>;
const mockDeleteProfileImage = deleteProfileImage as jest.MockedFunction<typeof deleteProfileImage>;
const mockUseUpdateGlobalError = useUpdateGlobalError as jest.MockedFunction<typeof useUpdateGlobalError>;

window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();

describe('src/features/users/profileImage/ui/ChangeProfileImageDialog.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserNickname.mockReturnValue('jimin');
    mockGetProfileImageByUserNickname.mockResolvedValue({profileImage: 'https://example.com/profile-image.png'});
  });

  describe('렌더링 테스트', () => {
    it('프로필 이미지 수정 버튼이 렌더링된다.', async () => {
      render(withAllContext(<EditProfileImage />));

      expect(screen.getByLabelText('프로필 이미지 수정')).toBeInTheDocument();
    });

    it('프로필 이미지 수정 버튼을 클릭하면 수정 및 삭제 버튼이 표시된다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<EditProfileImage />));

      await user.click(screen.getByLabelText('프로필 이미지 수정'));

      expect(screen.getByLabelText('이미지 선택')).toBeInTheDocument();
      expect(screen.getByLabelText('프로필 이미지 삭제')).toBeInTheDocument();
    });

    it('기본 프로필 이미지인 경우 삭제 버튼이 표시되지 않는다.', async () => {
      const user = userEvent.setup();
      mockGetProfileImageByUserNickname.mockResolvedValue({profileImage: NO_PROFILE_IMAGE_URL});

      render(withAllContext(<EditProfileImage />));

      await user.click(screen.getByLabelText('프로필 이미지 수정'));

      expect(screen.getByLabelText('이미지 선택')).toBeInTheDocument();
      expect(screen.queryByLabelText('프로필 이미지 삭제')).not.toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    describe('이미지 선택', () => {
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
        mockCreateObjectURL.mockImplementation(file => {
          return `preview-${file.name}`;
        });
      });

      const createMockFile = (size: number = 1024, type: string = 'image/jpeg'): File => {
        const blob = new Blob(['a'.repeat(size)], {type});
        return new File([blob], 'test-image.jpg', {type});
      };

      it('이미지 선택 버튼을 클릭하면 다이얼로그가 표시된다.', async () => {
        const user = userEvent.setup();

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByLabelText('이미지 선택'));

        expect(screen.getByText('프로필 이미지 변경'));
      });

      it('선택된 사진이 없을 경우 사진을 선택해 미리보기로 표시하고, 취소 시 선택 화면으로 돌아온다.', async () => {
        const user = userEvent.setup();

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByLabelText('이미지 선택'));

        const imageUploadInput = screen.getByLabelText('이미지 업로드');
        const file = createMockFile(1024);

        await user.upload(imageUploadInput, file);

        await waitFor(() => {
          const img = screen.getByRole('img', {name: '프로필 이미지 미리보기'});

          expect(img).toHaveAttribute('src', `preview-${file.name}`);
        });

        await user.click(screen.getByRole('button', {name: '프로필 이미지 다시 선택'}));

        await waitFor(() => {
          expect(screen.queryByRole('img')).not.toBeInTheDocument();
          expect(mockRevokeObjectURL).toHaveBeenCalledWith(`preview-${file.name}`);
          expect(screen.getByText('프로필 이미지 변경')).toBeInTheDocument();
        });
      });

      it('드래그 앤 드롭으로 사진을 추가할 수 있다.', async () => {
        const user = userEvent.setup();
        const mockUpdateGlobalError = jest.fn();

        mockUseUpdateGlobalError.mockReturnValue(mockUpdateGlobalError);

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByLabelText('이미지 선택'));

        const file = createMockFile(1024);
        const dropZone = screen.getByLabelText(/사진을 드래그하거나 클릭해 업로드할 수 있어요\./i);

        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file],
            types: ['Files'],
          },
        });

        await waitFor(() => {
          const img = screen.getByRole('img', {name: '프로필 이미지 미리보기'});

          expect(img).toHaveAttribute('src', `preview-${file.name}`);
        });
      });

      it('사진 선택 후 업로드 버튼을 클릭하면 선택한 이미지로 변경을 요청한다', async () => {
        const user = userEvent.setup();

        mockPostProfileImage.mockResolvedValue();

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByLabelText('이미지 선택'));

        const imageUploadInput = screen.getByLabelText('이미지 업로드');
        const file = createMockFile(1024);

        await user.upload(imageUploadInput, file);

        await waitFor(() => {
          const img = screen.getByRole('img', {name: '프로필 이미지 미리보기'});

          expect(img).toHaveAttribute('src', `preview-${file.name}`);
        });

        await user.click(screen.getByRole('button', {name: '프로필 이미지 업로드'}));

        await waitFor(() => {
          expect(mockPostProfileImage).toHaveBeenCalledTimes(1);

          const receivedFormData = mockPostProfileImage.mock.calls[0][0];
          const uploadedFile = receivedFormData.get('profileImage');

          expect(uploadedFile).toBeInstanceOf(File);
          // 위에서 File임이 검증되었기 때문에 타입 단언을 사용해 속성 비교
          expect((uploadedFile as File).name).toBe(file.name);
        });

        expect(mockRevokeObjectURL).toHaveBeenCalledWith(`preview-${file.name}`);
      });

      it('용량 제한을 초과하는 파일을 선택하면 에러가 발생하고 업로드되지 않는다.', async () => {
        const user = userEvent.setup();
        const mockUpdateGlobalError = jest.fn();

        mockUseUpdateGlobalError.mockReturnValue(mockUpdateGlobalError);

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByLabelText('이미지 선택'));

        const oversizedFile = createMockFile(6 * 1024 * 1024);

        const imageUploadInput = screen.getByLabelText('이미지 업로드');
        await user.upload(imageUploadInput, oversizedFile);

        expect(screen.queryByRole('img', {name: '프로필 이미지 미리보기'})).not.toBeInTheDocument();

        expect(mockUpdateGlobalError).toHaveBeenCalledWith(expect.objectContaining({name: 'FILE_SIZE_EXCEEDED'}));
      });

      it('허용되지 않은 타입의 파일을 드래그 앤 드롭하면 에러가 발생한다.', async () => {
        const user = userEvent.setup();
        const mockUpdateGlobalError = jest.fn();

        mockUseUpdateGlobalError.mockReturnValue(mockUpdateGlobalError);

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByLabelText('이미지 선택'));

        const notSuportedFile = createMockFile(1024, 'image/gif');
        const dropZone = screen.getByLabelText(/사진을 드래그하거나 클릭해 업로드할 수 있어요\./i);

        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [notSuportedFile],
            types: ['Files'],
          },
        });

        expect(mockUpdateGlobalError).toHaveBeenCalledWith(expect.objectContaining({name: 'NOT_SUPPORTED_FILE'}));
        expect(screen.queryByRole('img', {name: '프로필 이미지 미리보기'})).not.toBeInTheDocument();
      });
    });

    describe('이미지 삭제', () => {
      it('프로필 이미지 삭제 버튼을 클릭하면 다이얼로그가 표시된다.', async () => {
        const user = userEvent.setup();

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByRole('button', {name: '프로필 이미지 삭제'}));

        expect(screen.getByText('프로필 이미지 삭제')).toBeInTheDocument();
      });

      it('다이얼로그의 삭제 버튼을 클릭하면 삭제를 요청한다.', async () => {
        const user = userEvent.setup();

        mockDeleteProfileImage.mockResolvedValue();

        render(withAllContext(<EditProfileImage />));

        await user.click(screen.getByLabelText('프로필 이미지 수정'));
        await user.click(screen.getByRole('button', {name: '프로필 이미지 삭제'}));
        await user.click(screen.getByRole('button', {name: '삭제 확인'}));

        await waitFor(() => {
          expect(mockDeleteProfileImage).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
