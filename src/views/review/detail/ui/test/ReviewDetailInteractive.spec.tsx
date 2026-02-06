import {render, screen} from '@testing-library/react';
import ReviewDetailInteractive from '../ReviewDetailInteractive';
import {getReviewBookmarks, getReviewComments} from '@/entities/review/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/review/apis/api-service');

const mockGetReviewBookmarks = getReviewBookmarks as jest.MockedFunction<typeof getReviewBookmarks>;
const mockGetReviewComments = getReviewComments as jest.MockedFunction<typeof getReviewComments>;

describe('src/views/review/detail/ui/ReviewDetailInteractive.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetReviewBookmarks.mockResolvedValue({bookmarks: 3, hasBookmarked: false});
    mockGetReviewComments.mockResolvedValue({comments: [], comments_count: 0, current_page: 1, total_pages: 1});
  });

  describe('렌더링 테스트', () => {
    it('게시글의 북마크, 댓글 영역이 렌더링된다.', async () => {
      render(withAllContext(<ReviewDetailInteractive category="book" reviewId={5} />));

      // 북마크 영역
      expect(await screen.findByRole('button', {name: '북마크 추가하기'})).toBeInTheDocument();

      // 댓글 영역
      expect(await screen.findByPlaceholderText('로그인 후 댓글을 작성할 수 있어요.')).toBeInTheDocument();
      expect(screen.getByRole('heading', {level: 2, name: '댓글쓰기 0'}));
    });

    it('데이터 요청 중 에러가 발생하면 각 영역에 대체 UI가 표시된다.', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetReviewBookmarks.mockImplementation(() => {
        throw new Error('북마크 요청 에러');
      });
      mockGetReviewComments.mockImplementation(() => {
        throw new Error('댓글 요청 에러');
      });

      render(withAllContext(<ReviewDetailInteractive category="book" reviewId={5} />));

      expect(await screen.findByText('실패 이유: 북마크 요청 에러')).toBeInTheDocument();
      expect(await screen.findByText('실패 이유: 댓글 요청 에러')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('기능 테스트', () => {
    it('로그인 하지 않은 사용자가 북마크, 댓글 영역을 클릭하면 로그인 유도 모달을 표시한다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<ReviewDetailInteractive category="book" reviewId={5} />));

      const bookmarkButton = await screen.findByRole('button', {name: '북마크 추가하기'});
      const commentInput = await screen.findByPlaceholderText('로그인 후 댓글을 작성할 수 있어요.');

      await user.click(bookmarkButton);

      expect(screen.getByText('로그인 후 이용 가능한 서비스입니다.')).toBeInTheDocument();

      await user.click(screen.getByRole('button', {name: '닫기'}));

      await user.click(commentInput);

      expect(screen.getByText('로그인 후 이용 가능한 서비스입니다.')).toBeInTheDocument();
    });
  });
});
