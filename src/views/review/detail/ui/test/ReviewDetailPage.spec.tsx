import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {notFound} from 'next/navigation';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import ReviewDetailPage, {generateMetadata} from '../ReviewDetailPage';
import {ReviewDetail} from '@/entities/review';
import {deleteReview, getReviewDetail} from '@/entities/review/apis/api-service';
import getSessionUserNickname from '@/shared/lib/utils/getSessionUserNickname';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/review/apis/api-service');
jest.mock('@/shared/lib/utils/getSessionUserNickname');
jest.mock('../ReviewDetailInteractive', () => ({
  __esModule: true,
  default: () => <div></div>,
}));
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next-router-mock/navigation'),
  notFound: jest.fn(),
}));

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;
const mockGetReviewDetail = getReviewDetail as jest.MockedFunction<typeof getReviewDetail>;
const mockGetSessionUserNickname = getSessionUserNickname as jest.MockedFunction<typeof getSessionUserNickname>;
const mockDeleteReview = deleteReview as jest.MockedFunction<typeof deleteReview>;

const TEST_USER_NICKNAME = 'jimin';
const TEST_OTHER_USER_NICKNAME = 'other-user';
const TEST_PROFILE_IMG_URL = 'https://cdn.com/profile_img.png';

function createReviewDetail(overrides: Partial<ReviewDetail> = {}): ReviewDetail {
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

describe('src/views/review/detail/ui/ReviewDetailPage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    const reviewDetailStub = createReviewDetail({board_id: 5});

    beforeEach(() => {
      mockGetReviewDetail.mockImplementation(reviewId => {
        if (reviewId === 5) {
          return Promise.resolve(reviewDetailStub);
        }

        return Promise.resolve(null);
      });
    });

    it('게시글 상세 페이지가 렌더링된다.', async () => {
      render(await ReviewDetailPage({params: Promise.resolve({reviewId: '5'})}));

      expect(screen.getByText(reviewDetailStub.title)).toBeInTheDocument();
      expect(screen.getByText(reviewDetailStub.author_nickname)).toBeInTheDocument();
      expect(screen.getByText(reviewDetailStub.created_at)).toBeInTheDocument();
      expect(screen.getByText('테스트 내용')).toBeInTheDocument();
    });

    it('작성자인 경우 수정 및 삭제 버튼이 표시된다.', async () => {
      mockGetSessionUserNickname.mockResolvedValue(TEST_USER_NICKNAME);

      render(await ReviewDetailPage({params: Promise.resolve({reviewId: '5'})}), {
        wrapper: ({children}) => withAllContext(children),
      });

      expect(screen.getByRole('link', {name: '리뷰 수정'})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '리뷰 삭제'})).toBeInTheDocument();
    });

    it('작성자가 아닌 경우 수정 및 삭제 버튼이 표시되지 않는다.', async () => {
      mockGetSessionUserNickname.mockResolvedValue(TEST_OTHER_USER_NICKNAME);

      render(await ReviewDetailPage({params: Promise.resolve({reviewId: '5'})}), {
        wrapper: ({children}) => withAllContext(children),
      });

      expect(screen.queryByRole('link', {name: '리뷰 수정'})).not.toBeInTheDocument();
      expect(screen.queryByRole('button', {name: '리뷰 삭제'})).not.toBeInTheDocument();
    });

    it('리뷰가 존재하지 않을 경우 에러 페이지를 표시한다.', async () => {
      mockNotFound.mockImplementation(() => {
        throw new Error('NOT_FOUND');
      });

      await expect(ReviewDetailPage({params: Promise.resolve({reviewId: '6'})})).rejects.toThrow('NOT_FOUND');

      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('통합 테스트', () => {
    const reviewDetailStub = createReviewDetail({board_id: 5});

    beforeEach(() => {
      mockGetReviewDetail.mockImplementation(reviewId => {
        if (reviewId === 5) {
          return Promise.resolve(reviewDetailStub);
        }

        return Promise.resolve(null);
      });

      mockGetSessionUserNickname.mockResolvedValue(TEST_USER_NICKNAME);
    });

    it('리뷰 수정 버튼을 클릭해 게시글 수정 페이지로 이동한다.', async () => {
      const user = userEvent.setup();

      render(await ReviewDetailPage({params: Promise.resolve({reviewId: '5'})}), {
        wrapper: ({children}) => <MemoryRouterProvider>{withAllContext(children)}</MemoryRouterProvider>,
      });

      await user.click(screen.getByRole('link', {name: '리뷰 수정'}));

      expect(mockRouter.asPath).toBe(`/reviews/${reviewDetailStub.board_id}/edit`);
    });

    it('리뷰 삭제 버튼을 클릭해 게시글을 삭제할 수 있다.', async () => {
      const user = userEvent.setup();

      let resolveDeleteReview: any;
      mockDeleteReview.mockImplementation(() => {
        return new Promise(resolve => {
          resolveDeleteReview = resolve;
        });
      });

      render(await ReviewDetailPage({params: Promise.resolve({reviewId: '5'})}), {
        wrapper: ({children}) => <MemoryRouterProvider>{withAllContext(children)}</MemoryRouterProvider>,
      });

      await user.click(screen.getByRole('button', {name: '리뷰 삭제'}));
      await user.click(screen.getByRole('button', {name: '삭제'}));

      await waitFor(() => {
        expect(screen.getByText('리뷰를 삭제 중이에요.')).toBeInTheDocument();
      });

      resolveDeleteReview();

      await waitFor(() => {
        expect(mockRouter.asPath).toBe('/search');
      });
    });
  });

  describe('메타데이터 테스트', () => {
    it('전달된 게시글 번호에 해당하는 데이터를 요청해 동적으로 메타데이터를 생성할 수 있다.', async () => {
      const reviewDetailStub = createReviewDetail({board_id: 5});

      mockGetReviewDetail.mockImplementation(reviewId => {
        if (reviewId === 5) {
          return Promise.resolve(reviewDetailStub);
        }

        return Promise.resolve(null);
      });

      const params = Promise.resolve({reviewId: '5'});
      const metadata = await generateMetadata({params});

      expect(metadata?.title).toBe(reviewDetailStub.title);
      expect(metadata?.description).toBe(`${reviewDetailStub.title}에 대한 자세한 후기를 확인해보세요.`);
      expect(metadata?.openGraph.title).toBe(reviewDetailStub.title);
    });
  });
});
