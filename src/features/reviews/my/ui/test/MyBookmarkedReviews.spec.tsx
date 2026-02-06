import {Suspense} from 'react';
import {render, screen, waitForElementToBeRemoved, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import MyBookmarkedReviews from '../MyBookmarkedReviews';
import {createMockMyBookmarkedReviews, createMockReviewCard, TEST_USER_NICKNAME} from './stub';
import {useUserNickname} from '@/entities/auth';
import {deleteReview} from '@/entities/review/apis/api-service';
import {getMyBookmarkedReviews} from '@/entities/reviews/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/auth');
jest.mock('@/entities/review/apis/api-service');
jest.mock('@/entities/reviews/apis/api-service');

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockGetMyBookmarkedReviews = getMyBookmarkedReviews as jest.MockedFunction<typeof getMyBookmarkedReviews>;
const mockDeleteReview = deleteReview as jest.MockedFunction<typeof deleteReview>;

describe('src/features/reviews/my/ui/MyBookmarkedReviews.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    it('내가 저장한 후기 목록이 렌더링된다.', async () => {
      mockGetMyBookmarkedReviews.mockResolvedValue(createMockMyBookmarkedReviews(4));

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <MyBookmarkedReviews currentPage={1} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getAllByText(/내가 저장한 리뷰/)).toHaveLength(4);
      expect(screen.getByLabelText('pagination')).toBeInTheDocument();
    });

    it('아직 저장한 후기가 없다면 안내 문구와 작성하기 버튼이 표시된다.', async () => {
      mockGetMyBookmarkedReviews.mockResolvedValue(createMockMyBookmarkedReviews(0));

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <MyBookmarkedReviews currentPage={1} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getByText('아직 저장한 후기가 없어요.')).toBeInTheDocument();

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('후기 보러가기');
      expect(link).toHaveAttribute('href', '/search');
    });
  });

  describe('기능 테스트', () => {
    it('현재 조회하는 페이지의 데이터를 표시한다.', async () => {
      mockGetMyBookmarkedReviews.mockImplementation(page => {
        if (page === 1) {
          return Promise.resolve(createMockMyBookmarkedReviews(6, 1, 3));
        }

        return Promise.resolve(createMockMyBookmarkedReviews(4, 2, 3));
      });

      const {rerender} = render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <MyBookmarkedReviews currentPage={1} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(mockGetMyBookmarkedReviews).toHaveBeenCalledWith(1);
      expect(screen.getAllByText(/page: 1/)).toHaveLength(6);

      rerender(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <MyBookmarkedReviews currentPage={2} />
          </Suspense>,
        ),
      );

      expect(mockGetMyBookmarkedReviews).toHaveBeenCalledWith(2);
      expect(screen.getAllByText(/page: 2/)).toHaveLength(4);
    });

    it('현재 페이지의 앞/뒤 페이지 데이터를 미리 로드한다.', async () => {
      mockGetMyBookmarkedReviews.mockImplementation(page => {
        if (page === 1) {
          return Promise.resolve(createMockMyBookmarkedReviews(6, 1, 3));
        }

        if (page === 2) {
          return Promise.resolve(createMockMyBookmarkedReviews(6, 2, 3));
        }

        return Promise.resolve(createMockMyBookmarkedReviews(4, 3, 3));
      });

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <MyBookmarkedReviews currentPage={2} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(mockGetMyBookmarkedReviews).toHaveBeenCalledTimes(3);
      expect(mockGetMyBookmarkedReviews.mock.calls).toEqual([[2], [3], [1]]);
    });

    it('페이지네이션을 통해 현재 탭 내에서 페이지를 이동한다.', async () => {
      const user = userEvent.setup();

      mockGetMyBookmarkedReviews.mockResolvedValue(createMockMyBookmarkedReviews(3, 1, 3));
      mockRouter.push('/mypage?tabs=myBookmarks');

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <MyBookmarkedReviews currentPage={2} />
          </Suspense>,
        ),
        {
          wrapper: MemoryRouterProvider,
        },
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const pagination = screen.getByLabelText('pagination');

      const page2Button = within(pagination).getByText('2');
      await user.click(page2Button);

      expect(mockRouter.asPath).toBe('/mypage?tabs=myBookmarks&page=2');

      const page3Button = within(pagination).getByText('3');
      await user.click(page3Button);

      expect(mockRouter.asPath).toBe('/mypage?tabs=myBookmarks&page=3');
    });

    it('저장한 후기 중 내 게시글을 삭제할 수 있다.', async () => {
      const user = userEvent.setup();
      const removeTargetReview = createMockReviewCard({
        title: '삭제될 리뷰',
        author_nickname: TEST_USER_NICKNAME,
      });

      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
      mockGetMyBookmarkedReviews
        .mockResolvedValueOnce({
          results: [removeTargetReview],
          current_page: 1,
          total_pages: 1,
        })
        .mockResolvedValueOnce({
          results: [],
          current_page: 1,
          total_pages: 1,
        });
      mockDeleteReview.mockResolvedValue();

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <MyBookmarkedReviews currentPage={1} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const deleteButton = screen.getByRole('button', {name: `${removeTargetReview.title} 리뷰 삭제`});
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', {name: '삭제'});
      await user.click(confirmButton);

      await screen.findByText('아직 저장한 후기가 없어요.');
    });
  });
});
