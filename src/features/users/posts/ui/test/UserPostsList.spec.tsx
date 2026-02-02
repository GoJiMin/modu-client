import {Suspense} from 'react';
import {act, render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {mockIntersectionObserver} from 'jsdom-testing-mocks';
import mockRouter from 'next-router-mock';
import UserPostsList from '../UserPostsList';
import {getPostsByUser} from '@/entities/users';
import {PostsByUserResult} from '@/entities/users/model/types';
import {SearchReviewCard} from '@/entities/review';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/users/apis/api-service');
jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

const mockGetPostsByUser = getPostsByUser as jest.MockedFunction<typeof getPostsByUser>;

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

const createMockPostsByUserReviews = (
  userNickname: string,
  reviewCount: number = 3,
  totalResults: number = 3,
  hasNext: boolean = false,
  startId: number = 1,
): PostsByUserResult => ({
  results: Array.from({length: reviewCount}, (_, idx) =>
    createMockSearchReviewCard({
      board_id: startId + idx,
      title: `${userNickname}의 리뷰`,
    }),
  ),
  next_cursor: hasNext ? startId + reviewCount : null,
  has_next: hasNext,
  total_results: totalResults,
});

const intersectionObserver = mockIntersectionObserver();

describe('src/features/users/posts/ui/UserPostsList.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    it('특정 사용자가 작성한 게시글 목록이 렌더링된다.', async () => {
      mockGetPostsByUser.mockImplementation((_cursor, userNickname) => {
        return Promise.resolve(createMockPostsByUserReviews(userNickname, 3, 3));
      });

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <UserPostsList userNickname="jimin" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getByRole('heading', {level: 3})).toHaveTextContent('작성된 게시글 수 (3)');

      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.queryByTestId('observer')).not.toBeInTheDocument();
    });

    it('특정 사용자가 작성한 게시글이 없을 경우 문구가 표시된다.', async () => {
      mockGetPostsByUser.mockResolvedValue(createMockPostsByUserReviews('jimin', 0, 0));

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <UserPostsList userNickname="jimin" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      await screen.findByText('아직 jimin님의 게시글이 등록되지 않았어요.');
    });
  });

  describe('기능 테스트', () => {
    beforeEach(() => {
      mockGetPostsByUser.mockImplementation((cursor, userNickname) => {
        if (cursor === 0) {
          return Promise.resolve(createMockPostsByUserReviews(userNickname, 6, 16, true, 0));
        }

        if (cursor === 6) {
          return Promise.resolve(createMockPostsByUserReviews(userNickname, 6, 16, true, 6));
        }

        return Promise.resolve(createMockPostsByUserReviews(userNickname, 4, 16, false, 12));
      });
    });

    it('마지막 리뷰까지 스크롤하면 다음 리뷰 목록을 불러오고, 더 이상 불러올 리뷰가 없다면 종료 문구를 표시한다.', async () => {
      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <UserPostsList userNickname="jimin" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(mockGetPostsByUser).toHaveBeenCalledTimes(1);
      expect(mockGetPostsByUser).toHaveBeenCalledWith(0, 'jimin', 'recent');
      expect(screen.getAllByRole('listitem')).toHaveLength(6);

      const observer = screen.getByTestId('observer');

      act(() => {
        intersectionObserver.enterNode(observer);
      });

      await waitFor(() => {
        expect(mockGetPostsByUser).toHaveBeenCalledTimes(2);
        expect(mockGetPostsByUser).toHaveBeenCalledWith(6, 'jimin', 'recent');
        expect(screen.getAllByRole('listitem')).toHaveLength(12);
      });

      act(() => {
        intersectionObserver.enterNode(observer);
      });

      await waitFor(() => {
        expect(mockGetPostsByUser).toHaveBeenCalledTimes(3);
        expect(mockGetPostsByUser).toHaveBeenCalledWith(12, 'jimin', 'recent');
        expect(screen.getAllByRole('listitem')).toHaveLength(16);
      });

      await screen.findByText('더 이상 불러올 게시글이 없어요.');
    });

    it('스크롤 후 정렬 옵션을 변경하면 데이터를 새로 불러온다.', async () => {
      const user = userEvent.setup();
      mockRouter.push('/?sort=recent');

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <UserPostsList userNickname="jimin" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(mockGetPostsByUser).toHaveBeenCalledWith(0, 'jimin', 'recent');
      expect(screen.getAllByRole('listitem')).toHaveLength(6);

      const observer = screen.getByTestId('observer');

      act(() => {
        intersectionObserver.enterNode(observer);
      });

      await waitFor(() => {
        expect(mockGetPostsByUser).toHaveBeenCalledWith(6, 'jimin', 'recent');
        expect(screen.getAllByRole('listitem')).toHaveLength(12);
      });

      const commentSortOption = screen.getByRole('button', {name: '댓글순'});
      await user.click(commentSortOption);

      await waitFor(() => {
        expect(mockRouter.asPath).toBe('/?sort=hotcomments');
        expect(mockGetPostsByUser).toHaveBeenLastCalledWith(0, 'jimin', 'hotcomments');
        expect(screen.getAllByRole('listitem')).toHaveLength(6);
      });
    });
  });
});
