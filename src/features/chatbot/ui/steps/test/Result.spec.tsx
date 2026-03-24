import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Result from '../Result';
import {CHAT_HISTORY_STORAGE_KEY, useChatStore} from '@/entities/ai-search/model/chatStore';
import {getAIReviewSummary} from '@/entities/ai-search/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/ai-search/apis/api-service');
jest.mock('react-multi-carousel', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const mockGetAIReviewSummary = getAIReviewSummary as jest.MockedFunction<typeof getAIReviewSummary>;

describe('src/features/chatbot/ui/steps/Result.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);

    useChatStore.setState({
      isOpen: false,
      step: 'result',
      keyword: 'pizza',
      category: 'all',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
      history: [],
      selectedHistoryId: null,
    });

    mockGetAIReviewSummary.mockResolvedValue({
      status: 'success',
      summary: '피자 토핑이 풍부하고 도우 식감이 좋아요.',
      sources: [
        {
          title: '피자 후기 1',
          snippet: '도우가 쫄깃하고 치즈가 풍부해요.',
          url: 'https://example.com/review/1',
        },
      ],
    });
  });

  it('검색 성공 결과를 표시하고 검색 횟수를 1회 차감한다.', async () => {
    render(withAllContext(<Result />));

    expect(await screen.findByText('피자 토핑이 풍부하고 도우 식감이 좋아요.')).toBeInTheDocument();
    expect(screen.getByText('참고한 리뷰 출처 (1)')).toBeInTheDocument();
    expect(screen.getByText('피자 후기 1')).toBeInTheDocument();

    expect(mockGetAIReviewSummary).toHaveBeenCalledWith('pizza', 'all');

    await waitFor(() => {
      expect(useChatStore.getState().limitState).toEqual({
        usage: 1,
        maxLimit: 1,
        remaining: 0,
      });
    });
  });

  it('다른 검색하기 버튼을 누르면 입력 단계로 돌아간다.', async () => {
    const user = userEvent.setup();

    const TestWrapper = () => {
      const step = useChatStore(state => state.step);
      if (step !== 'result') return <p>{step}</p>;
      return <Result />;
    };

    render(withAllContext(<TestWrapper />));

    await screen.findByText('피자 토핑이 풍부하고 도우 식감이 좋아요.');

    await user.click(screen.getByRole('button', {name: '다른 검색하기'}));

    await waitFor(() => {
      expect(screen.getByText('input')).toBeInTheDocument();

      expect(useChatStore.getState().step).toBe('input');
      expect(useChatStore.getState().keyword).toBe('');
    });
  });

  it('결과 저장하기 버튼을 누르면 히스토리에 저장되고 버튼 문구가 변경된다.', async () => {
    const user = userEvent.setup();

    render(withAllContext(<Result />));

    await screen.findByText('피자 토핑이 풍부하고 도우 식감이 좋아요.');

    await user.click(screen.getByRole('button', {name: '결과 저장하기'}));

    await waitFor(() => {
      const history = useChatStore.getState().history;
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        keyword: 'pizza',
        category: 'all',
      });
    });

    expect(screen.getByRole('button', {name: '히스토리에 저장됨'})).toBeDisabled();
  });

  it('검색 결과 상태가 fail이면 결과 저장하기 버튼을 노출하지 않는다.', async () => {
    mockGetAIReviewSummary.mockResolvedValue({
      status: 'fail',
      summary: '검색 결과가 충분하지 않아요.',
      sources: [],
    });

    render(withAllContext(<Result />));

    expect(await screen.findByText('검색 결과가 충분하지 않아요.')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '결과 저장하기'})).not.toBeInTheDocument();
  });

  it('히스토리 결과를 다시 열면 API 요청 없이 저장된 결과를 표시한다.', async () => {
    useChatStore.setState({
      step: 'result',
      keyword: 'saved-keyword',
      category: 'food',
      result: {
        status: 'success',
        summary: '저장된 결과 요약입니다.',
        sources: [],
      },
      history: [
        {
          id: 'history-1',
          keyword: 'saved-keyword',
          category: 'food',
          result: {
            status: 'success',
            summary: '저장된 결과 요약입니다.',
            sources: [],
          },
          savedAt: Date.now(),
        },
      ],
      selectedHistoryId: 'history-1',
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
    });

    render(withAllContext(<Result />));

    expect(await screen.findByText('저장된 결과 요약입니다.')).toBeInTheDocument();
    expect(mockGetAIReviewSummary).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', {name: '결과 저장하기'})).not.toBeInTheDocument();
    expect(useChatStore.getState().limitState).toEqual({
      usage: 0,
      maxLimit: 1,
      remaining: 1,
    });
  });
});
