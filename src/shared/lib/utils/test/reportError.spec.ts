import {RequestError} from '@/shared/apis/request-error';
import {ClientError} from '../client-error';
import {reportError} from '../reportError';
import {reportErrorToSentry} from '../reportErrorToSentry';

jest.mock('../reportErrorToSentry', () => ({
  reportErrorToSentry: jest.fn(),
}));

jest.mock('../env', () => ({
  isDevelopment: false,
}));

const mockReportErrorToSentry = reportErrorToSentry as jest.MockedFunction<typeof reportErrorToSentry>;

describe('src/shared/lib/utils/reportError.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('개발 환경', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.doMock('../env', () => ({
        isDevelopment: true,
      }));
    });

    afterEach(() => {
      jest.resetModules();
      jest.doMock('../env', () => ({
        isDevelopment: false,
      }));
    });

    it('개발 환경에서는 리포트하지 않는다', async () => {
      const {reportError: reportErrorDev} = await import('../reportError');
      const error = new RequestError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportErrorDev(error);

      expect(mockReportErrorToSentry).not.toHaveBeenCalled();
    });
  });

  describe('클라이언트 에러 처리', () => {
    it('클라이언트에서 발생한 에러는 리포트하지 않는다', () => {
      const error = new ClientError('LOGIN_REQUIRED');

      reportError(error);

      expect(mockReportErrorToSentry).not.toHaveBeenCalled();
    });
  });

  describe('네트워크 에러 처리', () => {
    it('5xx 에러는 심각 단계로 센트리 리포트 함수를 호출한다', () => {
      const error = new RequestError({
        name: 'INTERNAL_SERVER_ERROR',
        message: '서버 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportError(error);

      expect(mockReportErrorToSentry).toHaveBeenCalledWith({
        level: 'fatal',
        error,
        type: 'API',
      });
    });

    it('status 503도 심각 단계로 리포트한다', () => {
      const error = new RequestError({
        name: 'SERVICE_UNAVAILABLE',
        message: '서비스 이용 불가',
        status: 503,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportError(error);

      expect(mockReportErrorToSentry).toHaveBeenCalledWith({
        level: 'fatal',
        error,
        type: 'API',
      });
    });

    it('status 599도 심각 단계로 리포트한다', () => {
      const error = new RequestError({
        name: 'NETWORK_ERROR',
        message: '네트워크 에러',
        status: 599,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportError(error);

      expect(mockReportErrorToSentry).toHaveBeenCalledWith({
        level: 'fatal',
        error,
        type: 'API',
      });
    });

    it('4xx 에러는 리포트하지 않는다', () => {
      const error = new RequestError({
        name: 'NOT_FOUND',
        message: '찾을 수 없음',
        status: 404,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      reportError(error);

      expect(mockReportErrorToSentry).not.toHaveBeenCalled();
    });

    it('status 400도 리포트하지 않는다', () => {
      const error = new RequestError({
        name: 'BAD_REQUEST',
        message: '잘못된 요청',
        status: 400,
        endpoint: '/test',
        method: 'POST',
        requestBody: {data: 'invalid'},
      });

      reportError(error);

      expect(mockReportErrorToSentry).not.toHaveBeenCalled();
    });
  });
});
