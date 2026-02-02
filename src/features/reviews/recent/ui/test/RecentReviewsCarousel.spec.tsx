import {Suspense} from 'react';
import {render, screen, waitForElementToBeRemoved, within} from '@testing-library/react';
import RecentReviewsCarousel from '../RecentReviewsCarousel';
import {createMockRecentReviews} from './stub';
import {getRecentReviews} from '@/entities/reviews/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/reviews/apis/api-service');
jest.mock('../MultiCarousel', () => ({
  __esModule: true,
  default: ({children, rightToLeft = true}: {children: React.ReactNode; rightToLeft?: boolean}) => (
    <ul data-testid={rightToLeft ? 'main-carousel' : 'sub-carousel'}>{children}</ul>
  ),
}));

const mockGetRecentReviews = getRecentReviews as jest.MockedFunction<typeof getRecentReviews>;

describe('src/features/reviews/recent/ui/RecentReviewsCarousel.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('최근 등록된 후기가 캐러셀 형태로 렌더링된다.', async () => {
    mockGetRecentReviews.mockResolvedValue(createMockRecentReviews(6));

    render(
      withAllContext(
        <Suspense fallback={<div>loading</div>}>
          <RecentReviewsCarousel />
        </Suspense>,
      ),
    );

    await waitForElementToBeRemoved(screen.getByText('loading'));

    const mainCarousel = screen.getByTestId('main-carousel');
    const subCarousel = screen.getByTestId('sub-carousel');

    expect(within(mainCarousel).getAllByText(/리뷰 제목/)).toHaveLength(6);
    expect(within(subCarousel).getAllByText(/리뷰 제목/)).toHaveLength(6);
  });

  it('최근 등록된 후기가 없다면 문구가 표시된다.', async () => {
    mockGetRecentReviews.mockResolvedValue(createMockRecentReviews(0));

    render(
      withAllContext(
        <Suspense fallback={<div>loading</div>}>
          <RecentReviewsCarousel />
        </Suspense>,
      ),
    );

    await waitForElementToBeRemoved(screen.getByText('loading'));

    expect(screen.getByText('아직 등록된 후기가 없어요.')).toBeInTheDocument();
    expect(screen.queryByTestId('main-carousel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sub-carousel')).not.toBeInTheDocument();
  });
});
