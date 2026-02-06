import {render, screen} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import Pagination from '../Pagination';
import userEvent from '@testing-library/user-event';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';

describe('src/widgets/pagination/ui/Pagination.tsx', () => {
  describe('렌더링 테스트', () => {
    /**
     * 이전 1 다음
     */
    it('총 페이지 수가 1개일 때 1개만 표시된다.', () => {
      render(<Pagination currentPage={1} totalPages={1} generateUrl={page => `/?page=${page}`} />);

      expect(screen.getByRole('link', {name: '1'})).toBeInTheDocument();
      expect(screen.queryByRole('link', {name: '2'})).not.toBeInTheDocument();

      expect(screen.getByRole('link', {name: '이전 페이지로 이동'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '다음 페이지로 이동'})).toBeInTheDocument();
    });

    /**
     * 이전 1 2 3 다음
     */
    it('총 페이지 수가 3개일 때 3개 모두 표시된다.', () => {
      render(<Pagination currentPage={1} totalPages={3} generateUrl={page => `/?page=${page}`} />);

      expect(screen.getByRole('link', {name: '1'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '2'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '3'})).toBeInTheDocument();

      expect(screen.getByRole('link', {name: '이전 페이지로 이동'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '다음 페이지로 이동'})).toBeInTheDocument();
    });

    /**
     * 이전 1 ... 4 5 6 ... 10 다음
     */
    it('총 10페이지 중 5페이지일 때, 올바른 페이지 범위와 생략 기호를 표시한다.', () => {
      render(<Pagination currentPage={5} totalPages={10} generateUrl={page => `/?page=${page}`} />);

      expect(screen.getByRole('link', {name: '1'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '10'})).toBeInTheDocument();

      expect(screen.getByRole('link', {name: '4'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '5'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '6'})).toBeInTheDocument();

      const ellipses = screen.getAllByText('More pages', {selector: 'span'});
      expect(ellipses).toHaveLength(2);

      expect(screen.queryByRole('link', {name: '2'})).not.toBeInTheDocument();
      expect(screen.queryByRole('link', {name: '8'})).not.toBeInTheDocument();
    });

    /**
     * 이전 1 2 3 ... 10 다음
     */
    it('총 10페이지 중 1페이지일 때, 올바른 페이지 범위와 생략 기호를 표시한다.', () => {
      render(<Pagination currentPage={1} totalPages={10} generateUrl={page => `/?page=${page}`} />);

      expect(screen.getByRole('link', {name: '1'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '2'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '3'})).toBeInTheDocument();

      const ellipses = screen.getAllByText('More pages', {selector: 'span'});
      expect(ellipses).toHaveLength(1);

      expect(screen.getByRole('link', {name: '10'})).toBeInTheDocument();
    });

    /**
     * 이전 1 ... 8 9 10 다음
     */
    it('총 10페이지 중 10페이지일 때, 올바른 페이지 범위와 생략 기호를 표시한다.', () => {
      render(<Pagination currentPage={10} totalPages={10} generateUrl={page => `/?page=${page}`} />);

      expect(screen.getByRole('link', {name: '1'})).toBeInTheDocument();

      const ellipses = screen.getAllByText('More pages', {selector: 'span'});
      expect(ellipses).toHaveLength(1);

      expect(screen.getByRole('link', {name: '8'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '9'})).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '10'})).toBeInTheDocument();
    });
  });

  describe('기능 테스트', () => {
    beforeEach(() => {
      mockRouter.reset();
    });

    it('현재 조회 중인 페이지의 버튼이 비활성화된다.', () => {
      render(<Pagination currentPage={2} totalPages={5} generateUrl={page => `/?page=${page}`} />);

      const currentPageButton = screen.getByRole('link', {name: '2'});

      expect(currentPageButton).toHaveAttribute('aria-disabled', 'true');
      expect(currentPageButton).toHaveClass('pointer-events-none');
    });

    it('총 페이지가 1개일 때 이전 페이지로 이동, 다음 페이지로 이동 버튼이 비활성화된다.', () => {
      render(<Pagination currentPage={1} totalPages={1} generateUrl={page => `/?page=${page}`} />);

      const previousButton = screen.getByRole('link', {name: '이전 페이지로 이동'});
      const nextButton = screen.getByRole('link', {name: '다음 페이지로 이동'});

      expect(previousButton).toHaveAttribute('aria-disabled', 'true');
      expect(previousButton).toHaveClass('pointer-events-none');

      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
      expect(nextButton).toHaveClass('pointer-events-none');
    });

    it('총 5페이지 중 1페이지일 때 이전 페이지로 이동 버튼이 비활성화된다.', () => {
      render(<Pagination currentPage={1} totalPages={5} generateUrl={page => `/?page=${page}`} />);

      const previousButton = screen.getByRole('link', {name: '이전 페이지로 이동'});

      expect(previousButton).toHaveAttribute('aria-disabled', 'true');
      expect(previousButton).toHaveClass('pointer-events-none');
    });

    it('총 5페이지 중 5페이지일 때 다음 페이지로 이동 버튼이 비활성화된다.', () => {
      render(<Pagination currentPage={5} totalPages={5} generateUrl={page => `/?page=${page}`} />);

      const nextButton = screen.getByRole('link', {name: '다음 페이지로 이동'});

      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
      expect(nextButton).toHaveClass('pointer-events-none');
    });

    it('페이지 버튼을 클릭해 이동할 수 있다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/?page=1');

      const {rerender} = render(<Pagination currentPage={1} totalPages={8} generateUrl={page => `/?page=${page}`} />, {
        wrapper: MemoryRouterProvider,
      });

      const nextButton = screen.getByRole('link', {name: '다음 페이지로 이동'});
      await user.click(nextButton);

      expect(mockRouter.asPath).toBe('/?page=2');
      rerender(<Pagination currentPage={2} totalPages={8} generateUrl={page => `/?page=${page}`} />);

      const lastPageButton = screen.getByRole('link', {name: '8'});
      await user.click(lastPageButton);

      expect(mockRouter.asPath).toBe('/?page=8');
      rerender(<Pagination currentPage={8} totalPages={8} generateUrl={page => `/?page=${page}`} />);

      const previousButton = screen.getByRole('link', {name: '이전 페이지로 이동'});
      await user.click(previousButton);

      expect(mockRouter.asPath).toBe('/?page=7');
    });
  });
});
