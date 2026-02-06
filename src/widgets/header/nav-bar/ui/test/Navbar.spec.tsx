import {render, screen} from '@testing-library/react';
import Navbar from '../Navbar';
import {ROUTES} from '@/shared/lib/consts/routes';
import {useIsLoggedIn} from '@/entities/auth';
import mockRouter from 'next-router-mock';
import userEvent from '@testing-library/user-event';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/auth');

const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;

describe('src/widgets/header/nav-bar/ui/Navbar.tsx', () => {
  describe('렌더링 테스트', () => {
    it('네비게이션 바가 표시된다.', () => {
      render(<Navbar />);

      ROUTES.forEach(route => {
        expect(screen.getByText(route.title)).toBeInTheDocument();
      });
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

      render(<Navbar />, {wrapper: MemoryRouterProvider});

      const mypageLink = screen.getByRole('link', {name: '마이페이지로 이동'});
      await user.click(mypageLink);

      expect(mockRouter.asPath).toBe('/mypage');
    });

    it('비로그인 사용자는 로그인이 필요한 경로를 클릭했을 때 로그인 안내 문구를 표시한다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/');
      mockUseIsLoggedIn.mockReturnValue(false);

      render(<Navbar />, {wrapper: MemoryRouterProvider});

      const mypageLink = screen.getByRole('button', {name: '마이페이지로 이동'});
      await user.click(mypageLink);

      expect(mockRouter.asPath).toBe('/');

      const message = await screen.findByText('로그인 후 이용할 수 있어요.');
      expect(message).toBeInTheDocument();
    });

    it('현재 경로와 일치하면 네비게이션 요소의 접근성과 스타일을 변경한다.', () => {
      mockRouter.push('/search');

      render(<Navbar />);

      const searchLink = screen.getByRole('link', {name: '둘러보기로 이동'});

      expect(searchLink).toHaveAttribute('aria-selected', 'true');
      expect(searchLink).toHaveClass('text-boldBlue');

      const contactLink = screen.getByRole('link', {name: '문의하기로 이동'});

      expect(contactLink).toHaveAttribute('aria-selected', 'false');
      expect(contactLink).not.toHaveClass('text-boldBlue');
    });
  });
});
