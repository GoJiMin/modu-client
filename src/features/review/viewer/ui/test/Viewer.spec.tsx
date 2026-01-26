import {CATEGORY_MAP, ReviewContent} from '@/entities/review';
import {render, screen} from '@testing-library/react';
import Viewer from '../Viewer';

jest.mock('@/shared/ui/components', () => ({
  ...jest.requireActual('@/shared/ui/components'),
  Avatar: ({src, alt, rounded}: {src: string; alt: string; rounded: string}) => (
    <img src={src} alt={alt} className={rounded} />
  ),
}));

describe('src/features/review/viewer/ui/Viewer.tsx', () => {
  const contentForWriteStub: ReviewContent = {
    title: '테스트 제목',
    category: 'food',
    content: '<div>컨텐츠</div>',
    author_nickname: 'jimin',
    created_at: '2026년 1월 26일',
  };

  const contentForViewStub: ReviewContent = {
    ...contentForWriteStub,
    authorProfileUrl: 'https://example.com/jimin',
  };

  describe('게시글 작성 페이지', () => {
    it('컴포넌트가 렌더링된다.', () => {
      render(<Viewer {...contentForWriteStub} />);

      expect(screen.getByText(contentForViewStub.title)).toBeInTheDocument();
      expect(screen.getByText(CATEGORY_MAP[contentForViewStub.category])).toBeInTheDocument();
      expect(screen.getByText(contentForViewStub.created_at)).toBeInTheDocument();
      expect(screen.getByText(contentForViewStub.author_nickname)).toBeInTheDocument();
      expect(screen.getByText('컨텐츠')).toBeInTheDocument();
    });

    it('작성자 정보가 텍스트로만 표시된다.', () => {
      render(<Viewer {...contentForWriteStub} />);

      expect(screen.getByText(contentForWriteStub.author_nickname)).toBeInTheDocument();
      expect(screen.queryByRole('link')).toBeNull();
    });
  });

  describe('게시글 상세 페이지', () => {
    it('컴포넌트가 렌더링된다.', () => {
      render(<Viewer {...contentForViewStub} />);

      expect(screen.getByText(contentForViewStub.title)).toBeInTheDocument();
      expect(screen.getByText(CATEGORY_MAP[contentForViewStub.category])).toBeInTheDocument();
      expect(screen.getByText(contentForViewStub.created_at)).toBeInTheDocument();
      expect(screen.getByText(contentForViewStub.author_nickname)).toBeInTheDocument();
      expect(screen.getByText('컨텐츠')).toBeInTheDocument();
    });

    it('작성자 프로필 링크가 있으면 올바르게 설정된다.', () => {
      render(<Viewer {...contentForViewStub} />);

      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href', contentForViewStub.authorProfileUrl);
    });

    it('작성자 프로필 이미지가 있으면 렌더링된다.', () => {
      const imageUrl = 'https://cdn.example.com/jimin.png';

      render(<Viewer {...contentForViewStub} profile_image={imageUrl} />);

      const img = screen.getByRole('img');

      expect(img).toHaveAttribute('src', imageUrl);
      expect(img).toHaveAttribute('alt', `${contentForViewStub.author_nickname} 프로필 이미지`);
      expect(img).toHaveClass('rounded-full');
    });

    it('작성자 프로필 이미지가 없으면 대체 프로필 이미지가 렌더링된다.', () => {
      render(<Viewer {...contentForViewStub} />);

      expect(screen.queryByRole('img')).toBeNull();
      expect(screen.getByLabelText('기본 프로필 이미지')).toBeInTheDocument();
    });
  });
});
