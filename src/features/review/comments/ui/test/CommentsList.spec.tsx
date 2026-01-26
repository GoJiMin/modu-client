import {render, screen, within} from '@testing-library/react';
import CommentsList from '../CommentsList';
import {useUserNickname} from '@/entities/auth';
import {useDeleteReviewComment} from '@/entities/review';
import {commentsListStub, TEST_REVIEW_ID, TEST_USER_NICKNAME} from './stub';

jest.mock('@/entities/auth');
jest.mock('@/entities/review');

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockUseDeleteReviewComment = useDeleteReviewComment as jest.MockedFunction<typeof useDeleteReviewComment>;

describe('src/features/review/comments/ui/CommentsList.tsx', () => {
  const defaultProps = {
    comments: commentsListStub,
    currentPage: 1,
    totalPages: 3,
    reviewId: TEST_REVIEW_ID,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
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
    it('댓글 목록이 렌더링된다.', () => {
      render(<CommentsList {...defaultProps} />);

      commentsListStub.forEach(comment => {
        expect(screen.getByText(comment.content)).toBeInTheDocument();
      });
    });

    it('각 댓글마다 CommentCard가 렌더링된다.', () => {
      render(<CommentsList {...defaultProps} />);

      const lists = screen.getAllByRole('list');
      const commentList = lists[0];
      const listItems = within(commentList).getAllByRole('listitem');
      expect(listItems).toHaveLength(commentsListStub.length);
    });

    it('Pagination 컴포넌트가 렌더링된다.', () => {
      render(<CommentsList {...defaultProps} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('CommentCard props 전달', () => {
    it('각 CommentCard에 올바른 댓글 데이터가 전달된다.', () => {
      render(<CommentsList {...defaultProps} />);

      commentsListStub.forEach(comment => {
        expect(screen.getByText(comment.author_nickname)).toBeInTheDocument();
        expect(screen.getByText(comment.content)).toBeInTheDocument();
      });
    });

    it('useUserNickname의 반환값이 CommentCard에 전달된다.', () => {
      render(<CommentsList {...defaultProps} />);

      const authorComment = commentsListStub.find(c => c.author_nickname === TEST_USER_NICKNAME);
      if (authorComment) {
        expect(screen.getByText('삭제')).toBeInTheDocument();
      }
    });
  });

  describe('페이지네이션', () => {
    it('totalPages가 1보다 큰 경우 페이지 번호가 표시된다.', () => {
      render(<CommentsList {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
