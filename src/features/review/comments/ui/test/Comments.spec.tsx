import {render, screen} from '@testing-library/react';
import Comments from '../Comments';
import {useGetReviewComments, usePostReviewComment, useDeleteReviewComment} from '@/entities/review';
import {useUserNickname} from '@/entities/auth';
import {
  reviewCommentsStub,
  emptyReviewCommentsStub,
  TEST_REVIEW_ID,
  TEST_CATEGORY,
  TEST_USER_NICKNAME,
} from './stub';

const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/entities/review');
jest.mock('@/entities/auth');

const mockUseGetReviewComments = useGetReviewComments as jest.MockedFunction<typeof useGetReviewComments>;
const mockUsePostReviewComment = usePostReviewComment as jest.MockedFunction<typeof usePostReviewComment>;
const mockUseDeleteReviewComment = useDeleteReviewComment as jest.MockedFunction<typeof useDeleteReviewComment>;
const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockOpenLoginModal = jest.fn();

describe('src/features/review/comments/ui/Comments.tsx', () => {
  const defaultProps = {
    reviewId: TEST_REVIEW_ID,
    category: TEST_CATEGORY,
    openLoginModal: mockOpenLoginModal,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('page');

    mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
    mockUsePostReviewComment.mockReturnValue({
      postComment: jest.fn(),
    } as unknown as ReturnType<typeof usePostReviewComment>);
    mockUseDeleteReviewComment.mockReturnValue({
      deleteReviewComment: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteReviewComment>);

    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      document.body.removeChild(modalRoot);
    }
  });

  describe('렌더링', () => {
    it('컴포넌트가 렌더링된다.', () => {
      mockUseGetReviewComments.mockReturnValue(reviewCommentsStub);

      render(<Comments {...defaultProps} />);

      expect(screen.getByText('댓글쓰기')).toBeInTheDocument();
    });

    it('댓글 개수가 표시된다.', () => {
      mockUseGetReviewComments.mockReturnValue(reviewCommentsStub);

      render(<Comments {...defaultProps} />);

      expect(screen.getByText(reviewCommentsStub.comments_count.toString())).toBeInTheDocument();
    });

    it('CommentsInput 컴포넌트가 렌더링된다.', () => {
      mockUseGetReviewComments.mockReturnValue(reviewCommentsStub);

      render(<Comments {...defaultProps} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('댓글 목록 표시', () => {
    it('댓글이 있으면 CommentsList가 렌더링된다.', () => {
      mockUseGetReviewComments.mockReturnValue(reviewCommentsStub);

      render(<Comments {...defaultProps} />);

      reviewCommentsStub.comments.forEach(comment => {
        expect(screen.getByText(comment.content)).toBeInTheDocument();
      });
    });

    it('댓글이 없고 total_pages가 0이면 CommentsList가 렌더링되지 않는다.', () => {
      mockUseGetReviewComments.mockReturnValue(emptyReviewCommentsStub);

      render(<Comments {...defaultProps} />);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('페이지 파라미터', () => {
    it('URL의 page 파라미터를 올바르게 추출한다.', () => {
      mockSearchParams.set('page', '2');
      mockUseGetReviewComments.mockReturnValue(reviewCommentsStub);

      render(<Comments {...defaultProps} />);

      expect(mockUseGetReviewComments).toHaveBeenCalledWith(TEST_REVIEW_ID, 2);
    });

    it('page 파라미터가 없으면 기본값 1을 사용한다.', () => {
      mockUseGetReviewComments.mockReturnValue(reviewCommentsStub);

      render(<Comments {...defaultProps} />);

      expect(mockUseGetReviewComments).toHaveBeenCalledWith(TEST_REVIEW_ID, 1);
    });

    it('page 파라미터가 유효하지 않은 값이면 기본값 1을 사용한다.', () => {
      mockSearchParams.set('page', 'invalid');
      mockUseGetReviewComments.mockReturnValue(reviewCommentsStub);

      render(<Comments {...defaultProps} />);

      expect(mockUseGetReviewComments).toHaveBeenCalledWith(TEST_REVIEW_ID, 1);
    });
  });
});
