import {render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import CategoryReviews from '../CategoryReviews';
import {SortKey} from '@/features/reviews/sorting';
import {Category, SearchReviewCard} from '@/entities/review';
import {CategoryReviewsResult} from '@/entities/reviews';
import {getCategoryReviews} from '@/entities/reviews/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/reviews/apis/api-service');
jest.mock('@/entities/reviews/ui/ReviewsLoading', () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockGetCategoryReviews = getCategoryReviews as jest.MockedFunction<typeof getCategoryReviews>;

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

const createMockCategoryReviewsPage = (
  category: Category = 'all',
  reviewCount: number = 3,
  sort: SortKey = 'recent',
  hasNext: boolean = false,
  startId: number = 1,
): CategoryReviewsResult => ({
  results: Array.from({length: reviewCount}, (_, idx) =>
    createMockSearchReviewCard({
      board_id: startId + idx,
      title: `${category} 리뷰 ${sort} ${startId + idx}`,
      category,
    }),
  ),
  next_cursor: hasNext ? startId + reviewCount : null,
  has_next: hasNext,
});

describe('src/features/reviews/category/ui/CategoryReviews.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    it('카테고리 검색 페이지가 렌더링된다.', async () => {
      mockGetCategoryReviews.mockResolvedValue(createMockCategoryReviewsPage('food'));
      render(withAllContext(<CategoryReviews />));

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('후기를 검색하세요')).toBeInTheDocument();
      expect(screen.getByText('최신순')).toBeInTheDocument();
      expect(screen.getAllByText(/food 리뷰/)).toHaveLength(3);
    });
  });

  describe('통합 테스트', () => {
    it("카테고리를 '음식'으로 바꾸면 음식 관련 리뷰를 표시한다.", async () => {
      const user = userEvent.setup();

      mockGetCategoryReviews.mockImplementation((_cursor, categoryId) => {
        if (categoryId === 'food') {
          return Promise.resolve(createMockCategoryReviewsPage('food', 3));
        }

        return Promise.resolve(createMockCategoryReviewsPage('all', 4));
      });
      mockRouter.push('/?categoryId=all&sort=recent');

      render(withAllContext(<CategoryReviews />));

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(mockGetCategoryReviews).toHaveBeenCalledWith(0, 'all', 'recent');

      await waitFor(() => {
        expect(screen.getAllByText(/all 리뷰/)).toHaveLength(4);
      });

      const foodCategoryButton = screen.getByRole('button', {name: '카테고리: 음식'});
      await user.click(foodCategoryButton);

      await waitFor(() => {
        expect(mockGetCategoryReviews).toHaveBeenLastCalledWith(0, 'food', 'recent');
        expect(screen.getAllByText(/food 리뷰/)).toHaveLength(3);
      });
    });

    it("정렬 옵션을 '북마크순'으로 바꾸면 리뷰를 북마크순으로 정렬한다.", async () => {
      const user = userEvent.setup();

      mockGetCategoryReviews.mockImplementation((_cursor, _categoryId, sort) => {
        if (sort === 'hotbookmarks') {
          return Promise.resolve(createMockCategoryReviewsPage('all', 3, sort));
        }

        return Promise.resolve(createMockCategoryReviewsPage('all', 3, 'recent'));
      });

      mockRouter.push('/?categoryId=all&sort=recent');

      render(withAllContext(<CategoryReviews />));

      await waitForElementToBeRemoved(screen.getByText('loading'));

      await waitFor(() => {
        expect(mockGetCategoryReviews).toHaveBeenCalledWith(0, 'all', 'recent');
        expect(screen.getAllByText(/all 리뷰 recent/)).toHaveLength(3);
      });

      const sortOptions = screen.getByRole('combobox');
      await user.click(sortOptions);

      const bookmarkSortOption = screen.getByText('북마크순');
      await user.click(bookmarkSortOption);

      await waitFor(() => {
        expect(mockGetCategoryReviews).toHaveBeenLastCalledWith(0, 'all', 'hotbookmarks');
        expect(screen.getAllByText(/all 리뷰 hotbookmarks/)).toHaveLength(3);
      });
    });

    it("검색창에 'macbook'을 검색하면 'macbook' 키워드 검색 페이지로 이동한다.", async () => {
      const user = userEvent.setup();

      mockGetCategoryReviews.mockResolvedValue(createMockCategoryReviewsPage());

      render(withAllContext(<CategoryReviews />));

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const searchBar = screen.getByPlaceholderText('후기를 검색하세요');
      await user.type(searchBar, 'macbook{enter}');

      expect(mockRouter.asPath).toBe('/search/macbook');
    });

    it('데이터 요청 중 에러가 발생하면 대체 UI를 표시한다.', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetCategoryReviews.mockRejectedValue({});

      render(withAllContext(<CategoryReviews />));

      await waitForElementToBeRemoved(screen.getByText('loading'));

      expect(screen.getByText('데이터를 가져오는 데 실패했어요.')).toBeInTheDocument();
    });
  });
});
