import {render, screen, waitForElementToBeRemoved} from '@testing-library/react';
import ChatWindow from '../ChatWindow';
import {useChatStore} from '@/entities/ai-search';
import {CATEGORY_LIST} from '@/entities/review';
import {getAIReviewSummary} from '@/entities/ai-search/apis/api-service';
import {RequestGetError} from '@/shared/apis/request-error';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/features/auth', () => ({
  LoginButton: () => <button>로그인</button>,
}));
jest.mock('@/entities/ai-search/apis/api-service');
jest.mock('react-multi-carousel', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const mockGetAIReviewSummary = getAIReviewSummary as jest.MockedFunction<typeof getAIReviewSummary>;

describe('src/features/chatbot/ui/ChatWindow.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useChatStore.setState({
      isOpen: false,
      step: 'input',
      keyword: '',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
    });
  });
  it('챗봇 사용량 정보가 헤더에 표시된다.', () => {
    render(<ChatWindow />);

    expect(screen.getByText('오늘 남은 횟수 1 / 1')).toBeInTheDocument();
  });

  describe('단계별 UI 렌더링 테스트', () => {
    it('입력(input) 단계', () => {
      useChatStore.setState({step: 'input'});

      render(<ChatWindow />);

      expect(screen.getByText('궁금한 제품의 후기를 요약해 드릴게요.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('예: 아이폰 17 프로, 성심당 튀김소보로')).toBeInTheDocument();
    });

    it('질문(ask) 단계', () => {
      useChatStore.setState({step: 'ask', keyword: 'pizza'});

      render(<ChatWindow />);

      expect(screen.getByText('pizza', {exact: false})).toBeInTheDocument();
      expect(screen.getByText('제가 대신 검색해서 요약해 드릴 수 있어요!')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '네, 찾아주세요!'})).toBeInTheDocument();
    });

    it('검색(search) 단계', () => {
      useChatStore.setState({step: 'search', keyword: 'pizza'});

      render(<ChatWindow />);

      expect(screen.getByText('pizza', {exact: false})).toBeInTheDocument();
      // '전체' 카테고리 제외
      expect(screen.getAllByRole('listitem')).toHaveLength(CATEGORY_LIST.length - 1);
    });

    describe('결과(result) 단계', () => {
      it('검색 중 로딩 상태가 표시된다.', async () => {
        let resolveGetAIReviewSummary: any;
        mockGetAIReviewSummary.mockImplementation(() => {
          return new Promise(resolve => {
            resolveGetAIReviewSummary = resolve;
          });
        });

        useChatStore.setState({step: 'result', keyword: 'pizza', category: 'all'});

        render(withAllContext(<ChatWindow />));

        expect(screen.getByText('"pizza" 리뷰를 찾고 있어요..')).toBeInTheDocument();
        expect(screen.getByText('평균 4~5초 정도 소요 돼요.')).toBeInTheDocument();

        resolveGetAIReviewSummary!({
          status: 'success',
          summary: '피자 리뷰 요약입니다.',
          sources: [],
        });

        await waitForElementToBeRemoved(() => screen.queryByText('"pizza" 리뷰를 찾고 있어요..'));
      });

      it('검색 실패 시 에러 UI를 표시한다.', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockGetAIReviewSummary.mockRejectedValue(
          new RequestGetError({
            name: 'SEARCH_FAILED',
            message: '검색 실패',
            status: 500,
            endpoint: '/api/search',
            method: 'GET',
            requestBody: null,
          }),
        );

        useChatStore.setState({step: 'result', keyword: 'pizza', category: 'all'});

        render(withAllContext(<ChatWindow />));

        expect(await screen.findByText('문제가 생겨 후기를 가져오지 못했어요. 😭')).toBeInTheDocument();
        expect(screen.getByText('검색에 실패했어요. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: '다시 시도하기'})).toBeInTheDocument();

        consoleSpy.mockRestore();
      });

      it('검색 성공 시 결과 화면을 표시한다.', async () => {
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

        useChatStore.setState({step: 'result', keyword: 'pizza', category: 'all'});

        render(withAllContext(<ChatWindow />));

        expect(await screen.findByText('피자 토핑이 풍부하고 도우 식감이 좋아요.')).toBeInTheDocument();

        expect(screen.getByText('참고한 리뷰 출처 (1)')).toBeInTheDocument();
        expect(screen.getByText('피자 후기 1')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: '다른 검색하기'})).toBeInTheDocument();
      });
    });
  });

  describe('챗봇 사용량 도달', () => {
    it('비로그인 사용자는 로그인 유도 버튼을 표시한다.', () => {
      useChatStore.setState({
        limitState: {usage: 1, maxLimit: 1, remaining: 0},
      });

      render(<ChatWindow />);

      expect(screen.getByText('오늘 남은 횟수 0 / 1')).toBeInTheDocument();
      expect(screen.getByText(/로그인하시면/)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '로그인'})).toBeInTheDocument();
    });

    it('로그인 사용자는 안내 문구만 표시한다.', () => {
      useChatStore.setState({
        limitState: {usage: 3, maxLimit: 3, remaining: 0},
      });

      render(<ChatWindow />);

      expect(screen.getByText('오늘 남은 횟수 0 / 3')).toBeInTheDocument();
      expect(screen.getByText('내일 다시 오시면 제가 다시 열심히 찾아드릴게요!')).toBeInTheDocument();
    });
  });
});
