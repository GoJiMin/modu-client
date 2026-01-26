import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorMetaForm from '../EditorMetaForm';
import {TEST_TITLE, TEST_CATEGORY, TEST_INITIAL_TITLE, TEST_INITIAL_CATEGORY} from './stub';
import {CATEGORY_LIST, CATEGORY_MAP} from '@/entities/review';

// radix의 pointer-events:none 해결을 위한 모킹
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();

describe('src/features/review/editor/ui/EditorMetaForm.tsx', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('카테고리 선택과 제목 입력 필드가 렌더링된다.', () => {
      render(<EditorMetaForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
    });

    it('초기 제목이 있으면 입력 필드에 표시된다.', () => {
      render(<EditorMetaForm onSubmit={mockOnSubmit} initialTitle={TEST_INITIAL_TITLE} />);

      expect(screen.getByDisplayValue(TEST_INITIAL_TITLE)).toBeInTheDocument();
    });

    it('초기 카테고리가 있으면 선택되어 표시된다.', async () => {
      render(<EditorMetaForm onSubmit={mockOnSubmit} initialCategory={TEST_INITIAL_CATEGORY} />);

      const button = screen.getByRole('combobox');

      within(button).getByText(CATEGORY_MAP[TEST_INITIAL_CATEGORY]);
    });
  });

  describe('폼 제출', () => {
    it('유효한 데이터로 제출하면 제출 콜백이 호출된다.', async () => {
      const user = userEvent.setup();
      render(<EditorMetaForm onSubmit={mockOnSubmit} />);

      const categoryButton = screen.getByRole('combobox');
      await user.click(categoryButton);

      const foodOption = screen.getByRole('option', {name: '음식'});
      await user.click(foodOption);

      const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
      await user.type(titleInput, TEST_TITLE);

      const form = screen.getByRole('form', {name: 'meta-data-form'});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith(
          {
            title: TEST_TITLE,
            category: TEST_CATEGORY,
          },
          expect.anything(),
        );
      });
    });
  });

  describe('폼 검증', () => {
    it('제목이 3자 미만이거나 비어있으면 에러 메시지가 표시된다.', async () => {
      const user = userEvent.setup();
      render(<EditorMetaForm onSubmit={mockOnSubmit} />);

      const categoryButton = screen.getByRole('combobox');
      await user.click(categoryButton);

      const foodOption = screen.getByRole('option', {name: '음식'});
      await user.click(foodOption);

      const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
      await user.type(titleInput, '12');

      const form = screen.getByRole('form', {name: 'meta-data-form'});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('제목은 3자 이상 입력해주세요.')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('제목이 40자 초과이면 에러 메시지가 표시된다.', async () => {
      const user = userEvent.setup();
      render(<EditorMetaForm onSubmit={mockOnSubmit} />);

      const categoryButton = screen.getByRole('combobox');
      await user.click(categoryButton);

      const foodOption = screen.getByRole('option', {name: '음식'});
      await user.click(foodOption);

      const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
      const longTitle = 'a'.repeat(41);
      await user.type(titleInput, longTitle);

      const form = screen.getByRole('form', {name: 'meta-data-form'});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('제목은 40자 이하만 입력 가능합니다.')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('카테고리를 선택하지 않으면 에러 메시지가 표시된다.', async () => {
      const user = userEvent.setup();
      render(<EditorMetaForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
      await user.type(titleInput, TEST_TITLE);

      const form = screen.getByRole('form', {name: 'meta-data-form'});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('카테고리는 필수 입력 사항입니다.')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('카테고리 목록', () => {
    it('"전체" 카테고리는 선택 목록에 표시되지 않는다.', async () => {
      const user = userEvent.setup();
      render(<EditorMetaForm onSubmit={mockOnSubmit} />);

      const categoryButton = screen.getByRole('combobox');
      await user.click(categoryButton);

      expect(screen.queryByRole('option', {name: '전체'})).not.toBeInTheDocument();
    });

    it('선택 가능한 카테고리들이 표시된다.', async () => {
      const user = userEvent.setup();
      render(<EditorMetaForm onSubmit={mockOnSubmit} />);

      const categoryButton = screen.getByRole('combobox');
      await user.click(categoryButton);

      const selectableCategories = CATEGORY_LIST.filter(category => category.value !== 'all');

      selectableCategories.forEach(({label}) => {
        expect(screen.getByRole('option', {name: label})).toBeInTheDocument();
      });
    });
  });
});
