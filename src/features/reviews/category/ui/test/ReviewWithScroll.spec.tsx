import {act, Suspense} from 'react';
import {render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import {mockIntersectionObserver} from 'jsdom-testing-mocks';
import ReviewsWithScroll from '../ReviewWithScroll';
import {Category, SearchReviewCard} from '@/entities/review';
import {CategoryReviewsResult} from '@/entities/reviews';
import {getCategoryReviews} from '@/entities/reviews/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/reviews/apis/api-service');

const mockGetCategoryReviews = getCategoryReviews as jest.MockedFunction<typeof getCategoryReviews>;

const createMockSearchReviewCard = (overrides: Partial<SearchReviewCard> = {}): SearchReviewCard => ({
  board_id: 1,
  title: '테스트 리뷰',
  author_nickname: 'testUser',
  category: 'food',
  preview: '테스트 미리보기',
  comments_count: 5,
  bookmarks: 10,
  image_url: 'https://example.com/image.jpg',
  created_at: '2026-01-25',
  ...overrides,
});

const createMockCategoryReviewsPage = (
  category: Category = 'all',
  reviewCount: number = 3,
  hasNext: boolean = false,
  startId: number = 1,
): CategoryReviewsResult => ({
  results: Array.from({length: reviewCount}, (_, idx) =>
    createMockSearchReviewCard({
      board_id: startId + idx,
      title: `리뷰 ${startId + idx}`,
      category,
    }),
  ),
  next_cursor: hasNext ? startId + reviewCount : null,
  has_next: hasNext,
});

const intersectionObserver = mockIntersectionObserver();

describe('src/features/reviews/category/ui/ReviewWithScroll.tsx', () => {
  describe('렌더링 테스트', () => {
    beforeEach(() => {
      mockGetCategoryReviews.mockImplementation((_cursor, categoryId) => {
        if (categoryId === 'food') {
          return Promise.resolve(createMockCategoryReviewsPage('food', 0));
        }

        return Promise.resolve(createMockCategoryReviewsPage('all', 5));
      });
    });

    it("'전체' 카테고리 리뷰 목록이 표시된다.", async () => {
      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewsWithScroll selectedCategory="all" sort="recent" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));
      expect(screen.getAllByText(/리뷰/)).toHaveLength(5);
    });

    it("'음식' 카테고리 리뷰 목록이 없어 문구가 표시된다.", async () => {
      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewsWithScroll selectedCategory="food" sort="recent" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getByText('아직 해당 카테고리에 리뷰가 등록되지 않았어요.')).toBeInTheDocument();
    });

    it('첫 페이지의 상위 3개 리뷰 이미지만 우선 로딩된다.', async () => {
      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewsWithScroll selectedCategory="all" sort="recent" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const img1 = screen.getByRole('img', {name: '리뷰 1 preview image'});
      const img2 = screen.getByRole('img', {name: '리뷰 2 preview image'});
      const img3 = screen.getByRole('img', {name: '리뷰 3 preview image'});

      for (const priorityImg of [img1, img2, img3]) {
        expect(priorityImg).toHaveAttribute('loading', 'eager');
      }

      const img4 = screen.getByRole('img', {name: '리뷰 4 preview image'});
      const img5 = screen.getByRole('img', {name: '리뷰 5 preview image'});

      for (const lazyImg of [img4, img5]) {
        expect(lazyImg).toHaveAttribute('loading', 'lazy');
      }
    });
  });

  describe('기능 테스트', () => {
    beforeEach(() => {
      mockGetCategoryReviews.mockImplementation(cursor => {
        if (cursor === 0) {
          return Promise.resolve(createMockCategoryReviewsPage('all', 8, true, 0));
        }

        if (cursor === 8) {
          return Promise.resolve(createMockCategoryReviewsPage('all', 8, true, 8));
        }

        return Promise.resolve(createMockCategoryReviewsPage('all', 6, false, 16));
      });
    });

    it('마지막 리뷰까지 스크롤하면 다음 리뷰 목록을 불러오고, 더 이상 불러올 리뷰가 없다면 종료 문구를 표시한다.', async () => {
      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewsWithScroll selectedCategory="all" sort="recent" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getAllByRole('listitem')).toHaveLength(8);

      const observer = screen.getByTestId('observer');

      act(() => {
        intersectionObserver.enterNode(observer);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(16);
      });

      act(() => {
        intersectionObserver.enterNode(observer);
      });

      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(22);
        expect(screen.getByText('더 이상 불러올 게시글이 없어요.')).toBeInTheDocument();
        expect(screen.getByText('다른 카테고리를 클릭해 리뷰를 확인해보세요!')).toBeInTheDocument();
      });
    });
  });
});
