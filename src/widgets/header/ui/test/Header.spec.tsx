import mockRouter from 'next-router-mock';
import {useIsLoggedIn} from '@/entities/auth';
import Header from '../Header';
import {act, render, screen} from '@testing-library/react';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/auth');

// 아래 기능들에 대한 테스트는 이미 진행됐기 때문에 레이아웃 검증만을 위한 모킹
jest.mock('@/features/auth/ui/LoginButton', () => ({
  __esModule: true,
  default: () => <div>로그인 버튼</div>,
}));
jest.mock('@/features/auth', () => ({
  ...jest.requireActual('@/features/auth'),
  LogoutButton: () => <div>로그아웃 버튼</div>,
  LoginButtonLoading: () => <div>로그인 버튼 로딩</div>,
}));
jest.mock('@/features/notifications', () => ({
  NotificationBell: () => <div>알림 벨</div>,
}));
jest.mock('../../side-bar', () => ({
  Sidebar: () => <div>사이드 바</div>,
}));
jest.mock('../../nav-bar', () => ({
  Navbar: () => <div>네비게이션 바</div>,
}));

const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;

describe('src/widgets/header/ui/Header.tsx', () => {
  describe('렌더링 테스트', () => {
    it('헤더가 렌더링된다.', async () => {
      mockUseIsLoggedIn.mockReturnValue(false);
      render(<Header />);

      // 지연 로딩 회피를 위한 대기
      await screen.findByText('로그인 버튼');

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '모두의 : 후기'})).toBeInTheDocument();

      /**
       * jsdom 환경에서 데스크탑, 모바일 구분을 위한 tailwindcss가 동작하지 않음.
       * 따라서 환경을 구분하는 클래스 적용 여부만 확인
       */
      const sidebarContainer = screen.getByText('사이드 바').closest('div.flex');
      const navbarContainer = screen.getByText('네비게이션 바').closest('div.hidden');

      expect(sidebarContainer).toHaveClass('lg:hidden flex');
      expect(navbarContainer).toHaveClass('hidden lg:flex');

      expect(screen.queryByText('알림 벨')).not.toBeInTheDocument();

      expect(screen.getByText('로그인 버튼')).toBeInTheDocument();
    });

    it('로그인 사용자는 알림 벨과 로그아웃 버튼이 표시된다.', async () => {
      mockUseIsLoggedIn.mockReturnValue(true);

      render(<Header />);

      // 사이드 바, 네비게이션 바 영역 모두에 표시되기 때문에 2개
      expect(screen.getAllByText('알림 벨')).toHaveLength(2);

      expect(screen.getByText('로그아웃 버튼')).toBeInTheDocument();
      expect(screen.queryByText('로그인 버튼')).not.toBeInTheDocument();
    });

    it('메인 페이지가 아닌 경우에만 헤더에 밑줄을 표시한다.', async () => {
      mockUseIsLoggedIn.mockReturnValue(true);
      mockRouter.push('/search');

      const {rerender} = render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-b border-gray-200');

      act(() => {
        mockRouter.push('/');
      });

      rerender(<Header />);
      expect(screen.getByRole('banner')).not.toHaveClass('border-b border-gray-200');
    });
  });
});
