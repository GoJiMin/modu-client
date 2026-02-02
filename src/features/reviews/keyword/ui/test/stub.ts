import {SearchReviewCard} from '@/entities/review';
import {KeywordReviewsResult} from '@/entities/reviews';
import {SortKey} from '@/features/reviews/sorting';

export const TEST_KEYWORD = '테스트';
export const TEST_SORT: SortKey = 'recent';
export const TEST_PAGE = 1;

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

export const createMockKeywordReviewsResult = (
  keyword: string,
  reviewCount: number = 3,
  currentPage: number = 1,
  totalPages: number = 1,
): KeywordReviewsResult => ({
  results: Array.from({length: reviewCount}, (_, idx) =>
    createMockSearchReviewCard({
      board_id: idx + 1,
      title: `${keyword} 검색 리뷰 page: ${currentPage}`,
    }),
  ),
  current_page: currentPage,
  total_pages: totalPages,
});
