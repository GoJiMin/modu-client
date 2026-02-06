import {useIsLoggedIn} from '@/entities/auth';
import {render, screen} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import CategorySearchPage from '../CategorySearchPage';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/auth');
// 해당 기능에 대한 통합 테스트가 이미 수행되었기 때문에 레이아웃 구조만 검증
jest.mock('@/features/reviews/category', () => ({
  CategoryReviews: () => <div>카테고리 리뷰 목록</div>,
}));

const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;

describe('src/views/search/ui/CategorySearchPage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    it('카테고리 검색 페이지가 렌더링된다.', () => {
      render(<CategorySearchPage />);

      // 헤더
      expect(screen.getByText('후기글 모음')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '키워드로 후기 검색'})).toBeInTheDocument();

      // 리뷰 목록
      expect(screen.getByText('카테고리 리뷰 목록')).toBeInTheDocument();

      // 플로팅 버튼
      expect(screen.getByRole('button', {name: '위로 이동'})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '리뷰 작성하기'})).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    const spyScrollTo = jest.fn();
    beforeEach(() => {
      Object.defineProperty(global.window, 'scrollTo', {
        value: spyScrollTo,
        writable: true,
      });
    });

    it('드로어를 펼쳐 검색어를 입력 후 검색 페이지로 이동할 수 있다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/');
      render(<CategorySearchPage />);

      await user.click(screen.getByRole('button', {name: '키워드로 후기 검색'}));

      await screen.findByText('후기 검색');

      await user.type(screen.getByPlaceholderText('후기를 검색하세요'), 'pizza{Enter}');

      expect(mockRouter.asPath).toBe('/search/pizza');
    });

    it('드로어의 입력창 외 다른 영역을 클릭하면 드로어가 닫힌다.', async () => {
      const user = userEvent.setup();

      render(<CategorySearchPage />);

      await user.click(screen.getByRole('button', {name: '키워드로 후기 검색'}));

      await user.click(screen.getByText('검색어를 입력하고 엔터를 눌러주세요.'));

      expect(screen.queryByText('검색어를 입력하고 엔터를 눌러주세요.')).not.toBeInTheDocument();
    });

    it('위로 이동 버튼을 클릭해 페이지 상단으로 이동할 수 있다.', async () => {
      const user = userEvent.setup();

      render(<CategorySearchPage />);

      await user.click(screen.getByRole('button', {name: '위로 이동'}));

      expect(spyScrollTo).toHaveBeenCalled();
      expect(spyScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('리뷰 작성 버튼을 클릭해 작성 페이지로 이동할 수 있다.', async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(true);
      mockRouter.push('/');

      render(<CategorySearchPage />);

      await user.click(screen.getByRole('button', {name: '리뷰 작성하기'}));

      expect(mockRouter.asPath).toBe('/reviews/new');
    });

    it('로그인하지 않은 사용자가 작성 버튼을 클릭하면 로그인 유도 모달을 표시한다.', async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(false);
      mockRouter.push('/');

      render(<CategorySearchPage />);

      await user.click(screen.getByRole('button', {name: '리뷰 작성하기'}));

      expect(screen.getByText('로그인 후 이용 가능한 서비스입니다.')).toBeInTheDocument();
    });
  });
});
