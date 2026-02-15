import {render, screen} from '@testing-library/react';
import SourceCarousel from '../SourceCarousel';

jest.mock('react-multi-carousel', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

describe('src/features/chatbot/ui/steps/SourceCarousel.tsx', () => {
  it('전달받은 sources 목록을 카드로 렌더링한다.', () => {
    const sources = [
      {
        title: '피자 후기 1',
        snippet: '도우가 쫄깃하고 치즈가 풍부해요.',
        url: 'https://example.com/review/1',
      },
      {
        title: '피자 후기 2',
        snippet: '토핑이 신선하고 가성비가 좋아요.',
        url: 'https://news.example.org/review/2',
      },
    ];

    render(<SourceCarousel sources={sources} />);

    expect(screen.getByText('피자 후기 1')).toBeInTheDocument();
    expect(screen.getByText('피자 후기 2')).toBeInTheDocument();

    const firstSourceLink = screen.getByRole('link', {name: /피자 후기 1/i});
    const secondSourceLink = screen.getByRole('link', {name: /피자 후기 2/i});

    expect(firstSourceLink).toHaveAttribute('href', 'https://example.com/review/1');
    expect(secondSourceLink).toHaveAttribute('href', 'https://news.example.org/review/2');
  });
});
