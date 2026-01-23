import {RequestError, RequestGetError} from '@/shared/apis/request-error';
import isRequestError from '../isRequestError';

describe('src/shared/lib/utils/isRequestError.ts', () => {
  describe('RequestError 인스턴스 확인', () => {
    it('RequestError 인스턴스는 true를 반환한다', () => {
      const error = new RequestError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      });

      expect(isRequestError(error)).toBe(true);
    });

    it('RequestGetError 인스턴스는 true를 반환한다', () => {
      const error = new RequestGetError({
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 404,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
        errorHandlingType: 'toast',
      });

      expect(isRequestError(error)).toBe(true);
    });
  });

  describe('다른 타입의 에러 확인', () => {
    it('일반 Error는 false를 반환한다', () => {
      const error = new Error('일반 에러');

      expect(isRequestError(error)).toBe(false);
    });

    it('TypeError는 false를 반환한다', () => {
      const error = new TypeError('타입 에러');

      expect(isRequestError(error)).toBe(false);
    });

    it('유사 객체(duck typing)는 false를 반환한다', () => {
      const fakeError = {
        name: 'TEST_ERROR',
        message: '테스트 에러',
        status: 500,
        endpoint: '/test',
        method: 'GET',
        requestBody: null,
      } as unknown as Error;

      expect(isRequestError(fakeError)).toBe(false);
    });
  });
});
