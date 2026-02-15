import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Ask from '../Ask';
import {useChatStore} from '@/entities/ai-search';

describe('src/features/chatbot/ui/steps/Ask.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useChatStore.setState({
      isOpen: false,
      step: 'ask',
      keyword: 'pizza',
      category: 'all',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
    });
  });

  it('keyword를 표시하고 버튼 클릭 시 search 단계로 전환한다.', async () => {
    const user = userEvent.setup();

    render(<Ask />);

    expect(screen.getByText('pizza', {exact: false})).toBeInTheDocument();
    expect(screen.getByText('제가 대신 검색해서 요약해 드릴 수 있어요!')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '네, 찾아주세요!'}));

    await waitFor(() => {
      expect(useChatStore.getState().step).toBe('search');
    });
  });
});
