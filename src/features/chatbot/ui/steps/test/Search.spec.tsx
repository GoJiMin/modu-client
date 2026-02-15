import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from '../Search';
import {useChatStore} from '@/entities/ai-search';

describe('src/features/chatbot/ui/steps/Search.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useChatStore.setState({
      isOpen: false,
      step: 'search',
      keyword: 'pizza',
      category: 'all',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
    });
  });

  it('초기 카테고리(all)에서는 분석 시작하기 버튼이 비활성화된다.', () => {
    render(<Search />);

    expect(screen.getByRole('button', {name: '분석 시작하기'})).toBeDisabled();
  });

  it('카테고리 선택 후 분석 시작하기를 누르면 result 단계로 전환한다.', async () => {
    const user = userEvent.setup();

    render(<Search />);

    await user.click(screen.getByRole('button', {name: '카테고리: 음식'}));

    await waitFor(() => {
      expect(useChatStore.getState().category).toBe('food');
      expect(screen.getByRole('button', {name: '분석 시작하기'})).toBeEnabled();
    });

    await user.click(screen.getByRole('button', {name: '분석 시작하기'}));

    await waitFor(() => {
      expect(useChatStore.getState().step).toBe('result');
    });
  });
});
