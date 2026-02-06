import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import KeywordReviews from '../KeywordReviews';
import {SortKey} from '@/features/reviews/sorting';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

// 해당 테스트는 이미 작성되었으므로 정렬 옵션이 전달되는지만 확인
jest.mock('../ReviewWithPagination', () => ({
  __esModule: true,
  default: ({sort}: {sort: SortKey}) => <div>키워드 검색 - {sort}</div>,
}));

describe('src/features/reviews/keyword/ui/KeywordReviews.tsx', () => {
  describe('렌더링 테스트', () => {
    it('키워드 검색 컴포넌트가 렌더링된다.', () => {
      mockRouter.push('/search?sort=recent');
      render(<KeywordReviews />);

      // 정렬 옵션
      expect(screen.getByRole('combobox')).toBeInTheDocument();

      // 리뷰 목록
      expect(screen.getByText('키워드 검색 - recent'));
    });
  });

  describe('기능 테스트', () => {
    it('정렬 옵션을 변경하면 변경된 옵션을 전달한다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/search?sort=recent');
      render(<KeywordReviews />);

      expect(screen.getByText('키워드 검색 - recent'));

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('댓글순'));

      expect(screen.getByText('키워드 검색 - hotcomments'));
    });
  });
});
