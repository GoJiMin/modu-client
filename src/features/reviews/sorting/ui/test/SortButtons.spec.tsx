import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortButtons from '../SortButtons';
import {SORT_OPTIONS} from '../../const/sortOptions';

jest.mock('@/shared/lib/utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('features/reviews/sorting/ui/SortButtons', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('정상 케이스', () => {
    it('모든 정렬 버튼이 렌더링된다', () => {
      render(<SortButtons sort="recent" onValueChange={mockOnValueChange} />);

      SORT_OPTIONS.forEach(({name}) => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });

    it('정렬 버튼을 클릭하면 핸들러가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SortButtons sort="recent" onValueChange={mockOnValueChange} />);

      const button = screen.getByText('북마크순');
      await user.click(button);

      expect(mockOnValueChange).toHaveBeenCalledWith('hotbookmarks');
      expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    });

    it('여러 버튼을 클릭해도 정상적으로 동작한다', async () => {
      const user = userEvent.setup();
      render(<SortButtons sort="recent" onValueChange={mockOnValueChange} />);

      await user.click(screen.getByText('최신순'));
      expect(mockOnValueChange).toHaveBeenCalledWith('recent');

      await user.click(screen.getByText('북마크순'));
      expect(mockOnValueChange).toHaveBeenCalledWith('hotbookmarks');

      await user.click(screen.getByText('댓글순'));
      expect(mockOnValueChange).toHaveBeenCalledWith('hotcomments');

      expect(mockOnValueChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('엣지/예외 케이스', () => {
    it('선택된 버튼에는 활성 스타일이 적용된다', () => {
      render(<SortButtons sort="hotbookmarks" onValueChange={mockOnValueChange} />);

      const activeButton = screen.getByText('북마크순');
      expect(activeButton).toHaveClass('font-extrabold');
      expect(activeButton).toHaveClass('text-boldBlue');
    });

    it('선택되지 않은 버튼에는 비활성 스타일이 적용된다', () => {
      render(<SortButtons sort="recent" onValueChange={mockOnValueChange} />);

      const inactiveButton1 = screen.getByText('북마크순');
      const inactiveButton2 = screen.getByText('댓글순');

      expect(inactiveButton1).toHaveClass('hover:text-boldBlue');
      expect(inactiveButton1).toHaveClass('text-gray-400');
      expect(inactiveButton2).toHaveClass('hover:text-boldBlue');
      expect(inactiveButton2).toHaveClass('text-gray-400');
    });

    it('동일한 버튼을 다시 클릭해도 핸들러가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SortButtons sort="recent" onValueChange={mockOnValueChange} />);

      const button = screen.getByText('최신순');
      await user.click(button);

      expect(mockOnValueChange).toHaveBeenCalledWith('recent');
    });

    it('스타일 적용 없이 렌더링해도 정상 동작한다', () => {
      const {container} = render(<SortButtons sort="recent" onValueChange={mockOnValueChange} />);

      const divElement = container.firstChild as HTMLElement;
      expect(divElement).toHaveClass('flex');
      expect(divElement).toHaveClass('gap-4');
    });
  });
});
