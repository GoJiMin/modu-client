import {RequestError} from '@/shared/apis/request-error';
import {captureException, withScope} from '@sentry/nextjs';
import {reportErrorToSentry} from '../reportErrorToSentry';

jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((callback: (scope: unknown) => void) => {
    const mockScope = {
      setLevel: jest.fn(),
      setTag: jest.fn(),
      setTags: jest.fn(),
    };
    callback(mockScope);
  }),
  captureException: jest.fn(),
}));

const mockWithScope = withScope as jest.MockedFunction<typeof withScope>;
const mockCaptureException = captureException as jest.MockedFunction<typeof captureException>;

describe('src/shared/lib/utils/reportErrorToSentry.ts', () => {
  let mockScope: {
    setLevel: jest.Mock;
    setTag: jest.Mock;
    setTags: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockScope = {
      setLevel: jest.fn(),
      setTag: jest.fn(),
      setTags: jest.fn(),
    };
    (mockWithScope as jest.Mock).mockImplementation((callback: (scope: typeof mockScope) => void) => {
      callback(mockScope);
    });
  });

  describe('네트워크 에러 처리', () => {
    it('네트워크 에러에 대해 올바른 심각 단계를 설정한다', () => {
      const error = new RequestError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportErrorToSentry({error, level: 'fatal', type: 'API'});

      expect(mockScope.setLevel).toHaveBeenCalledWith('fatal');
    });

    it('네트워크 에러에 대해 에러 타입 태그를 설정한다', () => {
      const error = new RequestError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportErrorToSentry({error, type: 'API'});

      expect(mockScope.setTag).toHaveBeenCalledWith('error_type', 'API - TEST_ERROR');
    });

    it('네트워크 에러에 대해 모든 태그를 설정한다', () => {
      const requestBody = {data: 'test'};
      const error = new RequestError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'POST',
        requestBody,
      });

      reportErrorToSentry({error, type: 'API'});

      expect(mockScope.setTags).toHaveBeenCalledWith({
        title: 'TEST_ERROR',
        message: '테스트 에러',
        endpoint: '/test',
        status: 500,
        requestBody: JSON.stringify(requestBody),
        method: 'POST',
      });
    });

    it('요청 본문이 null인 경우에도 파싱한다', () => {
      const error = new RequestError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportErrorToSentry({error, type: 'API'});

      expect(mockScope.setTags).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: 'null',
        }),
      );
    });
  });

  describe('렌더링 에러 처리', () => {
    it('렌더링 에러에 대해 기본 태그만 설정한다', () => {
      const error = new Error('렌더링 에러');
      error.name = 'GeneralError';

      reportErrorToSentry({error, type: 'Rendering'});

      expect(mockScope.setTags).toHaveBeenCalledWith({
        title: 'GeneralError',
        message: '렌더링 에러',
      });
    });

    it('렌더링 에러에 대해 에러 타입 태그를 설정한다', () => {
      const error = new Error('렌더링 에러');
      error.name = 'RenderError';

      reportErrorToSentry({error, type: 'Rendering'});

      expect(mockScope.setTag).toHaveBeenCalledWith('error_type', 'Rendering - RenderError');
    });
  });

  describe('심각 단계 기본값', () => {
    it('심각 단계를 지정하지 않으면 기본값 error를 사용한다', () => {
      const error = new Error('테스트');

      reportErrorToSentry({error, type: 'Rendering'});

      expect(mockScope.setLevel).toHaveBeenCalledWith('error');
    });
  });

  describe('captureException 호출', () => {
    it('captureException이 에러와 함께 호출된다', () => {
      const error = new RequestError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportErrorToSentry({error, type: 'API'});

      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    it('렌더링 에러도 captureException이 호출된다', () => {
      const error = new Error('일반 에러');

      reportErrorToSentry({error, type: 'Rendering'});

      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });
  });
});
