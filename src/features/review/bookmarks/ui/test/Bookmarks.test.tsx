import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Bookmarks from '../Bookmarks';
import {useIsLoggedIn} from '@/entities/auth';
import {useGetReviewBookmarks, useToggleBookmark} from '@/entities/review';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/review');
jest.mock('@/entities/auth');
jest.mock('@/shared/ui/icons', () => ({
  LucideIcon: ({name}: {name: string}) => <div>{name}</div>,
}));

const mockUseGetReviewBookmarks = useGetReviewBookmarks as jest.MockedFunction<typeof useGetReviewBookmarks>;
const mockUseToggleBookmark = useToggleBookmark as jest.MockedFunction<typeof useToggleBookmark>;
const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;

describe('src/features/review/bookmarks/ui/Bookmarks.tsx', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('북마크 컴포넌트가 렌더링된다.', () => {
    mockUseGetReviewBookmarks.mockReturnValue({
      data: {
        bookmarks: 5,
        hasBookmarked: false,
      },
    } as unknown as ReturnType<typeof useGetReviewBookmarks>);

    mockUseToggleBookmark.mockReturnValue({
      toggleBookmark: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useToggleBookmark>);

    render(withAllContext(<Bookmarks reviewId={5} openLoginModal={() => {}} />));

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('북마크 중일 경우 체크 아이콘으로 렌더링하며 스타일이 변경된다.', () => {
    mockUseGetReviewBookmarks.mockReturnValue({
      data: {
        bookmarks: 5,
        hasBookmarked: true,
      },
    } as unknown as ReturnType<typeof useGetReviewBookmarks>);

    mockUseToggleBookmark.mockReturnValue({
      toggleBookmark: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useToggleBookmark>);

    render(<Bookmarks reviewId={5} openLoginModal={() => {}} />);

    const button = screen.getByLabelText('북마크 해제하기', {selector: 'button'});
    expect(button).toHaveClass('border-mediumBlue');
    expect(screen.getByRole('paragraph')).toHaveClass('text-mediumBlue');
    expect(screen.getByText('BookmarkCheck')).toBeInTheDocument();
  });

  it('북마크 중이지 않을 경우 기본 아이콘으로 렌더링한다.', () => {
    mockUseGetReviewBookmarks.mockReturnValue({
      data: {
        bookmarks: 5,
        hasBookmarked: false,
      },
    } as unknown as ReturnType<typeof useGetReviewBookmarks>);

    mockUseToggleBookmark.mockReturnValue({
      toggleBookmark: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useToggleBookmark>);

    render(<Bookmarks reviewId={5} openLoginModal={() => {}} />);

    const button = screen.getByLabelText('북마크 추가하기', {selector: 'button'});
    expect(button).not.toHaveClass('border-mediumBlue');
    expect(screen.getByText('5')).not.toHaveClass('text-mediumBlue');
    expect(screen.getByText('Bookmark')).toBeInTheDocument();
  });

  it('로그인한 경우 북마크를 토글할 수 있다.', async () => {
    const mockToggleBookmark = jest.fn();
    const user = userEvent.setup();

    mockUseIsLoggedIn.mockReturnValue(true);

    mockUseGetReviewBookmarks.mockReturnValue({
      data: {
        bookmarks: 5,
        hasBookmarked: false,
      },
    } as unknown as ReturnType<typeof useGetReviewBookmarks>);

    mockUseToggleBookmark.mockReturnValue({
      toggleBookmark: mockToggleBookmark,
      isPending: false,
    } as unknown as ReturnType<typeof useToggleBookmark>);

    render(<Bookmarks reviewId={5} openLoginModal={() => {}} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockToggleBookmark).toHaveBeenCalledTimes(1);
    expect(mockToggleBookmark).toHaveBeenCalledWith({reviewId: 5});
  });

  it('로그인하지 않은 경우 모달 오픈 함수를 호출한다.', async () => {
    const mockToggleBookmark = jest.fn();
    const mockOpenLoginModal = jest.fn();
    const user = userEvent.setup();

    mockUseIsLoggedIn.mockReturnValue(false);

    mockUseGetReviewBookmarks.mockReturnValue({
      data: {
        bookmarks: 5,
        hasBookmarked: false,
      },
    } as unknown as ReturnType<typeof useGetReviewBookmarks>);

    mockUseToggleBookmark.mockReturnValue({
      toggleBookmark: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useToggleBookmark>);

    render(<Bookmarks reviewId={5} openLoginModal={mockOpenLoginModal} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockToggleBookmark).toHaveBeenCalledTimes(0);
    expect(mockOpenLoginModal).toHaveBeenCalledTimes(1);
  });

  it('요청 중일 때는 버튼을 비활성화한다.', async () => {
    const mockToggleBookmark = jest.fn();
    const user = userEvent.setup();

    mockUseIsLoggedIn.mockReturnValue(true);

    mockUseGetReviewBookmarks.mockReturnValue({
      data: {
        bookmarks: 5,
        hasBookmarked: false,
      },
    } as unknown as ReturnType<typeof useGetReviewBookmarks>);

    mockUseToggleBookmark.mockReturnValue({
      toggleBookmark: jest.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useToggleBookmark>);

    render(<Bookmarks reviewId={5} openLoginModal={() => {}} />);

    const button = screen.getByLabelText('북마크 추가하기', {selector: 'button'});
    await user.tab();

    expect(button).not.toHaveFocus();

    await user.click(button);

    expect(mockToggleBookmark).toHaveBeenCalledTimes(0);
    expect(button).toBeDisabled();
  });
});
