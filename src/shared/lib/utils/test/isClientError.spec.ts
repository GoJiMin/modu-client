import {ClientError} from '../client-error';
import isClientError from '../isClientError';

describe('src/shared/lib/utils/isClientError.ts', () => {
  describe('ClientError 인스턴스 확인', () => {
    it('ERROR_MESSAGE에 존재하는 코드의 ClientError는 true를 반환한다', () => {
      const error = new ClientError('LOGIN_REQUIRED');

      expect(isClientError(error)).toBe(true);
    });

    it('다양한 ERROR_MESSAGE 코드에 대해 true를 반환한다', () => {
      const codes = [
        'INPUT_EMPTY',
        'INPUT_TOO_SHORT',
        'UPLOAD_FAILED',
        'NO_IMAGE_SELECTED',
      ] as const;

      codes.forEach(code => {
        const error = new ClientError(code);
        expect(isClientError(error)).toBe(true);
      });
    });
  });

  describe('다른 타입의 에러 확인', () => {
    it('일반 Error는 false를 반환한다', () => {
      const error = new Error('일반 에러');

      expect(isClientError(error)).toBe(false);
    });

    it('TypeError는 false를 반환한다', () => {
      const error = new TypeError('타입 에러');

      expect(isClientError(error)).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    it('ClientError지만 ERROR_MESSAGE에 없는 name이면 false를 반환한다', () => {
      const error = new ClientError('LOGIN_REQUIRED');
      // name을 임의로 변경하여 ERROR_MESSAGE에 없는 값으로 설정
      (error as unknown as {name: string}).name = 'UNKNOWN_CODE';

      expect(isClientError(error)).toBe(false);
    });
  });
});
