import {Category, SearchReviewCard} from '@/entities/review';
import {CategoryReviewsResult} from '@/entities/reviews';
import {SortKey} from '@/features/reviews/sorting';

export const TEST_CATEGORY: Category = 'food';
export const TEST_SORT: SortKey = 'recent';

export const createMockSearchReviewCard = (overrides: Partial<SearchReviewCard> = {}): SearchReviewCard => ({
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

export const createMockCategoryReviewsPage = (
  reviewCount: number = 3,
  hasNext: boolean = false,
  startId: number = 1,
): CategoryReviewsResult => ({
  results: Array.from({length: reviewCount}, (_, idx) =>
    createMockSearchReviewCard({
      board_id: startId + idx,
      title: `리뷰 ${startId + idx}`,
    }),
  ),
  next_cursor: hasNext ? startId + reviewCount : null,
  has_next: hasNext,
});

export const createMockInfiniteQueryData = (pageCount: number = 2, reviewsPerPage: number = 3) => ({
  pages: Array.from({length: pageCount}, (_, pageIdx) =>
    createMockCategoryReviewsPage(reviewsPerPage, pageIdx < pageCount - 1, pageIdx * reviewsPerPage + 1),
  ),
  pageParams: Array.from({length: pageCount}, (_, idx) => idx),
});

export const emptyReviewsResult: CategoryReviewsResult = {
  results: [],
  next_cursor: null,
  has_next: false,
};

export const emptyInfiniteQueryData = {
  pages: [emptyReviewsResult],
  pageParams: [0],
};
