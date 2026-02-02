import {Suspense} from 'react';
import {render, screen, waitFor, waitForElementToBeRemoved, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {createDynamicRouteParser} from 'next-router-mock/dynamic-routes';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import ReviewWithPagination from '../ReviewWithPagination';
import {getKeywordReviews} from '@/entities/reviews/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import {createMockKeywordReviewsResult} from './stub';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/reviews/apis/api-service');

const mockGetKeywordReviews = getKeywordReviews as jest.MockedFunction<typeof getKeywordReviews>;

describe('src/features/reviews/keyword/ui/ReviewWithPagination.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
    mockRouter.useParser(createDynamicRouteParser(['/search/[keyword]']));
  });

  describe('렌더링 테스트', () => {
    it('검색어에 대한 리뷰 목록이 렌더링된다.', async () => {
      mockRouter.push('/search/pizza');
      mockGetKeywordReviews.mockImplementation(keyword => Promise.resolve(createMockKeywordReviewsResult(keyword, 3)));

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewWithPagination sort="recent" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(mockGetKeywordReviews).toHaveBeenCalledWith('pizza', 1, 'recent');

      expect(screen.getAllByText(/pizza 검색 리뷰/)).toHaveLength(3);
      expect(screen.getByLabelText('pagination')).toBeInTheDocument();
    });

    it('검색 결과가 없다면 안내 문구를 표시한다.', async () => {
      mockRouter.push('/search/햄버거');
      mockGetKeywordReviews.mockImplementation(keyword => Promise.resolve(createMockKeywordReviewsResult(keyword, 0)));

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewWithPagination sort="recent" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getByText('햄버거에 대한 검색 결과가 없어요.')).toBeInTheDocument();
      expect(screen.queryByText('pagination')).not.toBeInTheDocument();
    });
  });

  describe('기능 테스트', () => {
    beforeEach(() => {
      mockGetKeywordReviews.mockImplementation((keyword, page) => {
        if (page === 1) {
          return Promise.resolve(createMockKeywordReviewsResult(keyword, 6, page, 3));
        }

        if (page === 2) {
          return Promise.resolve(createMockKeywordReviewsResult(keyword, 6, page, 3));
        }

        return Promise.resolve(createMockKeywordReviewsResult(keyword, 5, page, 3));
      });
    });

    it('현재 페이지의 앞/뒤 페이지 데이터를 미리 불러온다.', async () => {
      mockRouter.push('/search/pizza?page=2&sort=recent');

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewWithPagination sort="recent" />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(mockGetKeywordReviews).toHaveBeenCalledTimes(3);
      expect(mockGetKeywordReviews.mock.calls).toEqual([
        ['pizza', 2, 'recent'],
        ['pizza', 3, 'recent'],
        ['pizza', 1, 'recent'],
      ]);
    });

    it('총 3페이지의 검색 결과 중 1페이지 조회 후 3페이지까지 차례로 조회한다.', async () => {
      mockRouter.push('/search/pizza?page=1');
      const user = userEvent.setup();

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <ReviewWithPagination sort="recent" />
          </Suspense>,
        ),
        {
          wrapper: MemoryRouterProvider,
        },
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getAllByText(/page: 1/)).toHaveLength(6);

      const pagination = screen.getByLabelText('pagination');

      const page2Button = within(pagination).getByText('2');
      await user.click(page2Button);

      await waitFor(() => {
        expect(mockRouter.asPath).toBe('/search/pizza?page=2&sort=recent');
        expect(screen.getAllByText(/page: 2/)).toHaveLength(6);
      });

      const page3Button = within(pagination).getByText('3');
      await user.click(page3Button);

      await waitFor(() => {
        expect(mockRouter.asPath).toBe('/search/pizza?page=3&sort=recent');
        expect(screen.getAllByText(/page: 3/)).toHaveLength(5);
      });
    });
  });
});
