import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import Sidebar from '../Sidebar';
import {useIsLoggedIn} from '@/entities/auth';
import {ROUTES} from '@/shared/lib/consts/routes';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/auth');
jest.mock('@/features/auth/ui/LoginButton', () => ({
  __esModule: true,
  default: () => <div>로그인 버튼</div>,
}));
jest.mock('@/features/auth/ui/LogoutButton', () => ({
  __esModule: true,
  default: () => <div>로그아웃 버튼</div>,
}));
jest.mock('../UserInfo', () => ({
  __esModule: true,
  default: () => <div>사용자 정보</div>,
}));

const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;

describe('src/widgets/header/side-bar/ui/Sidebar.tsx', () => {
  describe('렌더링 테스트', () => {
    it('사이드바를 열 수 있는 버튼이 표시된다.', () => {
      render(<Sidebar />);

      expect(screen.getByLabelText('사이드바 네비게이션 열기')).toBeInTheDocument();
    });

    it('사이드바를 열면 네비게이션 항목이 표시된다.', async () => {
      const user = userEvent.setup();

      render(<Sidebar />);

      await user.click(screen.getByLabelText('사이드바 네비게이션 열기'));

      expect(screen.getByText('모두의 후기')).toBeInTheDocument();

      ROUTES.forEach(route => {
        expect(screen.getByText(route.title)).toBeInTheDocument();
      });
    });

    it('로그인 사용자는 사이드바 내 사용자 정보와 로그아웃 버튼이 표시된다.', async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(true);

      render(<Sidebar />);

      await user.click(screen.getByLabelText('사이드바 네비게이션 열기'));

      expect(screen.getByText('사용자 정보')).toBeInTheDocument();

      expect(screen.getByText('로그아웃 버튼')).toBeInTheDocument();
    });

    it('비로그인 사용자는 사이드바 내 로그인 버튼이 표시된다.', async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(false);

      render(<Sidebar />);

      await user.click(screen.getByLabelText('사이드바 네비게이션 열기'));

      expect(screen.getByText('로그인 버튼')).toBeInTheDocument();
    });
  });

  describe('기능 테스트', () => {
    beforeEach(() => {
      mockRouter.reset();
    });

    it('로그인 사용자는 로그인이 필요한 경로를 클릭했을 때 이동할 수 있다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/');
      mockUseIsLoggedIn.mockReturnValue(true);

      render(<Sidebar />, {wrapper: MemoryRouterProvider});

      await user.click(screen.getByLabelText('사이드바 네비게이션 열기'));

      const mypageLink = screen.getByRole('link', {name: '마이페이지로 이동'});
      await user.click(mypageLink);

      // 사이드바가 접혔는지 확인
      expect(screen.queryByText('모두의 후기')).not.toBeInTheDocument();
      expect(mockRouter.asPath).toBe('/mypage');
    });

    it('비로그인 사용자는 로그인이 필요한 경로를 클릭했을 때 로그인 안내 문구를 표시한다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/');
      mockUseIsLoggedIn.mockReturnValue(false);

      render(<Sidebar />, {wrapper: MemoryRouterProvider});

      await user.click(screen.getByLabelText('사이드바 네비게이션 열기'));

      const mypageLink = screen.getByRole('button', {name: '마이페이지로 이동'});
      await user.click(mypageLink);

      expect(mockRouter.asPath).toBe('/');

      const message = await screen.findByText('로그인 후 이용할 수 있어요.');
      expect(message).toBeInTheDocument();
    });

    it('현재 경로와 일치하면 네비게이션 요소의 접근성과 스타일을 변경한다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/search');

      render(<Sidebar />);

      await user.click(screen.getByLabelText('사이드바 네비게이션 열기'));

      const searchLink = screen.getByRole('link', {name: '둘러보기로 이동'});

      expect(searchLink).toHaveAttribute('aria-selected', 'true');
      expect(searchLink).toHaveClass('text-boldBlue');

      const contactLink = screen.getByRole('link', {name: '문의하기로 이동'});

      expect(contactLink).toHaveAttribute('aria-selected', 'false');
      expect(contactLink).not.toHaveClass('text-boldBlue');
    });
  });
});
