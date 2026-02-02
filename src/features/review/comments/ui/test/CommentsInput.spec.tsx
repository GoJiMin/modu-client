import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentsInput from '../CommentsInput';
import {useUserNickname} from '@/entities/auth';
import {postReviewComment} from '@/entities/review/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/auth');
jest.mock('@/entities/review/apis/api-service');
jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

const mockPostReviewComment = postReviewComment as jest.MockedFunction<typeof postReviewComment>;
const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;

describe('src/features/review/components/ui/CommentsInput.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    const stubProps = {
      reviewId: 5,
      category: 'food' as const,
      page: 5,
      openLoginModal: () => {},
    };

    it('로그인 사용자의 댓글 입력창이 렌더링된다.', async () => {
      mockUseUserNickname.mockReturnValue('jimin');

      render(withAllContext(<CommentsInput {...stubProps} />));

      expect(screen.getByPlaceholderText('댓글을 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByLabelText('댓글 등록', {selector: 'button'})).toBeInTheDocument();
    });

    it('로그인하지 않은 사용자의 댓글 입력창이 렌더링된다.', async () => {
      mockUseUserNickname.mockReturnValue(null);

      render(withAllContext(<CommentsInput {...stubProps} />));

      const textArea = screen.getByPlaceholderText('로그인 후 댓글을 작성할 수 있어요.');
      const button = screen.getByLabelText('로그인 후 댓글을 등록할 수 있어요.', {selector: 'button'});

      expect(textArea).toBeInTheDocument();
      expect(textArea).toHaveAttribute('readOnly');

      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('기능 테스트', () => {
    const stubProps = {
      reviewId: 5,
      category: 'food' as const,
      page: 1,
      openLoginModal: () => {},
    };

    beforeEach(() => {
      mockUseUserNickname.mockReturnValue('jimin');
    });

    it('댓글 등록 후 입력창이 초기화된다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<CommentsInput {...stubProps} />));

      const textArea = screen.getByPlaceholderText('댓글을 입력해주세요.');
      const button = screen.getByLabelText('댓글 등록', {selector: 'button'});

      await user.type(textArea, '테스트 입력');
      expect(textArea).toHaveDisplayValue('테스트 입력');

      await user.click(button);
      expect(textArea).toHaveDisplayValue('');
    });

    it('댓글 등록 시 공백을 제거한다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<CommentsInput {...stubProps} />));

      const textArea = screen.getByPlaceholderText('댓글을 입력해주세요.');
      const button = screen.getByLabelText('댓글 등록', {selector: 'button'});

      await user.type(textArea, '          테스트 입력                 ');
      await user.click(button);

      expect(postReviewComment).toHaveBeenCalledTimes(1);
      expect(postReviewComment).toHaveBeenCalledWith({
        reviewId: stubProps.reviewId,
        category: stubProps.category,
        content: '테스트 입력',
      });
    });
  });

  describe('엣지 테스트', () => {
    const stubProps = {
      reviewId: 5,
      category: 'food' as const,
      page: 5,
      openLoginModal: jest.fn(),
    };
    it('로그인하지 않은 사용자가 입력창을 클릭하면 모달을 표시한다.', async () => {
      mockUseUserNickname.mockReturnValue(null);

      const user = userEvent.setup();

      render(withAllContext(<CommentsInput {...stubProps} />));

      const textArea = screen.getByPlaceholderText('로그인 후 댓글을 작성할 수 있어요.');
      await user.click(textArea);

      expect(stubProps.openLoginModal).toHaveBeenCalledTimes(1);
      expect(mockPostReviewComment).toHaveBeenCalledTimes(0);
    });

    // 버튼 요소가 textArea에 묻혀 실제로 동작하진 않음
    it('로그인하지 않은 사용자가 버튼을 클릭하면 요청하지 않는다.', async () => {
      mockUseUserNickname.mockReturnValue(null);

      const user = userEvent.setup();

      render(withAllContext(<CommentsInput {...stubProps} />));

      const button = screen.getByLabelText('로그인 후 댓글을 등록할 수 있어요.', {selector: 'button'});
      await user.click(button);

      expect(mockPostReviewComment).toHaveBeenCalledTimes(0);
    });

    it('공백을 포함해 입력값이 없을 경우 요청하지 않는다.', async () => {
      mockUseUserNickname.mockReturnValue('jimin');

      const user = userEvent.setup();

      render(withAllContext(<CommentsInput {...stubProps} />));

      const textArea = screen.getByPlaceholderText('댓글을 입력해주세요.');
      const button = screen.getByLabelText('댓글 등록', {selector: 'button'});

      await user.type(textArea, '      ');
      await user.click(button);

      expect(mockPostReviewComment).toHaveBeenCalledTimes(0);
    });
  });
});
