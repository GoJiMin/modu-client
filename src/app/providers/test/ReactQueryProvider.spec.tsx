import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useQuery, useMutation} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';
import ReactQueryProvider from '../ReactQueryProvider';
import {useUpdateGlobalError} from '@/entities/error';
import {RequestError, RequestGetError} from '@/shared/apis/request-error';

jest.mock('@/entities/error');

const mockUseUpadateGlobalError = useUpdateGlobalError as jest.MockedFunction<typeof useUpdateGlobalError>;

describe('src/app/providers/ReactQueryProvider.tsx', () => {
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUpdateError = jest.fn();
  mockUseUpadateGlobalError.mockReturnValue(mockUpdateError);

  function FailGetQueryComponent({error}: {error: Error}) {
    const {isError} = useQuery({
      queryKey: ['test-query'],
      queryFn: () => {
        throw error;
      },
    });

    return <div>{isError ? '에러 발생' : '로딩 중'}</div>;
  }

  it('전역 상태로 처리할 읽기 요청 중 발생한 에러는 전역 에러로 처리한다.', async () => {
    const REQUEST_ERROR = new RequestGetError({
      name: 'GLOBAL_ERROR',
      message: '전역 에러',
      status: 400,
      endpoint: '',
      method: 'GET',
      requestBody: null,
      errorHandlingType: 'toast',
    });

    render(
      <ReactQueryProvider>
        <FailGetQueryComponent error={REQUEST_ERROR} />
      </ReactQueryProvider>,
    );

    expect(await screen.findByText('에러 발생')).toBeInTheDocument();

    // 전역 상태로 공유했는지
    expect(mockUpdateError).toHaveBeenCalledTimes(1);
    expect(mockUpdateError).toHaveBeenCalledWith(REQUEST_ERROR);
  });

  it('대체 UI로 처리할 읽기 요청 중 에러 발생 시 전역 에러로 처리하지 않고 상위로 전파한다.', async () => {
    const BOUNDARY_ERROR = new RequestGetError({
      name: 'BOUNDARY_ERROR',
      message: '바운더리 에러',
      status: 404,
      endpoint: '',
      method: 'GET',
      requestBody: null,
      errorHandlingType: 'errorBoundary',
    });

    render(
      <ReactQueryProvider>
        <ErrorBoundary fallback={<div>대체 UI</div>}>
          <FailGetQueryComponent error={BOUNDARY_ERROR} />
        </ErrorBoundary>
      </ReactQueryProvider>,
    );

    // 상위로 전파되어 대체 UI가 표시되는지
    await waitFor(() => {
      expect(screen.getByText('대체 UI')).toBeInTheDocument();
    });

    // 전역 상태로 공유되지 않았는지
    expect(mockUpdateError).not.toHaveBeenCalled();
  });

  it('쓰기 요청 중 에러 발생 시 전역 에러로 처리한다.', async () => {
    function FailMutationComponent({error}: {error: Error}) {
      const {mutate} = useMutation({
        mutationFn: async () => {
          throw error;
        },
      });

      return <button onClick={() => mutate()}>쓰기 요청 실행</button>;
    }

    const user = userEvent.setup();

    const MUTATION_ERROR = new RequestError({
      name: 'MUTATION_ERROR',
      message: '쓰기 에러',
      status: 500,
      endpoint: '/api/post',
      method: 'POST',
      requestBody: {data: 'test'},
    });

    render(
      <ReactQueryProvider>
        <FailMutationComponent error={MUTATION_ERROR} />
      </ReactQueryProvider>,
    );

    await user.click(screen.getByRole('button', {name: '쓰기 요청 실행'}));

    // 전역 상태로 공유했는지
    expect(mockUpdateError).toHaveBeenCalledTimes(1);
    expect(mockUpdateError).toHaveBeenCalledWith(MUTATION_ERROR);
  });
});
