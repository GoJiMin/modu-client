import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {cookies} from 'next/headers';
import mockRouter from 'next-router-mock';
import MyPage from '../MyPage';
import {useUserEmail, useUserNickname} from '@/entities/auth';

jest.mock('next/headers');
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next-router-mock/navigation'),
  redirect: () => {
    /**
     * [이슈]
     * - next-router-mock에서 redirect 함수를 지원하지 않음.
     *
     * [해결 방안]
     * - redirect 함수의 동작은 이미 프레임워크 차원에서 검증됨.
     * - 따라서 redirect 함수를 모킹해 호출되는지만 확인 후 렌더링 블락을 위해 에러 발생.
     */
    throw new Error('REDIRECT');
  },
}));
jest.mock('@/entities/auth');

/**
 * 아래의 각 컴포넌트들에 대한 통합 테스트가 이미 작성되었기 때문에,
 * 해당 테스트는 레이아웃이 제대로 표시되는지와 고유 컴포넌트의 기능들만 테스트.
 */
jest.mock('@/features/reviews/my/ui/MyReviews', () => ({
  __esModule: true,
  default: () => <div>내가 작성한 후기 목록</div>,
}));
jest.mock('@/features/reviews/my/ui/MyBookmarkedReviews', () => ({
  __esModule: true,
  default: () => <div>내가 저장한 후기 목록</div>,
}));
jest.mock('@/features/reviews/my', () => ({
  MyReviewsGridLoading: () => <div>리뷰 로딩</div>,
}));
jest.mock('@/features/users/profileImage', () => ({
  ProfileImage: ({userNickname}: {userNickname: string}) => <div data-testid={`프로필 이미지 ${userNickname}`} />,
  EditProfileImage: () => <div>프로필 이미지 수정</div>,
  ProfileImageLoading: () => <div>프로필 이미지 로딩</div>,
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockUseUserEmail = useUserEmail as jest.MockedFunction<typeof useUserEmail>;

describe('src/views/mypage/ui/MyPage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    const TEST_EMAIL = 'jimin@email.com';
    const TEST_NICKNAME = 'jimin';

    beforeEach(() => {
      mockCookies.mockResolvedValue({
        has: () => true,
      } as any);

      mockUseUserEmail.mockReturnValue(TEST_EMAIL);
      mockUseUserNickname.mockReturnValue(TEST_NICKNAME);
    });

    it('마이페이지가 렌더링된다.', async () => {
      render(await MyPage());

      expect(await screen.findByText('내가 작성한 후기 목록')).toBeInTheDocument();

      // 사용자 정보
      expect(screen.getByTestId(`프로필 이미지 ${TEST_NICKNAME}`)).toBeInTheDocument();
      expect(screen.getByText('프로필 이미지 수정')).toBeInTheDocument();
      expect(screen.getByText(TEST_NICKNAME)).toBeInTheDocument();
      expect(screen.getByText(TEST_EMAIL)).toBeInTheDocument();

      // 탭
      const initialSelectedTab = screen.getByRole('tab', {name: '내가 작성한 후기'});
      expect(initialSelectedTab).toBeInTheDocument();
      expect(initialSelectedTab).toHaveAttribute('aria-selected', 'true');

      expect(screen.getByRole('tab', {name: '내가 저장한 후기'})).toBeInTheDocument();
      expect(screen.getByText('내가 작성한 후기 목록')).toBeInTheDocument();
    });

    it('URL에 전달된 탭 정보에 해당하는 목록이 표시된다.', async () => {
      mockRouter.push('/?tabs=myBookmarks');

      render(await MyPage());

      expect(await screen.findByText('내가 저장한 후기 목록')).toBeInTheDocument();
    });

    it('로그인 정보가 초기화되지 않았다면, 사용자 정보 영역에 대체 UI를 표시한다.', async () => {
      mockUseUserEmail.mockReturnValue(null);
      mockUseUserNickname.mockReturnValue(null);

      render(await MyPage());

      expect(await screen.findByText('내가 작성한 후기 목록')).toBeInTheDocument();

      expect(screen.getByText('프로필 이미지 로딩')).toBeInTheDocument();
      expect(screen.queryByText(TEST_NICKNAME)).not.toBeInTheDocument();
      expect(screen.queryByText(TEST_EMAIL)).not.toBeInTheDocument();
    });

    it('로그인 사용자가 아닌 경우 메인 페이지로 리다이렉트된다.', async () => {
      mockCookies.mockResolvedValue({
        has: () => false,
      } as any);

      mockRouter.push('/mypage');

      await expect(MyPage()).rejects.toThrow('REDIRECT');
    });
  });

  describe('통합 테스트', () => {
    beforeEach(() => {
      mockCookies.mockResolvedValue({
        has: () => true,
      } as any);
    });

    it('탭 버튼을 클릭해 내가 작성한 후기와 저장한 후기 탭을 변경할 수 있다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/mypage?tabs=my');

      render(await MyPage());

      expect(await screen.findByText('내가 작성한 후기 목록')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', {name: '내가 저장한 후기'}));

      expect(await screen.findByText('내가 저장한 후기 목록')).toBeInTheDocument();
      expect(mockRouter.asPath).toBe('/mypage?tabs=myBookmarks');
    });
  });
});
