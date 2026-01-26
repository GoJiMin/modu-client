import {Category, Comment, ReviewComments} from '@/entities/review';

export const TEST_REVIEW_ID = 123;
export const TEST_USER_NICKNAME = 'testUser';
export const TEST_CATEGORY: Category = 'food';

export const commentStub: Comment = {
  id: 1,
  profile_image: 'https://example.com/profile.jpg',
  author_nickname: TEST_USER_NICKNAME,
  content: '테스트 댓글 내용입니다.',
  created_at: '2026-01-24',
};

export const otherUserCommentStub: Comment = {
  id: 2,
  profile_image: 'https://example.com/other-profile.jpg',
  author_nickname: 'otherUser',
  content: '다른 사용자의 댓글입니다.',
  created_at: '2026-01-23',
};

export const commentsListStub: Comment[] = [
  commentStub,
  otherUserCommentStub,
  {
    id: 3,
    profile_image: 'https://example.com/third.jpg',
    author_nickname: 'thirdUser',
    content: '세 번째 댓글입니다.',
    created_at: '2026-01-22',
  },
];

export const reviewCommentsStub: ReviewComments = {
  comments_count: 3,
  comments: commentsListStub,
  current_page: 1,
  total_pages: 1,
};

export const emptyReviewCommentsStub: ReviewComments = {
  comments_count: 0,
  comments: [],
  current_page: 1,
  total_pages: 0,
};

export const multiPageReviewCommentsStub: ReviewComments = {
  comments_count: 20,
  comments: commentsListStub,
  current_page: 1,
  total_pages: 3,
};
