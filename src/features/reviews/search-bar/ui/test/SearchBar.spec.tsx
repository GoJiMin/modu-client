import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';
import mockRouter from 'next-router-mock';
import useSearchValidate from '../../lib/useSearchValidate';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('../../lib/useSearchValidate');
jest.mock('@/shared/ui/icons', () => ({
  LucideIcon: ({name, size, color}: {name: string; size: number; color: string}) => (
    <div data-testid="lucide-icon" data-name={name} data-size={size} data-color={color} />
  ),
}));

const mockUseSearchValidate = useSearchValidate as jest.MockedFunction<typeof useSearchValidate>;

describe('src/features/reviews/search-bar/ui/SearchBar.tsx', () => {
  const mockValidateSearchQuery = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();

    mockUseSearchValidate.mockReturnValue({
      validateSearchQuery: mockValidateSearchQuery,
      error: null,
      clearError: mockClearError,
    });
  });

  describe('렌더링', () => {
    it('검색 폼이 정상적으로 렌더링된다', () => {
      render(<SearchBar />);

      const form = screen.getByRole('button', {name: '검색'}).closest('form');
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '검색'});
      const icon = screen.getByTestId('lucide-icon');

      expect(form).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-name', 'Search');
      expect(icon).toHaveAttribute('data-size', '24');
      expect(icon).toHaveAttribute('data-color', '#53587E');
    });

    it('입력 필드에 올바른 placeholder가 표시된다', () => {
      render(<SearchBar />);

      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('placeholder', '후기를 검색하세요');
    });

    it('입력 필드에 올바른 ARIA 라벨이 설정된다', () => {
      render(<SearchBar />);

      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('aria-label', '검색어 입력');
    });

    it('검색 버튼에 올바른 ARIA 라벨이 설정된다', () => {
      render(<SearchBar />);

      const button = screen.getByRole('button', {name: '검색'});

      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', '검색');
    });
  });

  describe('검색 성공', () => {
    it('유효한 검색어 입력 후 제출하면 검색 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(true);

      render(<SearchBar />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '검색'});

      await user.type(input, 'testQuery');
      await user.click(button);

      expect(mockValidateSearchQuery).toHaveBeenCalledWith('testQuery');
      expect(mockRouter.asPath).toBe('/search/testQuery');
    });

    it('검색어 양옆 공백은 제거되고 제출된다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(true);

      render(<SearchBar />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '검색'});

      await user.type(input, '  testQuery  ');
      await user.click(button);

      expect(mockValidateSearchQuery).toHaveBeenCalledWith('testQuery');
      expect(mockRouter.asPath).toBe('/search/testQuery');
    });

    it('Enter 키로 제출해도 정상 동작한다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(true);

      render(<SearchBar />);

      const input = screen.getByRole('textbox');

      await user.type(input, 'testQuery{Enter}');

      expect(mockValidateSearchQuery).toHaveBeenCalledWith('testQuery');
      expect(mockRouter.asPath).toBe('/search/testQuery');
    });
  });

  describe('검색 실패', () => {
    it('검증 실패 시 라우터 이동이 발생하지 않는다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(false);

      render(<SearchBar />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '검색'});

      await user.type(input, '1');
      await user.click(button);

      expect(mockValidateSearchQuery).toHaveBeenCalledWith('1');
      expect(mockRouter.asPath).toBe('/');
    });

    it('검증 실패 시 입력 필드에 포커스 및 입력값이 선택된다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(false);

      render(<SearchBar />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      const button = screen.getByRole('button', {name: '검색'});

      await user.type(input, '1');
      await user.click(button);

      expect(input).toHaveFocus();
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(input.value.length);
    });
  });

  describe('에러 표시', () => {
    it('에러가 있을 때 에러 메시지가 표시된다', () => {
      mockUseSearchValidate.mockReturnValue({
        validateSearchQuery: mockValidateSearchQuery,
        error: '검색어를 입력해주세요.',
        clearError: mockClearError,
      });

      render(<SearchBar />);

      expect(screen.getByText('검색어를 입력해주세요.')).toBeInTheDocument();
    });

    it('에러가 없을 때 에러 메시지가 표시되지 않는다', () => {
      render(<SearchBar />);

      expect(screen.queryByText('검색어를 입력해주세요.')).not.toBeInTheDocument();
    });
  });

  describe('입력 변경 시 에러 초기화', () => {
    it('입력 필드에 타이핑하면 에러가 초기화된다', async () => {
      const user = userEvent.setup();

      render(<SearchBar />);

      const input = screen.getByRole('textbox');

      await user.type(input, 'a');

      expect(mockClearError).toHaveBeenCalled();
    });

    it('여러 번 타이핑해도 에러 초기화가 계속 동작한다', async () => {
      const user = userEvent.setup();

      render(<SearchBar />);

      const input = screen.getByRole('textbox');

      await user.type(input, 'abc');

      expect(mockClearError).toHaveBeenCalledTimes(3);
    });
  });

  describe('onBlur 동작', () => {
    it('onBlur prop이 전달되면 blur 시 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnBlur = jest.fn();

      render(<SearchBar onBlur={mockOnBlur} />);

      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('onBlur prop이 없어도 정상 동작한다', async () => {
      const user = userEvent.setup();

      render(<SearchBar />);

      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      expect(input).not.toHaveFocus();
    });
  });

  describe('통합 시나리오', () => {
    it('실패 후 수정하여 다시 제출하면 성공한다', async () => {
      const user = userEvent.setup();

      render(<SearchBar />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      const button = screen.getByRole('button', {name: '검색'});

      // 첫 번째 시도 - 실패
      mockValidateSearchQuery.mockReturnValue(false);
      await user.type(input, '1');
      await user.click(button);

      expect(mockValidateSearchQuery).toHaveBeenCalledWith('1');
      expect(mockRouter.asPath).toBe('/');
      expect(mockClearError).toHaveBeenCalled();

      // 입력 수정
      await user.clear(input);
      await user.type(input, 'testQuery');

      // 두 번째 시도 - 성공
      mockValidateSearchQuery.mockReturnValue(true);
      await user.click(button);

      expect(mockValidateSearchQuery).toHaveBeenCalledWith('testQuery');
      expect(mockRouter.asPath).toBe('/search/testQuery');
    });
  });

  describe('엣지 케이스', () => {
    it('매우 긴 유효한 검색어도 정상 처리된다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(true);

      render(<SearchBar />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '검색'});
      const longQuery = 'testQuerytestQuerytestQuerytestQuerytestQuerytestQuerytestQuerytestQuery';

      await user.type(input, longQuery);
      await user.click(button);

      expect(mockValidateSearchQuery).toHaveBeenCalledWith(longQuery);
      expect(mockRouter.asPath).toBe(`/search/${longQuery}`);
    });

    it('특수문자가 포함된 검색어도 URL 인코딩되어 전달된다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(true);

      render(<SearchBar />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', {name: '검색'});

      await user.type(input, 'testQuery&testQuery');
      await user.click(button);

      expect(mockValidateSearchQuery).toHaveBeenCalledWith('testQuery&testQuery');
      expect(mockRouter.asPath).toBe('/search/testQuery&testQuery');
    });

    it('연속으로 여러 번 검색해도 정상 동작한다', async () => {
      const user = userEvent.setup();
      mockValidateSearchQuery.mockReturnValue(true);

      render(<SearchBar />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      const button = screen.getByRole('button', {name: '검색'});

      // 첫 번째 검색
      await user.type(input, 'testQuery');
      await user.click(button);

      expect(mockRouter.asPath).toBe('/search/testQuery');

      // 두 번째 검색
      await user.clear(input);
      await user.type(input, 'test');
      await user.click(button);

      expect(mockRouter.asPath).toBe('/search/test');

      // 세 번째 검색
      await user.clear(input);
      await user.type(input, 'query');
      await user.click(button);

      expect(mockRouter.asPath).toBe('/search/query');
    });
  });
});
