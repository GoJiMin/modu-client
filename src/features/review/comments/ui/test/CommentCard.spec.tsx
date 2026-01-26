import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentCard from '../CommentCard';
import {useDeleteReviewComment} from '@/entities/review';
import {commentStub, otherUserCommentStub, TEST_REVIEW_ID, TEST_USER_NICKNAME} from './stub';

jest.mock('@/entities/review');

const mockUseDeleteReviewComment = useDeleteReviewComment as jest.MockedFunction<typeof useDeleteReviewComment>;
const mockDeleteReviewComment = jest.fn();

describe('src/features/review/comments/ui/CommentCard.tsx', () => {
  const defaultProps = {
    comment: commentStub,
    userNickname: TEST_USER_NICKNAME,
    reviewId: TEST_REVIEW_ID,
    page: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    mockUseDeleteReviewComment.mockReturnValue({
      deleteReviewComment: mockDeleteReviewComment,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteReviewComment>);
  });

  afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      document.body.removeChild(modalRoot);
    }
  });

  describe('렌더링', () => {
    it('댓글 카드가 렌더링된다.', () => {
      render(<CommentCard {...defaultProps} />);

      expect(screen.getByText(commentStub.author_nickname)).toBeInTheDocument();
      expect(screen.getByText(commentStub.content)).toBeInTheDocument();
      expect(screen.getByText(`(${commentStub.created_at})`)).toBeInTheDocument();
    });

    it('프로필 이미지가 렌더링된다.', () => {
      render(<CommentCard {...defaultProps} />);

      expect(screen.getByAltText(`${commentStub.author_nickname}님의 프로필 이미지`)).toBeInTheDocument();
    });

    it('작성자 프로필 페이지로의 링크가 올바르다.', () => {
      render(<CommentCard {...defaultProps} />);

      const link = screen.getByRole('link', {name: commentStub.author_nickname});
      expect(link).toHaveAttribute('href', `/users/${commentStub.author_nickname}`);
    });
  });

  describe('삭제 버튼 표시', () => {
    it('작성자인 경우 삭제 버튼이 표시된다.', () => {
      render(<CommentCard {...defaultProps} />);

      expect(screen.getByLabelText('댓글 삭제', {selector: 'button'})).toBeInTheDocument();
    });

    it('작성자가 아닌 경우 삭제 버튼이 표시되지 않는다.', () => {
      render(<CommentCard {...defaultProps} comment={otherUserCommentStub} />);

      expect(screen.queryByLabelText('댓글 삭제', {selector: 'button'})).not.toBeInTheDocument();
    });

    it('로그인하지 않은 경우 삭제 버튼이 표시되지 않는다.', () => {
      render(<CommentCard {...defaultProps} userNickname={null} />);

      expect(screen.queryByLabelText('댓글 삭제', {selector: 'button'})).not.toBeInTheDocument();
    });
  });

  describe('댓글 삭제', () => {
    it('삭제 버튼 클릭 시 확인 모달이 열린다.', async () => {
      const user = userEvent.setup();
      render(<CommentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('댓글 삭제', {selector: 'button'});
      await user.click(deleteButton);

      expect(screen.getByText('정말 삭제하시겠어요?')).toBeInTheDocument();
    });

    it('모달에서 삭제 확인 시 삭제 요청한다.', async () => {
      const user = userEvent.setup();
      render(<CommentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('댓글 삭제', {selector: 'button'});
      await user.click(deleteButton);

      const confirmButton = screen.getByLabelText('삭제', {selector: 'button'});
      await user.click(confirmButton);

      expect(mockDeleteReviewComment).toHaveBeenCalledTimes(1);
      expect(mockDeleteReviewComment).toHaveBeenCalledWith({
        commentId: commentStub.id,
        reviewId: TEST_REVIEW_ID,
        page: 1,
      });
    });

    it('작성자가 아닌 경우 요청하지 않는다.', async () => {

    });

    it('모달에서 취소 시 삭제 요청이 호출되지 않는다.', async () => {
      const user = userEvent.setup();
      render(<CommentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('댓글 삭제', {selector: 'button'});
      await user.click(deleteButton);

      const cancelButton = screen.getByLabelText('취소', {selector: 'button'});
      await user.click(cancelButton);

      expect(mockDeleteReviewComment).not.toHaveBeenCalled();
    });

    it('삭제 중(isPending)일 때 삭제 버튼이 비활성화된다.', () => {
      mockUseDeleteReviewComment.mockReturnValue({
        deleteReviewComment: mockDeleteReviewComment,
        isPending: true,
      } as unknown as ReturnType<typeof useDeleteReviewComment>);

      render(<CommentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('댓글 삭제', {selector: 'button'});
      expect(deleteButton).toBeDisabled();
    });
  });
});
