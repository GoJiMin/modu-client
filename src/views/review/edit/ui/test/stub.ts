import {ReviewDetail} from '@/entities/review';

export const TEST_USER_NICKNAME = 'jimin';
export const TEST_OTHER_USER_NICKNAME = 'other-user';
export const TEST_PROFILE_IMG_URL = 'https://cdn.com/profile_img.png';

export function createReviewDetail(overrides: Partial<ReviewDetail> = {}): ReviewDetail {
  return {
    board_id: 5,
    title: '테스트 제목',
    category: 'book',
    author_nickname: TEST_USER_NICKNAME,
    created_at: '2026-02-03 16시 42분',
    content: '<div>테스트 내용</div>',
    profile_image: TEST_PROFILE_IMG_URL,
    ...overrides,
  };
}
