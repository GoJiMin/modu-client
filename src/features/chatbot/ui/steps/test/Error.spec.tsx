import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorStep from '../Error';
import {useChatStore} from '@/entities/ai-search';
import {RequestGetError} from '@/shared/apis/request-error';

describe('src/features/chatbot/ui/steps/Error.tsx', () => {
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
  });

  it('RequestGetError를 전달하면 매핑된 서버 에러 메시지를 표시한다.', () => {
    const error = new RequestGetError({
      name: 'SEARCH_FAILED',
      message: '검색 실패',
      status: 500,
      endpoint: '/api/search',
      method: 'GET',
      requestBody: null,
      errorHandlingType: 'errorBoundary',
    });

    render(<ErrorStep error={error} resetErrorBoundary={jest.fn()} />);

    expect(screen.getByText('문제가 생겨 후기를 가져오지 못했어요. 😭')).toBeInTheDocument();
    expect(screen.getByText('검색에 실패했어요. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
  });

  it('다시 시도하기/다른 검색어 입력하기 버튼 동작을 수행한다.', async () => {
    const user = userEvent.setup();
    const resetErrorBoundary = jest.fn();

    render(<ErrorStep error={new Error('unknown')} resetErrorBoundary={resetErrorBoundary} />);

    await user.click(screen.getByRole('button', {name: '다시 시도하기'}));
    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', {name: '다른 검색어 입력하기'}));

    await waitFor(() => {
      expect(resetErrorBoundary).toHaveBeenCalledTimes(2);
      expect(useChatStore.getState().step).toBe('input');
      expect(useChatStore.getState().keyword).toBe('');
    });
  });
});
