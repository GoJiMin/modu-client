import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Result from '../Result';
import {useChatStore} from '@/entities/ai-search';
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

    useChatStore.setState({
      isOpen: false,
      step: 'result',
      keyword: 'pizza',
      category: 'all',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
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

    render(withAllContext(<Result />));

    await screen.findByText('피자 토핑이 풍부하고 도우 식감이 좋아요.');

    await user.click(screen.getByRole('button', {name: '다른 검색하기'}));

    await waitFor(() => {
      expect(useChatStore.getState().step).toBe('input');
      expect(useChatStore.getState().keyword).toBe('');
    });
  });
});
