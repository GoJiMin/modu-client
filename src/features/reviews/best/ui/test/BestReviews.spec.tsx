import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import BestReviews from '../BestReviews';
import {ReviewCard} from '@/entities/review';
import {BestReviewsResult} from '@/entities/reviews';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({src, alt, priority}: {src: string; alt: string; priority: string}) => (
    <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} />
  ),
}));

const createMockReviewCard = (overrides: Partial<ReviewCard> = {}): ReviewCard => ({
  board_id: 1,
  title: '테스트 리뷰',
  author_nickname: 'testUser',
  category: 'food',
  preview: '테스트 미리보기',
  comments_count: 5,
  bookmarks: 10,
  image_url: 'https://example.com/image.jpg',
  ...overrides,
});

const createMockBestReviewsResult = (): BestReviewsResult => ({
  all: {
    count: 2,
    reviews: [
      createMockReviewCard({board_id: 1, title: '전체 리뷰 1'}),
      createMockReviewCard({board_id: 2, title: '전체 리뷰 2'}),
    ],
  },
  food: {
    count: 1,
    reviews: [createMockReviewCard({board_id: 3, title: '음식 리뷰 1', category: 'food'})],
  },
  car: {count: 0, reviews: []},
  cosmetic: {
    count: 3,
    reviews: Array.from({length: 3}, (_v, i) =>
      createMockReviewCard({board_id: i + 4, title: `화장품 리뷰 ${i + 1}`, category: 'cosmetic'}),
    ),
  },
  clothes: {count: 0, reviews: []},
  device: {count: 0, reviews: []},
  book: {count: 0, reviews: []},
  sports: {count: 0, reviews: []},
});

describe('src/features/reviews/best/ui/BestReviews.tsx', () => {
  describe('렌더링 테스트', () => {
    it('컴포넌트가 렌더링된다.', () => {
      render(<BestReviews reviews={createMockBestReviewsResult()} />);

      const lists = screen.getAllByRole('list');

      const categoryBar = lists[0];
      const reviewList = lists[1];

      expect(screen.getByText('실시간 베스트 후기')).toBeInTheDocument();
      expect(within(categoryBar).queryAllByRole('listitem')).toHaveLength(8);
      expect(within(reviewList).queryAllByRole('listitem')).toHaveLength(2);
    });

    it('첫 렌더링 시 전체 후기 목록을 표시한다.', () => {
      render(<BestReviews reviews={createMockBestReviewsResult()} />);

      const initialCategoryButton = screen.getByLabelText('카테고리: 전체');
      expect(initialCategoryButton).toHaveAttribute('aria-selected');

      expect(screen.getByText('전체 리뷰 1')).toBeInTheDocument();
      expect(screen.getByText('전체 리뷰 2')).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    it('음식 카테고리 클릭 후 화장품 카테고리를 클릭하면 음식 리뷰 1개와 화장품 리뷰 3개를 표시한다.', async () => {
      const user = userEvent.setup();

      render(<BestReviews reviews={createMockBestReviewsResult()} />);

      const lists = screen.getAllByRole('list');
      const reviewList = lists[1];

      // 초기 전체 목록 2개
      expect(within(reviewList).getAllByRole('listitem')).toHaveLength(2);

      const foodCategoryButton = screen.getByLabelText('카테고리: 음식');
      await user.click(foodCategoryButton);

      // 음식 목록 1개
      expect(foodCategoryButton).toHaveAttribute('aria-selected');
      expect(within(reviewList).getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('음식 리뷰 1')).toBeInTheDocument();

      const cosmeticCategoryButton = screen.getByLabelText('카테고리: 화장품');
      await user.click(cosmeticCategoryButton);

      // 화장품 목록 3개
      expect(cosmeticCategoryButton).toHaveAttribute('aria-selected');
      expect(within(reviewList).getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText('화장품 리뷰 1')).toBeInTheDocument();
      expect(screen.getByText('화장품 리뷰 3')).toBeInTheDocument();
    });

    it('자동차 카테고리를 클릭하면 후기가 없다는 문구를 표시한다.', async () => {
      const user = userEvent.setup();

      render(<BestReviews reviews={createMockBestReviewsResult()} />);

      const carCategoryButton = screen.getByLabelText('카테고리: 자동차');
      await user.click(carCategoryButton);

      expect(carCategoryButton).toHaveAttribute('aria-selected');
      expect(screen.getByText('해당 카테고리는 아직 베스트 후기가 없어요.')).toBeInTheDocument();
    });

    it('리뷰 카드를 클릭하면 해당 리뷰 페이지로 이동한다.', async () => {
      const user = userEvent.setup();
      const reviews = createMockBestReviewsResult();

      render(<BestReviews reviews={reviews} />, {wrapper: MemoryRouterProvider});

      const card = screen.getByText('전체 리뷰 1');
      await user.click(card);

      expect(mockRouter.asPath).toBe(`/reviews/${reviews.all.reviews[0].board_id}`);
    });
  });
});
