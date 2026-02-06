import {Suspense} from 'react';
import {render, screen, waitFor, waitForElementToBeRemoved, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {useUserNickname} from '@/entities/auth';
import Comments from '../Comments';
import {deleteReviewComment, getReviewComments, postReviewComment} from '@/entities/review/apis/api-service';
import {
  commentsListStub,
  commentStub,
  emptyReviewCommentsStub,
  reviewCommentsStub,
  TEST_CATEGORY,
  TEST_REVIEW_ID,
  TEST_USER_NICKNAME,
} from './stub';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/review/apis/api-service');
jest.mock('@/entities/auth');

const mockGetReviewComments = getReviewComments as jest.MockedFunction<typeof getReviewComments>;
const mockPostReviewComment = postReviewComment as jest.MockedFunction<typeof postReviewComment>;
const mockDeleteReviewComment = deleteReviewComment as jest.MockedFunction<typeof deleteReviewComment>;
const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;

describe('src/features/review/comments/ui/Comments.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    beforeEach(() => {
      mockGetReviewComments.mockResolvedValue(reviewCommentsStub);
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
    });

    it('컴포넌트가 렌더링된다.', async () => {
      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Comments reviewId={5} category="food" openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      // 페이지 구조상 0번 인덱스가 카드 리스트 1번 인덱스가 페이지네이션
      const lists = screen.getAllByRole('list');
      const commentList = lists[0];

      expect(screen.getByText('댓글쓰기')).toHaveTextContent('3');
      expect(screen.getByPlaceholderText('댓글을 입력해주세요.')).toBeInTheDocument();
      expect(within(commentList).getAllByRole('listitem')).toHaveLength(3);
    });

    it('게시글에 댓글이 없을 경우 댓글 리스트가 표시되지 않는다.', async () => {
      mockGetReviewComments.mockResolvedValue(emptyReviewCommentsStub);

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Comments reviewId={5} category="food" openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const header = screen.getByText('댓글쓰기');
      expect(header).toHaveTextContent('0');

      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    beforeEach(() => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
    });

    describe('댓글 리스트', () => {
      beforeEach(() => {
        const reviewCommentsPage1Stub = {comments: [], comments_count: 0, total_pages: 3, current_page: 1};
        const reviewCommentsPage2Stub = {comments: [], comments_count: 0, total_pages: 3, current_page: 2};
        const reviewCommentsPage3Stub = {comments: [], comments_count: 0, total_pages: 3, current_page: 3};

        // 각 페이지별 리턴값 모킹
        mockGetReviewComments.mockImplementation((_reviewId, page) => {
          if (page === 1) {
            return Promise.resolve(reviewCommentsPage1Stub);
          }

          if (page === 2) {
            return Promise.resolve(reviewCommentsPage2Stub);
          }

          if (page === 3) {
            return Promise.resolve(reviewCommentsPage3Stub);
          }

          return Promise.resolve({comments: [], total_pages: 0, comments_count: 0, current_page: page});
        });
      });

      it('현재 페이지의 앞/뒤 페이지 데이터를 미리 불러온다.', async () => {
        mockRouter.push('/?page=2');

        render(
          withAllContext(
            <Suspense fallback={<div>loading</div>}>
              <Comments reviewId={TEST_REVIEW_ID} category="food" openLoginModal={() => {}} />
            </Suspense>,
          ),
        );

        await waitForElementToBeRemoved(screen.getByText('loading'));

        expect(mockGetReviewComments.mock.calls).toStrictEqual([
          [TEST_REVIEW_ID, 2],
          [TEST_REVIEW_ID, 3],
          [TEST_REVIEW_ID, 1],
        ]);
      });
    });

    describe('댓글 삭제', () => {
      it('사용자가 작성한 댓글을 포함한 3개의 리스트에서 댓글을 삭제하면 즉시 2개의 댓글이 표시된다.', async () => {
        const user = userEvent.setup();
        // 제거된 이후의 댓글 리스트
        const removedReviewCommentsStub = {
          comments_count: 2,
          comments: commentsListStub.slice(1),
          current_page: 1,
          total_pages: 1,
        };

        // 요청 중 낙관적 업데이트 확인을 위해 직접 호출 전까지 영원히 pending 상태로 모킹
        let resolveDeleteComment: any;
        mockDeleteReviewComment.mockImplementation(() => {
          return new Promise(resolve => {
            resolveDeleteComment = resolve;
          });
        });
        // 첫 요청 시 3개의 리스트, 이후 삭제된 2개의 리스트 반환
        mockGetReviewComments
          .mockResolvedValueOnce(reviewCommentsStub)
          .mockResolvedValueOnce(removedReviewCommentsStub);

        render(
          withAllContext(
            <Suspense fallback={<div>loading</div>}>
              <Comments reviewId={5} category="food" openLoginModal={() => {}} />
            </Suspense>,
          ),
        );

        await waitForElementToBeRemoved(screen.getByText('loading'));

        const lists = screen.getAllByRole('list');
        const commentList = lists[0];

        expect(within(commentList).getAllByRole('listitem')).toHaveLength(3);
        expect(within(commentList).getByText(TEST_USER_NICKNAME)).toBeInTheDocument();

        const deleteCommentbutton = screen.getByLabelText('댓글 삭제', {selector: 'button'});
        await user.click(deleteCommentbutton);

        const deleteConfirmButton = screen.getByLabelText('삭제', {selector: 'button'});
        await user.click(deleteConfirmButton);

        expect(within(commentList).getAllByRole('listitem')).toHaveLength(2);
        expect(within(commentList).queryByText(TEST_USER_NICKNAME)).not.toBeInTheDocument();

        resolveDeleteComment();

        await waitFor(() => {
          expect(within(commentList).getAllByRole('listitem')).toHaveLength(2);
          expect(within(commentList).queryByText(TEST_USER_NICKNAME)).not.toBeInTheDocument();
        });
      });

      it('댓글 삭제가 실패하면 먼저 보여준 2개의 리스트를 다시 3개로 복구한다.', async () => {
        const user = userEvent.setup();

        // 요청 중 낙관적 업데이트 확인을 위해 직접 호출 전까지 영원히 pending 상태로 모킹
        let rejectDeleteComment: any;
        mockDeleteReviewComment.mockImplementation(() => {
          return new Promise((resolve, reject) => {
            rejectDeleteComment = reject;
          });
        });
        // 요청 실패를 간주해 3개의 댓글 리스트만 반환
        mockGetReviewComments.mockResolvedValue(reviewCommentsStub);

        render(
          withAllContext(
            <Suspense fallback={<div>loading</div>}>
              <Comments reviewId={5} category="food" openLoginModal={() => {}} />
            </Suspense>,
          ),
        );

        await waitForElementToBeRemoved(screen.getByText('loading'));

        const lists = screen.getAllByRole('list');
        const commentList = lists[0];

        expect(within(commentList).getAllByRole('listitem')).toHaveLength(3);
        expect(within(commentList).getByText(TEST_USER_NICKNAME)).toBeInTheDocument();

        const deleteCommentbutton = screen.getByLabelText('댓글 삭제', {selector: 'button'});
        await user.click(deleteCommentbutton);

        const deleteConfirmButton = screen.getByLabelText('삭제', {selector: 'button'});
        await user.click(deleteConfirmButton);

        expect(within(commentList).getAllByRole('listitem')).toHaveLength(2);
        expect(within(commentList).queryByText(TEST_USER_NICKNAME)).not.toBeInTheDocument();

        rejectDeleteComment();

        await waitFor(() => {
          expect(within(commentList).getAllByRole('listitem')).toHaveLength(3);
          expect(within(commentList).getByText(TEST_USER_NICKNAME)).toBeInTheDocument();
        });
      });
    });

    describe('댓글 등록', () => {
      it('댓글이 3개인 상태에서 댓글을 추가하면 즉시 4개가 표시된다.', async () => {
        const user = userEvent.setup();

        const TEST_CONTENT = '테스트 컨텐츠';
        const updatedReviewCommentsStub = {
          comments_count: 4,
          comments: [
            ...commentsListStub,
            {
              id: 4,
              profile_image: 'https://example.com/profile.jpg',
              author_nickname: TEST_USER_NICKNAME,
              content: TEST_CONTENT,
              created_at: '2026-01-24',
            },
          ],
          current_page: 1,
          total_pages: 1,
        };

        // 낙관적 업데이트 확인을 위한 댓글 등록 모킹
        let resolvePostReviewComment: any;
        mockPostReviewComment.mockImplementation(() => {
          return new Promise(resolve => {
            resolvePostReviewComment = resolve;
          });
        });
        // 성공 케이스를 위해 3개의 리스트 반환 후 다음 요청은 newComment 객체를 추가한 4개 리스트 반환
        mockGetReviewComments
          .mockResolvedValueOnce(reviewCommentsStub)
          .mockResolvedValueOnce(updatedReviewCommentsStub);

        render(
          withAllContext(
            <Suspense fallback={<div>loading</div>}>
              <Comments reviewId={TEST_REVIEW_ID} category={TEST_CATEGORY} openLoginModal={() => {}} />
            </Suspense>,
          ),
        );

        await waitForElementToBeRemoved(screen.getByText('loading'));

        const header = screen.getByText('댓글쓰기');
        expect(header).toHaveTextContent('3');

        const lists = screen.getAllByRole('list');
        const commentList = lists[0];
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(3);

        const textArea = screen.getByPlaceholderText('댓글을 입력해주세요.');
        const button = screen.getByLabelText('댓글 등록', {selector: 'button'});

        await user.type(textArea, TEST_CONTENT);
        await user.click(button);

        expect(header).toHaveTextContent('4');
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(4);
        expect(within(commentList).getByText(TEST_CONTENT)).toBeInTheDocument();

        resolvePostReviewComment();

        await waitFor(() => {
          expect(header).toHaveTextContent('4');
          expect(within(commentList).getAllByRole('listitem')).toHaveLength(4);
          expect(within(commentList).getByText(TEST_CONTENT)).toBeInTheDocument();
        });
      });

      it('댓글 등록이 실패하면 먼저 보여준 4개의 리스트를 다시 3개로 복구한다.', async () => {
        const user = userEvent.setup();

        const TEST_CONTENT = '테스트 컨텐츠';
        // 낙관적 업데이트 확인을 위한 댓글 등록 모킹
        let rejectPostReviewComment: any;
        mockPostReviewComment.mockImplementation(() => {
          return new Promise((resolve, reject) => {
            rejectPostReviewComment = reject;
          });
        });
        // 실패를 간주해 항상 3개만 반환
        mockGetReviewComments.mockResolvedValue(reviewCommentsStub);

        render(
          withAllContext(
            <Suspense fallback={<div>loading</div>}>
              <Comments reviewId={TEST_REVIEW_ID} category={TEST_CATEGORY} openLoginModal={() => {}} />
            </Suspense>,
          ),
        );

        await waitForElementToBeRemoved(screen.getByText('loading'));

        const header = screen.getByText('댓글쓰기');
        expect(header).toHaveTextContent('3');

        const lists = screen.getAllByRole('list');
        const commentList = lists[0];
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(3);

        const textArea = screen.getByPlaceholderText('댓글을 입력해주세요.');
        const button = screen.getByLabelText('댓글 등록', {selector: 'button'});

        await user.type(textArea, TEST_CONTENT);
        await user.click(button);

        expect(header).toHaveTextContent('4');
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(4);
        expect(within(commentList).getByText(TEST_CONTENT)).toBeInTheDocument();

        rejectPostReviewComment();

        await waitFor(() => {
          expect(header).toHaveTextContent('3');
          expect(within(commentList).getAllByRole('listitem')).toHaveLength(3);
          expect(within(commentList).queryByText(TEST_CONTENT)).not.toBeInTheDocument();
        });
      });

      it('댓글 페이지가 가득찬 경우 다음 페이지로 이동해 추가한다.', async () => {
        const user = userEvent.setup();

        const TEST_CONTENT = '테스트 컨텐츠';
        const fullListCommentsStub = {
          comments_count: 8,
          comments: Array.from({length: 8}, (v, i) => ({
            ...commentStub,
            id: i + 1,
          })),
          current_page: 1,
          total_pages: 1,
        };
        const updatedReviewCommentsStub = {
          comments_count: 9,
          comments: [
            {
              ...commentStub,
              content: TEST_CONTENT,
            },
          ],
          current_page: 2,
          total_pages: 2,
        };

        mockRouter.push('/?page=1');

        // 낙관적 업데이트 확인을 위한 댓글 등록 모킹
        let resolvePostReviewComment: any;
        mockPostReviewComment.mockImplementation(() => {
          return new Promise(resolve => {
            resolvePostReviewComment = resolve;
          });
        });

        // 각 페이지별 리턴값 모킹
        mockGetReviewComments.mockImplementation((_reviewId, page) => {
          if (page === 1) {
            return Promise.resolve(fullListCommentsStub);
          }

          if (page === 2) {
            return Promise.resolve(updatedReviewCommentsStub);
          }

          return Promise.resolve({comments: [], total_pages: 0, comments_count: 0, current_page: page});
        });

        render(
          withAllContext(
            <Suspense fallback={<div>loading</div>}>
              <Comments reviewId={TEST_REVIEW_ID} category={TEST_CATEGORY} openLoginModal={() => {}} />
            </Suspense>,
          ),
        );

        await waitForElementToBeRemoved(screen.getByText('loading'));

        expect(mockRouter.asPath).toBe('/?page=1');

        const lists = screen.getAllByRole('list');
        const commentList = lists[0];
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(8);

        const textArea = screen.getByPlaceholderText('댓글을 입력해주세요.');
        const button = screen.getByLabelText('댓글 등록', {selector: 'button'});

        await user.type(textArea, TEST_CONTENT);
        await user.click(button);

        expect(mockRouter.asPath).toBe('/?page=2');
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(1);
        expect(within(commentList).getByText(TEST_CONTENT)).toBeInTheDocument();

        resolvePostReviewComment();

        await waitFor(() => {
          expect(mockRouter.asPath).toBe('/?page=2');
          expect(within(commentList).getAllByRole('listitem')).toHaveLength(1);
          expect(within(commentList).getByText(TEST_CONTENT)).toBeInTheDocument();
        });
      });

      it('댓글 등록이 실패하면 이동한 경로를 복구한다.', async () => {
        const user = userEvent.setup();

        const TEST_CONTENT = '테스트 컨텐츠';
        const fullListCommentsStub = {
          comments_count: 8,
          comments: Array.from({length: 8}, (v, i) => ({
            ...commentStub,
            id: i + 1,
          })),
          current_page: 1,
          total_pages: 1,
        };

        mockRouter.push('/?page=1');

        // 낙관적 업데이트 확인을 위한 댓글 등록 모킹
        let rejectPostReviewComment: any;
        mockPostReviewComment.mockImplementation(() => {
          return new Promise((resolve, reject) => {
            rejectPostReviewComment = reject;
          });
        });

        mockGetReviewComments.mockResolvedValue(fullListCommentsStub);

        render(
          withAllContext(
            <Suspense fallback={<div>loading</div>}>
              <Comments reviewId={TEST_REVIEW_ID} category={TEST_CATEGORY} openLoginModal={() => {}} />
            </Suspense>,
          ),
        );

        await waitForElementToBeRemoved(screen.getByText('loading'));

        expect(mockRouter.asPath).toBe('/?page=1');

        const lists = screen.getAllByRole('list');
        const commentList = lists[0];
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(8);

        const textArea = screen.getByPlaceholderText('댓글을 입력해주세요.');
        const button = screen.getByLabelText('댓글 등록', {selector: 'button'});

        await user.type(textArea, TEST_CONTENT);
        await user.click(button);

        expect(mockRouter.asPath).toBe('/?page=2');
        expect(within(commentList).getAllByRole('listitem')).toHaveLength(1);
        expect(within(commentList).getByText(TEST_CONTENT)).toBeInTheDocument();

        rejectPostReviewComment();

        await waitFor(() => {
          expect(mockRouter.asPath).toBe('/?page=1');
          expect(within(commentList).getAllByRole('listitem')).toHaveLength(8);
        });
      });
    });
  });
});
