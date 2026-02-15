import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';
import {useChatStore} from '@/entities/ai-search';

describe('src/features/chatbot/ui/steps/Input.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useChatStore.setState({
      isOpen: false,
      step: 'input',
      keyword: '',
      category: 'all',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
    });
  });

  it('2글자 미만 키워드 제출 시 유효성 에러 메시지를 표시한다.', async () => {
    const user = userEvent.setup();

    render(<Input />);

    const keywordInput = screen.getByPlaceholderText('예: 아이폰 17 프로, 성심당 튀김소보로');
    await user.type(keywordInput, 'a{enter}');

    expect(await screen.findByText('두 글자 이상은 입력해 주셔야 찾아드릴 수 있어요! 😅')).toBeInTheDocument();
  });

  it('20글자 초과 키워드 제출 시 유효성 에러 메시지를 표시한다.', async () => {
    const user = userEvent.setup();

    render(<Input />);

    const keywordInput = screen.getByPlaceholderText('예: 아이폰 17 프로, 성심당 튀김소보로');
    await user.type(keywordInput, `${'a'.repeat(21)}{enter}`);

    expect(await screen.findByText('너무 길어요! 20자 이내로 줄여주세요.')).toBeInTheDocument();
  });

  it('유효한 키워드 제출 시 keyword를 저장하고 search 단계로 전환한다.', async () => {
    const user = userEvent.setup();

    render(<Input />);

    const keywordInput = screen.getByPlaceholderText('예: 아이폰 17 프로, 성심당 튀김소보로');
    await user.type(keywordInput, 'pizza{enter}');

    await waitFor(() => {
      expect(useChatStore.getState().keyword).toBe('pizza');
      expect(useChatStore.getState().step).toBe('search');
    });
  });
});
