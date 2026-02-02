import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import RecentReviewCard from '../RecentReviewCard';
import {createMockRecentReviewCard} from './stub';

describe('src/features/reviews/recent/ui/RecentReviewCard.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultPost = createMockRecentReviewCard();

  describe('정상 케이스', () => {
    it('리뷰 카드가 정상적으로 컴포넌트가 렌더링된다.', () => {
      render(<RecentReviewCard post={defaultPost} />);

      const img = screen.getByRole('img');

      expect(img).toHaveAttribute('src', defaultPost.image_url);
      expect(img).toHaveAttribute('alt', defaultPost.title);
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(screen.getByText(defaultPost.title));
      expect(screen.getByText(defaultPost.preview));
    });

    it('리뷰 카드의 링크가 정상적으로 연결된다.', () => {
      render(<RecentReviewCard post={defaultPost} />);

      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href', '/reviews/' + defaultPost.board_id);
    });

    it('리뷰 카드를 클릭하면 해당 페이지로 이동한다.', async () => {
      const user = userEvent.setup();

      render(<RecentReviewCard post={defaultPost} />, {wrapper: MemoryRouterProvider});

      const link = screen.getByRole('link');
      await user.click(link);

      expect(mockRouter.asPath).toBe('/reviews/' + defaultPost.board_id);
    });
  });

  describe('엣지 케이스', () => {
    it('리뷰 카드는 탭으로 접근할 수 없다.', async () => {
      const user = userEvent.setup();

      render(<RecentReviewCard post={defaultPost} />);

      const link = screen.getByRole('link');
      await user.tab();

      expect(link).not.toHaveFocus();
    });

    it('전달된 제목이 없을 경우 이미지의 대체 텍스트가 "리뷰 이미지"로 표시된다.', () => {
      const noTitlePost = createMockRecentReviewCard({
        title: null,
      } as any);

      render(<RecentReviewCard post={noTitlePost} />);

      const img = screen.getByRole('img');

      expect(img).toHaveAttribute('alt', '리뷰 이미지');
    });
  });
});
