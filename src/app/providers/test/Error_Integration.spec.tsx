import {render, screen, waitFor} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {Toaster} from 'sonner';
import GlobalErrorDetector from '../GlobalErrorDetector';
import UnPredictableErrorBoundary from '../UnPredictableErrorBoundary';
import {useGlobalError} from '@/entities/error';
import {reportError} from '@/shared/lib/utils/reportError';
import {RequestError} from '@/shared/apis/request-error';
import {ERROR_MESSAGE, SERVER_ERROR_MESSAGE} from '@/shared/lib/consts/errorMessage';
import {createClientError} from '@/shared/lib/utils/client-error';
import {reportErrorToSentry} from '@/shared/lib/utils/reportErrorToSentry';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/error');
jest.mock('@/shared/lib/utils/reportError');
jest.mock('@/shared/lib/utils/reportErrorToSentry');

const mockReportError = reportError as jest.MockedFunction<typeof reportError>;
const mockReportErrorToSentry = reportErrorToSentry as jest.MockedFunction<typeof reportErrorToSentry>;
const mockUseGlobalError = useGlobalError as jest.MockedFunction<typeof useGlobalError>;

describe('에러 시나리오 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  function RenderTestEnvironment() {
    render(
      <UnPredictableErrorBoundary>
        <GlobalErrorDetector>
          <div>정상 컨텐츠</div>
          <Toaster />
        </GlobalErrorDetector>
      </UnPredictableErrorBoundary>,
    );
  }

  const createPredictableServerError = (name: string) => {
    return new RequestError({
      name,
      status: 400,
      message: '',
      endpoint: '',
      method: 'POST',
      requestBody: {},
    });
  };

  it('발생한 에러를 보고한다.', async () => {
    const PREDICTABLE_SERVER_ERROR = createPredictableServerError('REVIEW_ID_MISSING');
    mockUseGlobalError.mockReturnValue(PREDICTABLE_SERVER_ERROR);

    RenderTestEnvironment();

    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalled();
      expect(mockReportError).toHaveBeenCalledWith(PREDICTABLE_SERVER_ERROR);
    });
  });

  it('예측 가능한 서버 에러가 발생하면 토스트를 표시한다.', async () => {
    const ERROR_NAME = 'REVIEW_ID_MISSING';
    const PREDICTABLE_SERVER_ERROR = createPredictableServerError(ERROR_NAME);

    mockUseGlobalError.mockReturnValue(PREDICTABLE_SERVER_ERROR);

    RenderTestEnvironment();

    await waitFor(() => {
      expect(screen.getByText('에러가 발생했어요.')).toBeInTheDocument();
      expect(screen.getByText(SERVER_ERROR_MESSAGE[ERROR_NAME])).toBeInTheDocument();
    });
  });

  it('토큰 만료로 인한 세션 에러 발생 시 메인 페이지로 이동한다.', async () => {
    const ERROR_NAME = 'TOKEN_EXPIRED';
    const TOKEN_EXPIRED_ERROR = createPredictableServerError(ERROR_NAME);

    mockRouter.push('/reviews/new');

    mockUseGlobalError.mockReturnValue(TOKEN_EXPIRED_ERROR);

    RenderTestEnvironment();

    await waitFor(() => {
      expect(screen.getByText('에러가 발생했어요.')).toBeInTheDocument();
      expect(screen.getByText(SERVER_ERROR_MESSAGE[ERROR_NAME])).toBeInTheDocument();
    });

    expect(mockRouter.asPath).toBe('/');
  });

  it('OAuth2 로그인 후 이메일 조회 불가로 인한 에러 발생 시 메인 페이지로 이동한다.', async () => {
    const ERROR_NAME = 'EMPTY_USER_EMAIL';
    const INVALID_EMAIL_ERROR = createPredictableServerError(ERROR_NAME);

    mockRouter.push('/reviews/new');

    mockUseGlobalError.mockReturnValue(INVALID_EMAIL_ERROR);

    RenderTestEnvironment();

    await waitFor(() => {
      expect(screen.getByText('에러가 발생했어요.')).toBeInTheDocument();
      expect(screen.getByText(SERVER_ERROR_MESSAGE[ERROR_NAME])).toBeInTheDocument();
    });

    expect(mockRouter.asPath).toBe('/');
  });

  it('클라이언트 검증 에러가 발생하면 토스트를 표시한다.', async () => {
    const ERROR_NAME = 'LOGIN_REQUIRED';
    const CLIENT_ERROR = createClientError(ERROR_NAME);

    mockUseGlobalError.mockReturnValue(CLIENT_ERROR);

    RenderTestEnvironment();

    await waitFor(() => {
      expect(screen.getByText('에러가 발생했어요.')).toBeInTheDocument();
      expect(screen.getByText(ERROR_MESSAGE[ERROR_NAME])).toBeInTheDocument();
    });
  });

  it('예측 불가능한 에러 발생 시 전역 대체 UI를 표시하고 센트리로 에러를 보고한다.', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const UNKNOWN_ERROR = new Error('unknown error');

    mockUseGlobalError.mockReturnValue(UNKNOWN_ERROR as any);

    RenderTestEnvironment();

    expect(screen.getByText('알 수 없는 오류가 발생했어요.')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockReportErrorToSentry).toHaveBeenCalled();
      expect(mockReportErrorToSentry).toHaveBeenCalledWith({
        level: 'fatal',
        error: UNKNOWN_ERROR,
        type: 'Rendering',
      });
    });

    consoleSpy.mockRestore();
  });
});
