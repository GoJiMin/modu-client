import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentsInput from '../CommentsInput';
import {useUserNickname} from '@/entities/auth';
import {usePostReviewComment} from '@/entities/review';
import {TEST_REVIEW_ID, TEST_CATEGORY, TEST_USER_NICKNAME} from './stub';

jest.mock('@/entities/auth');
jest.mock('@/entities/review');

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockUsePostReviewComment = usePostReviewComment as jest.MockedFunction<typeof usePostReviewComment>;
const mockPostComment = jest.fn();
const mockOpenLoginModal = jest.fn();

describe('src/features/review/comments/ui/CommentsInput.tsx', () => {
  const defaultProps = {
    reviewId: TEST_REVIEW_ID,
    category: TEST_CATEGORY,
    page: 1,
    openLoginModal: mockOpenLoginModal,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePostReviewComment.mockReturnValue({
      postComment: mockPostComment,
    } as unknown as ReturnType<typeof usePostReviewComment>);
  });

  describe('렌더링', () => {
    it('컴포넌트가 렌더링된다.', () => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);

      render(<CommentsInput {...defaultProps} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '댓글 등록'})).toBeInTheDocument();
    });
  });

  describe('로그인 상태', () => {
    describe('로그인한 경우', () => {
      beforeEach(() => {
        mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
      });

      it('textarea가 편집 가능하다.', () => {
        render(<CommentsInput {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).not.toHaveAttribute('readonly');
      });

      it('placeholder에 "댓글을 입력해주세요."가 표시된다.', () => {
        render(<CommentsInput {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('placeholder', '댓글을 입력해주세요.');
      });

      it('등록 버튼이 활성화된다.', () => {
        render(<CommentsInput {...defaultProps} />);

        const button = screen.getByRole('button', {name: '댓글 등록'});
        expect(button).toBeEnabled();
      });

      it('textarea 클릭 시 openLoginModal이 호출되지 않는다.', async () => {
        const user = userEvent.setup();
        render(<CommentsInput {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        await user.click(textarea);

        expect(mockOpenLoginModal).not.toHaveBeenCalled();
      });
    });

    describe('로그인하지 않은 경우', () => {
      beforeEach(() => {
        mockUseUserNickname.mockReturnValue(null);
      });

      it('textarea가 readOnly이다.', () => {
        render(<CommentsInput {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('readonly');
      });

      it('placeholder에 "로그인 후 댓글을 작성할 수 있어요."가 표시된다.', () => {
        render(<CommentsInput {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('placeholder', '로그인 후 댓글을 작성할 수 있어요.');
      });

      it('등록 버튼이 비활성화된다.', () => {
        render(<CommentsInput {...defaultProps} />);

        const button = screen.getByRole('button', {name: '로그인 후 댓글을 등록할 수 있어요.'});
        expect(button).toBeDisabled();
      });

      it('textarea 클릭 시 openLoginModal이 호출된다.', async () => {
        const user = userEvent.setup();
        render(<CommentsInput {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        await user.click(textarea);

        expect(mockOpenLoginModal).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('댓글 등록', () => {
    beforeEach(() => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
    });

    it('내용을 입력하고 등록 버튼을 클릭하면 postComment가 호출된다.', async () => {
      const user = userEvent.setup();
      render(<CommentsInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '댓글 등록'});

      await user.type(textarea, '테스트 댓글입니다.');
      await user.click(button);

      expect(mockPostComment).toHaveBeenCalledTimes(1);
      expect(mockPostComment).toHaveBeenCalledWith({
        userNickname: TEST_USER_NICKNAME,
        reviewId: TEST_REVIEW_ID,
        category: TEST_CATEGORY,
        content: '테스트 댓글입니다.',
      });
    });

    it('댓글 등록 후 textarea가 초기화된다.', async () => {
      const user = userEvent.setup();
      render(<CommentsInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '댓글 등록'});

      await user.type(textarea, '테스트 댓글입니다.');
      await user.click(button);

      expect(textarea).toHaveValue('');
    });

    it('빈 문자열일 때 등록 버튼을 클릭하면 postComment가 호출되지 않는다.', async () => {
      const user = userEvent.setup();
      render(<CommentsInput {...defaultProps} />);

      const button = screen.getByRole('button', {name: '댓글 등록'});
      await user.click(button);

      expect(mockPostComment).not.toHaveBeenCalled();
    });

    it('공백만 있을 때 등록 버튼을 클릭하면 postComment가 호출되지 않는다.', async () => {
      const user = userEvent.setup();
      render(<CommentsInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '댓글 등록'});

      await user.type(textarea, '   ');
      await user.click(button);

      expect(mockPostComment).not.toHaveBeenCalled();
    });
  });
});
