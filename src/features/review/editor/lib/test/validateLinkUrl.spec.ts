import validateLinkUrl from '../validateLinkUrl';
import {createClientError} from '@/shared/lib/utils/client-error';

describe('src/features/review/editor/lib/validateLinkUrl.ts', () => {
  const mockOnError = jest.fn();
  const defaultCtx = {
    defaultValidate: (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    protocols: ['http', 'https'],
    defaultProtocol: 'https',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('정상 케이스', () => {
    it('유효한 https URL은 true를 반환한다.', () => {
      const result = validateLinkUrl({
        url: 'https://example.com',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(true);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('프로토콜 없는 URL은 https를 추가하여 검증한다.', () => {
      const result = validateLinkUrl({
        url: 'example.com',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(true);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('하위 경로가 있는 https URL은 true를 반환한다.', () => {
      const result = validateLinkUrl({
        url: 'https://example.com/path/to/page',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(true);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('쿼리 파라미터가 있는 https URL은 true를 반환한다.', () => {
      const result = validateLinkUrl({
        url: 'https://example.com?param=value',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(true);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('보안 - 위험한 프로토콜 차단', () => {
    it('javascript: 프로토콜은 false를 반환하고 에러를 호출한다.', () => {
      const result = validateLinkUrl({
        url: 'javascript:alert("XSS")',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_PROTOCOL'));
    });

    it('data: 프로토콜은 false를 반환하고 에러를 호출한다.', () => {
      const result = validateLinkUrl({
        url: 'data:text/html,<script>alert("XSS")</script>',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_PROTOCOL'));
    });

    it('http: 프로토콜은 false를 반환하고 에러를 호출한다.', () => {
      const result = validateLinkUrl({
        url: 'http://example.com',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_PROTOCOL'));
    });

    it('ftp: 프로토콜은 false를 반환하고 에러를 호출한다.', () => {
      const result = validateLinkUrl({
        url: 'ftp://example.com',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_PROTOCOL'));
    });

    it('file: 프로토콜은 false를 반환하고 에러를 호출한다.', () => {
      const result = validateLinkUrl({
        url: 'file:///etc/passwd',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_PROTOCOL'));
    });

    it('mailto: 프로토콜은 false를 반환하고 에러를 호출한다.', () => {
      const result = validateLinkUrl({
        url: 'mailto:test@example.com',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_PROTOCOL'));
    });
  });

  describe('보안 - 상대경로 차단', () => {
    it('./ 로 시작하는 상대경로는 false를 반환하고 에러를 호출한다.', () => {
      const result = validateLinkUrl({
        url: './path/to/page',
        ctx: defaultCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_URL'));
    });
  });

  describe('에러 케이스 - 잘못된 URL', () => {
    it('defaultValidate가 false를 반환하면 false를 반환하고 에러를 호출한다.', () => {
      const customCtx = {
        ...defaultCtx,
        defaultValidate: () => false,
      };

      const result = validateLinkUrl({
        url: 'https://example.com',
        ctx: customCtx,
        onError: mockOnError,
      });

      expect(result).toBe(false);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(createClientError('INVALID_LINK_URL'));
    });
  });
});
