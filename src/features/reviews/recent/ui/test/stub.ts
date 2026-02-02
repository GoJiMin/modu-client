import {ReviewCard} from '@/entities/review';
import {RecentReviews} from '@/entities/reviews';

export const TEST_USER_NICKNAME = 'testUser';
export const TEST_OTHER_USER_NICKNAME = 'otherUser';

export const createMockRecentReviewCard = (overrides: Partial<ReviewCard> = {}): ReviewCard => ({
  board_id: 1,
  title: '테스트 리뷰 제목',
  author_nickname: TEST_USER_NICKNAME,
  category: 'food' as const,
  preview: '리뷰 미리보기 텍스트입니다.',
  comments_count: 5,
  bookmarks: 10,
  image_url: 'https://example.com/image.jpg',
  ...overrides,
});

export const createMockRecentReviews = (count = 6): RecentReviews => ({
  latest_reviews: Array.from({length: count}, (_, i) =>
    createMockRecentReviewCard({
      board_id: i,
      title: `리뷰 제목 ${i}`,
      preview: `리뷰 미리보기 ${i}`,
    }),
  ),
});

export const emptyRecentReviews: RecentReviews = {
  latest_reviews: [],
};
