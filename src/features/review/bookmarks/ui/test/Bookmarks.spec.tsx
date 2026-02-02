import {Suspense} from 'react';
import {render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Bookmarks from '../Bookmarks';
import {useIsLoggedIn} from '@/entities/auth';
import {bookmarkReview, getReviewBookmarks, unBookmarkReview} from '@/entities/review/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/auth');
jest.mock('@/entities/review/apis/api-service');

const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;
const mockBookmarkReview = bookmarkReview as jest.MockedFunction<typeof bookmarkReview>;
const mockUnBookmarkReview = unBookmarkReview as jest.MockedFunction<typeof unBookmarkReview>;
const mockGetReviewBookmarks = getReviewBookmarks as jest.MockedFunction<typeof getReviewBookmarks>;

describe('src/features/review/bookmarks/ui/Bookmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('북마크 중이지 않은 게시글이 렌더링된다.', async () => {
      mockGetReviewBookmarks.mockResolvedValue({bookmarks: 5, hasBookmarked: false});

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Bookmarks reviewId={5} openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const bookmarkButton = screen.getByLabelText('북마크 추가하기', {selector: 'button'});
      const bookmarkCount = screen.getByText('5');

      expect(bookmarkButton).not.toHaveClass('border-mediumBlue');
      expect(bookmarkCount).not.toHaveClass('text-mediumBlue');
    });

    it('북마크 중인 게시글이 렌더링된다.', async () => {
      mockGetReviewBookmarks.mockResolvedValue({bookmarks: 5, hasBookmarked: true});

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Bookmarks reviewId={5} openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const bookmarkButton = screen.getByLabelText('북마크 해제하기', {selector: 'button'});
      const bookmarkCount = screen.getByText('5');

      expect(bookmarkButton).toHaveClass('border-mediumBlue');
      expect(bookmarkCount).toHaveClass('text-mediumBlue');
    });
  });

  describe('엣지 테스트', () => {
    it('로그인하지 않은 경우 북마크 버튼 클릭 시 모달을 표시한다.', async () => {
      mockUseIsLoggedIn.mockReturnValue(false);
      mockGetReviewBookmarks.mockResolvedValue({bookmarks: 5, hasBookmarked: false});

      const user = userEvent.setup();
      const mockOpenLoginModal = jest.fn();

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Bookmarks reviewId={5} openLoginModal={mockOpenLoginModal} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const button = screen.getByLabelText('북마크 추가하기', {selector: 'button'});
      await user.click(button);

      expect(mockOpenLoginModal).toHaveBeenCalledTimes(1);
    });

    it('요청 중일 때 북마크 버튼이 비활성화된다.', async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(true);
      mockGetReviewBookmarks.mockResolvedValue({bookmarks: 5, hasBookmarked: false});

      let resolveBookmark: any;
      mockBookmarkReview.mockImplementation(() => {
        return new Promise(resolve => {
          resolveBookmark = resolve;
        });
      });

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Bookmarks reviewId={5} openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));

      const button = screen.getByLabelText('북마크 추가하기', {selector: 'button'});
      await user.click(button);

      expect(mockBookmarkReview).toHaveBeenCalledTimes(1);
      expect(button).toBeDisabled();

      resolveBookmark();
    });
  });

  describe('통합 테스트', () => {
    beforeEach(() => {
      mockUseIsLoggedIn.mockReturnValue(true);
    });

    it('북마크 수가 4인 게시글을 북마크하면 5로 변경된다.', async () => {
      const user = userEvent.setup();
      let resolveBookmark: any;

      mockBookmarkReview.mockImplementation(() => {
        return new Promise(resolve => {
          resolveBookmark = resolve;
        });
      });

      mockGetReviewBookmarks
        .mockResolvedValueOnce({bookmarks: 5, hasBookmarked: false})
        .mockResolvedValueOnce({bookmarks: 6, hasBookmarked: true});

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Bookmarks reviewId={5} openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));
      expect(screen.getByText('5')).toBeInTheDocument();

      const button = screen.getByLabelText('북마크 추가하기', {selector: 'button'});
      await user.click(button);

      expect(screen.getByText('6')).toBeInTheDocument();

      resolveBookmark();

      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument();
        expect(screen.getByLabelText('북마크 해제하기')).toBeInTheDocument();
      });
    });

    it('북마크 수가 5인 게시글을 북마크 해제하면 4로 변경된다.', async () => {
      const user = userEvent.setup();
      let resolveBookmark: any;

      mockUnBookmarkReview.mockImplementation(() => {
        return new Promise(resolve => {
          resolveBookmark = resolve;
        });
      });

      mockGetReviewBookmarks
        .mockResolvedValueOnce({bookmarks: 5, hasBookmarked: true})
        .mockResolvedValueOnce({bookmarks: 4, hasBookmarked: false});

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Bookmarks reviewId={5} openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));
      expect(screen.getByText('5')).toBeInTheDocument();

      const button = screen.getByLabelText('북마크 해제하기', {selector: 'button'});
      await user.click(button);

      expect(screen.getByText('4')).toBeInTheDocument();

      resolveBookmark();

      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByLabelText('북마크 추가하기')).toBeInTheDocument();
      });
    });

    it('북마크 요청이 실패하면 미리 변경한 화면을 복구한다.', async () => {
      const user = userEvent.setup();
      let rejectBookmark: any;

      mockBookmarkReview.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          rejectBookmark = reject;
        });
      });

      mockGetReviewBookmarks.mockResolvedValue({bookmarks: 5, hasBookmarked: false});

      render(
        withAllContext(
          <Suspense fallback={<div>loading</div>}>
            <Bookmarks reviewId={5} openLoginModal={() => {}} />
          </Suspense>,
        ),
      );

      await waitForElementToBeRemoved(screen.getByText('loading'));
      expect(screen.getByText('5')).toBeInTheDocument();

      const button = screen.getByLabelText('북마크 추가하기', {selector: 'button'});
      await user.click(button);

      expect(screen.getByText('6')).toBeInTheDocument();

      rejectBookmark();

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByLabelText('북마크 추가하기')).toBeInTheDocument();
      });
    });
  });
});
