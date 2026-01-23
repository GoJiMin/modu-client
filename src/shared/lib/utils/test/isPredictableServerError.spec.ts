import {RequestError} from '@/shared/apis/request-error';
import {ClientError} from '../client-error';
import isPredictableServerError from '../isPredictableServerError';

describe('src/shared/lib/utils/isPredictableServerError.ts', () => {
  describe('SERVER_ERROR_MESSAGE에 존재하는 RequestError', () => {
    it('FORBIDDEN 에러는 true를 반환한다', () => {
      const error = new RequestError({
        name: 'FORBIDDEN',
        message: '접근 권한이 없어요.',
        status: 403,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      expect(isPredictableServerError(error)).toBe(true);
    });

    it('UNAUTHORIZED 에러는 true를 반환한다', () => {
      const error = new RequestError({
        name: 'UNAUTHORIZED',
        message: '로그인이 필요해요.',
        status: 401,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      expect(isPredictableServerError(error)).toBe(true);
    });

    it('BOARD_ID_NOT_FOUND 에러는 true를 반환한다', () => {
      const error = new RequestError({
        name: 'BOARD_ID_NOT_FOUND',
        message: '해당 후기를 찾을 수 없어요.',
        status: 404,
        endpoint: '/reviews/123',
        method: 'GET',
        requestBody: null,
      });

      expect(isPredictableServerError(error)).toBe(true);
    });
  });

  describe('SERVER_ERROR_MESSAGE에 없는 RequestError', () => {
    it('알 수 없는 에러 코드는 false를 반환한다', () => {
      const error = new RequestError({
        name: 'UNKNOWN_ERROR_CODE',
        message: '알 수 없는 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      expect(isPredictableServerError(error)).toBe(false);
    });
  });

  describe('RequestError가 아닌 에러', () => {
    it('일반 Error는 false를 반환한다', () => {
      const error = new Error('일반 에러');

      expect(isPredictableServerError(error)).toBe(false);
    });

    it('ClientError는 false를 반환한다', () => {
      const error = new ClientError('LOGIN_REQUIRED');

      expect(isPredictableServerError(error)).toBe(false);
    });

    it('TypeError는 false를 반환한다', () => {
      const error = new TypeError('타입 에러');

      expect(isPredictableServerError(error)).toBe(false);
    });
  });
});
