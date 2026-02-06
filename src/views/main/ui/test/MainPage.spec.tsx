import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import MainPage from '../MainPage';
import {useIsLoggedIn} from '@/entities/auth';
import {BestReviewsResult, getBestReviews} from '@/entities/reviews';
import {ReviewCard} from '@/entities/review';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/auth');
jest.mock('@/entities/reviews');
// 이미 BestReviews에 대한 통합 테스트를 진행했기 때문에 모킹
jest.mock('@/features/reviews/best', () => ({
  BestReviews: ({reviews}: {reviews: BestReviewsResult}) => (
    <div>
      <p>BestReviews</p>
      <p>전체 후기: {reviews.all.count}</p>
    </div>
  ),
}));
// 이미 RecentReviews에 대한 통합 테스트를 진행했기 때문에 모킹
jest.mock('@/features/reviews/recent', () => ({
  RecentReviews: () => <div>RecentReviews</div>,
}));
// Framer Motion 모킹
// 애니메이션이 예쁘게 나오는지는 해당 라이브러리에서 검증할 차원이므로 단순히 정해진 문자열이 나오는지 확인
jest.mock('framer-motion', () => ({
  motion: {
    p: ({children}: {children: React.ReactNode}) => <p>{children}</p>,
  },
}));

const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;
const mockGetBestReviews = getBestReviews as jest.MockedFunction<typeof getBestReviews>;

const createMockReviewCard = (overrides: Partial<ReviewCard> = {}): ReviewCard => ({
  board_id: 1,
  title: '테스트 리뷰',
  author_nickname: 'testUser',
  category: 'food',
  preview: '테스트 미리보기',
  comments_count: 5,
  bookmarks: 10,
  image_url: 'https://example.com/image.jpg',
  ...overrides,
});

const createMockBestReviewsResult = (): BestReviewsResult => ({
  all: {
    count: 2,
    reviews: [
      createMockReviewCard({board_id: 1, title: '전체 리뷰 1'}),
      createMockReviewCard({board_id: 2, title: '전체 리뷰 2'}),
    ],
  },
  food: {
    count: 1,
    reviews: [createMockReviewCard({board_id: 3, title: '음식 리뷰 1', category: 'food'})],
  },
  car: {count: 0, reviews: []},
  cosmetic: {
    count: 3,
    reviews: Array.from({length: 3}, (_v, i) =>
      createMockReviewCard({board_id: i + 4, title: `화장품 리뷰 ${i + 1}`, category: 'cosmetic'}),
    ),
  },
  clothes: {count: 0, reviews: []},
  device: {count: 0, reviews: []},
  book: {count: 0, reviews: []},
  sports: {count: 0, reviews: []},
});

describe('src/views/main/ui/MainPage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetBestReviews.mockResolvedValue(createMockBestReviewsResult());
  });

  describe('렌더링 테스트', () => {
    it('메인 페이지가 렌더링된다.', async () => {
      render(await MainPage());

      // Hero
      expect(screen.getByText('내가 경험하지 못한 것을 누군가는 경험했습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '내 경험 공유하기'})).toBeInTheDocument();
      expect(screen.getByPlaceholderText('후기를 검색하세요')).toBeInTheDocument();

      // BestReviews
      expect(screen.getByText('BestReviews')).toBeInTheDocument();
      expect(screen.getByText('전체 후기: 2')).toBeInTheDocument();

      // RecentReviews
      expect(screen.getByText('RecentReviews')).toBeInTheDocument();

      // ContactUs
      expect(screen.getByText('항시 대기중')).toBeInTheDocument();
      expect(screen.getByRole('link', {name: 'Contact us'})).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    it("로그인 사용자가 '내 경험 공유하기' 버튼을 클릭하면 리뷰 작성 페이지로 이동한다.", async () => {
      const user = userEvent.setup();

      mockRouter.push('/');
      mockUseIsLoggedIn.mockReturnValue(true);

      render(await MainPage());

      await user.click(screen.getByRole('button', {name: '내 경험 공유하기'}));

      expect(mockRouter.asPath).toBe('/reviews/new');
    });

    it("로그인하지 않은 사용자가 '내 경험 공유하기' 버튼을 클릭하면 로그인 유도 모달을 표시한다.", async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(false);

      render(await MainPage());

      await user.click(screen.getByRole('button', {name: '내 경험 공유하기'}));

      expect(screen.getByText('로그인 후 이용 가능한 서비스입니다.'));
    });

    it('Contact us 버튼을 클릭하면 문의하기 페이지로 이동한다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/');

      render(await MainPage(), {wrapper: MemoryRouterProvider});

      await user.click(screen.getByRole('link', {name: 'Contact us'}));

      expect(mockRouter.asPath).toBe('/contact');
    });
  });
});
