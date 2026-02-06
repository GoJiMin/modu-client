import {render, screen} from '@testing-library/react';
import RecentReviews from '../RecentReviews';

// 해당 테스트는 작성되었기 때문에 지연 로딩으로 레이아웃 검증만 수행
jest.mock('../RecentReviewsCarousel', () => ({
  __esModule: true,
  default: () => <div>최근 등록된 후기 목록</div>,
}));

describe('src/features/reviews/recent/ui/RecentReviews.tsx', () => {
  it('최근 등록된 후기 컴포넌트가 렌더링된다.', async () => {
    render(<RecentReviews />);

    expect(screen.getByText('최근 등록된 후기')).toBeInTheDocument();
    expect(await screen.findByText('최근 등록된 후기 목록')).toBeInTheDocument();
  });
});
