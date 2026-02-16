import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import History from '../History';
import {useChatStore} from '@/entities/ai-search';

const historyItemStub = {
  id: 'history-1',
  keyword: '프레드피자',
  category: 'food' as const,
  result: {
    status: 'success' as const,
    summary: '토핑이 풍부하고 가성비가 좋다는 후기가 많아요.',
    sources: [
      {
        title: '프레드피자 후기',
        url: 'https://example.com/reviews/fred-pizza',
        snippet: '치즈가 진하고 양이 넉넉해요.',
      },
    ],
  },
  savedAt: 1739660400000,
};

describe('src/features/chatbot/ui/steps/History.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useChatStore.setState({
      isOpen: false,
      step: 'history',
      keyword: '',
      category: 'all',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
      history: [historyItemStub],
      selectedHistoryId: null,
    });
  });

  it('저장된 히스토리가 없으면 빈 상태 UI를 표시한다.', () => {
    useChatStore.setState({history: []});

    render(<History />);

    expect(screen.getByText(/저장된 결과가 아직 없어요\./)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '검색하러 가기'})).toBeInTheDocument();
  });

  it('히스토리 항목을 누르면 result 단계로 이동하고 선택한 결과를 연다.', async () => {
    const user = userEvent.setup();

    render(<History />);

    await user.click(screen.getByRole('button', {name: '히스토리 열기: 프레드피자'}));

    await waitFor(() => {
      const state = useChatStore.getState();
      expect(state.step).toBe('result');
      expect(state.keyword).toBe('프레드피자');
      expect(state.selectedHistoryId).toBe('history-1');
      expect(state.result?.summary).toBe('토핑이 풍부하고 가성비가 좋다는 후기가 많아요.');
    });
  });

  it('히스토리 삭제 버튼을 누르면 해당 항목이 제거된다.', async () => {
    const user = userEvent.setup();

    render(<History />);

    await user.click(screen.getByRole('button', {name: '히스토리 삭제: 프레드피자'}));

    await waitFor(() => {
      const state = useChatStore.getState();
      expect(state.history).toHaveLength(0);
      expect(state.step).toBe('history');
    });
  });
});
