import {useUserEmail, useUserNickname} from '@/entities/auth';
import {getProfileImageByUserNickname} from '@/entities/users/apis/api-service';
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react';
import UserInfo from '../UserInfo';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('../UserInfoAvatarLoading', () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));
jest.mock('@/entities/auth');
jest.mock('@/entities/users/apis/api-service');

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockUseUserEmail = useUserEmail as jest.MockedFunction<typeof useUserEmail>;
const mockGetProfileImageByUserNickname = getProfileImageByUserNickname as jest.MockedFunction<
  typeof getProfileImageByUserNickname
>;

describe('src/widgets/header/side-bar/ui/UserInfo.tsx', () => {
  const TEST_USER_NICKNAME = 'jimin';
  const TEST_USER_EMAIL = 'jimin@email.com';
  const TEST_PROFILE_IMG_URL = 'https://cdn.com/profile_img.png';

  beforeEach(() => {
    mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
    mockUseUserEmail.mockReturnValue(TEST_USER_EMAIL);
    mockGetProfileImageByUserNickname.mockResolvedValue({profileImage: TEST_PROFILE_IMG_URL});
  });

  it('사용자 프로필 정보가 표시된다.', async () => {
    render(withAllContext(<UserInfo />));

    await waitForElementToBeRemoved(screen.getByText('loading'));

    expect(screen.getByText(TEST_USER_NICKNAME));
    expect(screen.getByText(TEST_USER_EMAIL));

    const profileImage = screen.getByRole('img', {name: `${TEST_USER_NICKNAME} 프로필 사진`});

    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', TEST_PROFILE_IMG_URL);
  });

  it('로그인 정보 초기화가 되지 않은 경우 대체 UI가 표시된다.', async () => {
    mockUseUserNickname.mockReturnValue(null);

    render(withAllContext(<UserInfo />));

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('프로필 이미지 요청에 실패해도 사용자 닉네임과 이메일이 표시된다.', async () => {
    mockGetProfileImageByUserNickname.mockRejectedValue(new Error('Unknown Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(withAllContext(<UserInfo />));

    await waitForElementToBeRemoved(screen.getByText('loading'));

    expect(screen.getByText('실패 이유: Unknown Error')).toBeInTheDocument();
    expect(screen.getByText(TEST_USER_NICKNAME)).toBeInTheDocument();
    expect(screen.getByText(TEST_USER_EMAIL)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
