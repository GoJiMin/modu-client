import {render, screen} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import MoreReviewsLink from '../MoreReviewsLink';
import userEvent from '@testing-library/user-event';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

describe('src/features/reviews/recent/ui/MoreReviewsLink.tsx', () => {
  it('더 많은 후기 보기 링크가 렌더링된다.', () => {
    render(<MoreReviewsLink />);

    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('aria-label', '더 많은 후기 보러가기');
    expect(screen.getByText('더 많은 후기 보기 >'));
  });

  it('링크의 이동 대상이 정상적으로 등록된다.', () => {
    render(<MoreReviewsLink />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '/search');
  });

  it('링크를 클릭하면 검색 페이지로 이동한다.', async () => {
    const user = userEvent.setup();

    render(<MoreReviewsLink />, {wrapper: MemoryRouterProvider});

    const link = screen.getByRole('link');
    await user.click(link);

    expect(mockRouter.asPath).toBe('/search');
  });
});
