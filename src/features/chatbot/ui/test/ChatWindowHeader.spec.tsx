import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindowHeader from '../ChatWindowHeader';
import {useChatStore} from '@/entities/ai-search';

function resetChatStore() {
  useChatStore.setState({
    isOpen: true,
    step: 'input',
    keyword: '',
    category: 'all',
    result: null,
    limitState: {usage: 0, maxLimit: 3, remaining: 3},
    history: [],
    selectedHistoryId: null,
  });
}

describe('src/features/chatbot/ui/ChatWindowHeader.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetChatStore();
  });

  it('기본 상태에서 저장 기록 버튼과 남은 횟수를 표시한다.', async () => {
    const user = userEvent.setup();

    useChatStore.setState({step: 'input', limitState: {usage: 1, maxLimit: 3, remaining: 2}});

    render(<ChatWindowHeader />);

    expect(screen.getByText('오늘 남은 횟수 2 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '저장 기록 보기'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '저장 기록 보기'}));

    expect(useChatStore.getState().step).toBe('history');
  });

  it('history 단계에서는 검색 이동 버튼과 빨간 사용량 뱃지를 표시한다.', async () => {
    const user = userEvent.setup();

    useChatStore.setState({step: 'history', limitState: {usage: 3, maxLimit: 3, remaining: 0}});

    render(<ChatWindowHeader />);

    const usageBadge = screen.getByText('오늘 남은 횟수 0 / 3');

    expect(screen.getByRole('button', {name: '검색 단계로 이동'})).toBeInTheDocument();
    expect(usageBadge).toHaveClass('bg-red-100');
    expect(usageBadge).toHaveClass('text-red-600');

    await user.click(screen.getByRole('button', {name: '검색 단계로 이동'}));

    expect(useChatStore.getState().step).toBe('input');
  });

  it('닫기 버튼을 누르면 챗봇이 닫힌다.', async () => {
    const user = userEvent.setup();

    useChatStore.setState({isOpen: true});

    render(<ChatWindowHeader />);

    await user.click(screen.getByRole('button', {name: '닫기'}));

    expect(useChatStore.getState().isOpen).toBe(false);
  });
});
