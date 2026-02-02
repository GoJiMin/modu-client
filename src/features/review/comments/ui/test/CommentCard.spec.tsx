import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import CommentCard from '../CommentCard';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import {commentStub, otherUserCommentStub, TEST_PAGE, TEST_REVIEW_ID, TEST_USER_NICKNAME} from './stub';

jest.mock('@/entities/review/apis/api-service');
jest.mock('@/shared/ui/components', () => ({
  ...jest.requireActual('@/shared/ui/components'),
  Avatar: ({src, alt}: {src: string; alt: string}) => <img src={src} alt={alt} />,
}));

describe('src/features/review/comments/ui/CommentCard.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    comment: commentStub,
    userNickname: TEST_USER_NICKNAME,
    reviewId: TEST_REVIEW_ID,
    page: TEST_PAGE,
  };

  it('댓글 카드가 렌더링된다.', () => {
    render(withAllContext(<CommentCard {...defaultProps} />));

    expect(screen.getByText(commentStub.author_nickname)).toBeInTheDocument();
    expect(screen.getByText(`(${commentStub.created_at})`)).toBeInTheDocument();
    expect(screen.getByText(commentStub.content)).toBeInTheDocument();
  });

  it('작성자인 경우 삭제 버튼이 표시된다.', () => {
    render(withAllContext(<CommentCard {...defaultProps} />));

    expect(screen.getByLabelText('댓글 삭제', {selector: 'button'})).toBeInTheDocument();
  });

  it('작성자가 아닌 경우 삭제 버튼이 표시되지 않는다.', () => {
    render(withAllContext(<CommentCard {...defaultProps} comment={otherUserCommentStub} />));

    expect(screen.queryByLabelText('댓글 삭제', {selector: 'button'})).not.toBeInTheDocument();
  });

  it('작성자 이름을 클릭하면 사용자 페이지로 이동한다.', async () => {
    const user = userEvent.setup();

    render(withAllContext(<CommentCard {...defaultProps} />), {wrapper: MemoryRouterProvider});

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(commentStub.author_nickname);

    await user.click(link);

    expect(mockRouter.asPath).toBe(`/users/${commentStub.author_nickname}`);
  });
});
