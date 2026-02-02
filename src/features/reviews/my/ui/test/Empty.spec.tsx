import {render, screen} from '@testing-library/react';
import Empty from '../Empty';

describe('features/reviews/my/ui/Empty', () => {
  describe('정상 케이스', () => {
    it('제목 텍스트가 올바르게 렌더링된다', () => {
      render(<Empty title="테스트 제목" linkText="링크 텍스트" linkHref="/test" />);

      expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    });

    it('링크 텍스트가 올바르게 렌더링된다', () => {
      render(<Empty title="테스트 제목" linkText="링크 텍스트" linkHref="/test" />);

      expect(screen.getByRole('link', {name: '링크 텍스트'})).toBeInTheDocument();
    });

    it('링크 주소가 올바르게 설정된다', () => {
      render(<Empty title="테스트 제목" linkText="링크 텍스트" linkHref="/test" />);

      const link = screen.getByRole('link', {name: '링크 텍스트'});
      expect(link).toHaveAttribute('href', '/test');
    });

    it('링크가 클릭 가능한 상태로 렌더링된다', () => {
      render(<Empty title="테스트 제목" linkText="링크 텍스트" linkHref="/test" />);

      const link = screen.getByRole('link', {name: '링크 텍스트'});
      expect(link).toBeEnabled();
    });
  });

  describe('엣지/예외 케이스', () => {
    it('빈 문자열 제목이 전달되어도 렌더링된다', () => {
      render(<Empty title="" linkText="링크 텍스트" linkHref="/test" />);

      expect(screen.getByRole('link', {name: '링크 텍스트'})).toBeInTheDocument();
    });

    it('특수문자가 포함된 제목이 올바르게 표시된다', () => {
      const specialTitle = '후기가 없어요! @#$%^&*()';
      render(<Empty title={specialTitle} linkText="링크 텍스트" linkHref="/test" />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('슬래시로 시작하지 않는 링크 주소도 올바르게 설정된다', () => {
      render(<Empty title="테스트 제목" linkText="링크 텍스트" linkHref="https://example.com" />);

      const link = screen.getByRole('link', {name: '링크 텍스트'});
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });
});
