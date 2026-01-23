import {ERROR_MESSAGE} from '../../consts/errorMessage';
import {ClientError, createClientError} from '../client-error';

describe('src/shared/lib/utils/client-error.ts', () => {
  describe('ClientError 클래스', () => {
    it('에러 코드에 맞는 메시지로 생성된다', () => {
      const error = new ClientError('LOGIN_REQUIRED');

      expect(error.message).toBe(ERROR_MESSAGE.LOGIN_REQUIRED);
    });

    it('name 속성이 에러 코드로 설정된다', () => {
      const error = new ClientError('INPUT_EMPTY');

      expect(error.name).toBe('INPUT_EMPTY');
    });

    it('Error를 상속한다', () => {
      const error = new ClientError('LOGIN_REQUIRED');

      expect(error instanceof Error).toBe(true);
    });

    it('다양한 에러 코드에 대해 올바른 메시지를 설정한다', () => {
      const testCases = [
        {code: 'INPUT_TOO_SHORT' as const, expected: ERROR_MESSAGE.INPUT_TOO_SHORT},
        {code: 'INPUT_TOO_LONG' as const, expected: ERROR_MESSAGE.INPUT_TOO_LONG},
        {code: 'UPLOAD_FAILED' as const, expected: ERROR_MESSAGE.UPLOAD_FAILED},
        {code: 'NO_IMAGE_SELECTED' as const, expected: ERROR_MESSAGE.NO_IMAGE_SELECTED},
        {code: 'TOO_MANY_IMAGES_SELECTED' as const, expected: ERROR_MESSAGE.TOO_MANY_IMAGES_SELECTED},
      ];

      testCases.forEach(({code, expected}) => {
        const error = new ClientError(code);
        expect(error.message).toBe(expected);
        expect(error.name).toBe(code);
      });
    });
  });

  describe('createClientError 함수', () => {
    it('ClientError 인스턴스를 반환한다', () => {
      const error = createClientError('LOGIN_REQUIRED');

      expect(error instanceof ClientError).toBe(true);
    });

    it('올바른 에러 코드와 메시지를 가진 인스턴스를 생성한다', () => {
      const error = createClientError('INPUT_EMPTY');

      expect(error.name).toBe('INPUT_EMPTY');
      expect(error.message).toBe(ERROR_MESSAGE.INPUT_EMPTY);
    });
  });
});
