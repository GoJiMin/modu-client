import {preflightNotifications} from '../../apis/api-service';
import {tokenRefresh} from '@/entities/auth/apis/api-service';
import {useIsLoggedIn} from '@/entities/auth';
import {useUpdateGlobalError} from '@/entities/error';
import {renderHook, waitFor} from '@testing-library/react';
import {useConnectSSE} from '../useConectSSE';

jest.mock('../../apis/api-service');
jest.mock('@/entities/auth/apis/api-service');
jest.mock('@/entities/auth');
jest.mock('@/entities/error');

const mockPreflightNotifications = preflightNotifications as jest.MockedFunction<typeof preflightNotifications>;
const mockTokenRefresh = tokenRefresh as jest.MockedFunction<typeof tokenRefresh>;
const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;
const mockUseUpdateGlobalError = useUpdateGlobalError as jest.MockedFunction<typeof useUpdateGlobalError>;

describe('src/features/notification/lib/useConnectSSE.ts', () => {
  let mockEventSource: any;
  const originalEventSource = global.EventSource;

  const mockOnMeta = jest.fn();
  const mockOnNotification = jest.fn();
  const mockUpdateGlobalError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseIsLoggedIn.mockReturnValue(true);
    mockUseUpdateGlobalError.mockReturnValue(mockUpdateGlobalError);

    mockEventSource = {
      addEventListener: jest.fn(),
      close: jest.fn(),
    };

    global.EventSource = jest.fn(() => mockEventSource) as unknown as typeof EventSource;
  });

  afterEach(() => {
    global.EventSource = originalEventSource;
  });

  describe('정상 연결 테스트', () => {
    it('로그인 상태이고 사전 요청에 성공하면 SSE를 연결한다.', async () => {
      mockPreflightNotifications.mockResolvedValue({ok: true} as Response);

      renderHook(() =>
        useConnectSSE({
          onMeta: mockOnMeta,
          onNotification: mockOnNotification,
        }),
      );

      await waitFor(() => {
        expect(global.EventSource).toHaveBeenCalledTimes(1);
      });

      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('meta', expect.any(Function));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('notification', expect.any(Function));
    });

    it('이벤트가 수신되면 콜백 함수를 실행한다.', async () => {
      mockPreflightNotifications.mockResolvedValue({ok: true} as Response);

      const eventMap: Record<string, (e: any) => void> = {};
      mockEventSource.addEventListener.mockImplementation((event: string, callback: any) => {
        eventMap[event] = callback;
      });

      renderHook(() =>
        useConnectSSE({
          onMeta: mockOnMeta,
          onNotification: mockOnNotification,
        }),
      );

      await waitFor(() => {
        expect(eventMap['notification']).toBeDefined();
        expect(eventMap['meta']).toBeDefined();
      });

      const mockEventData = {id: 1, message: '테스트 알림'};
      eventMap['notification']({data: JSON.stringify(mockEventData)});
      eventMap['meta']({data: JSON.stringify(mockEventData)});

      expect(mockOnNotification).toHaveBeenCalledWith(mockEventData);
      expect(mockOnMeta).toHaveBeenCalledWith(mockEventData);
    });
  });

  describe('엣지 케이스', () => {
    it('사전 요청이 인증 실패한 경우 토큰 갱신을 시도하고 성공 시 SSE를 연결한다.', async () => {
      mockPreflightNotifications.mockResolvedValue({ok: false, status: 401} as Response);
      mockTokenRefresh.mockResolvedValue({ok: true} as Response);

      renderHook(() =>
        useConnectSSE({
          onMeta: mockOnMeta,
          onNotification: mockOnNotification,
        }),
      );

      await waitFor(() => {
        expect(mockTokenRefresh).toHaveBeenCalledTimes(1);
        expect(global.EventSource).toHaveBeenCalledTimes(1);
      });
    });

    it('사전 요청이 인증 외 이유로 실패한 경우 바로 에러를 발생시킨다.', async () => {
      mockPreflightNotifications.mockResolvedValue({
        ok: false,
        json: () => new Promise(resolve => resolve({title: 'TEST_ERROR', detail: '테스트 에러', status: 500})),
        status: 500,
      } as Response);

      renderHook(() =>
        useConnectSSE({
          onMeta: mockOnMeta,
          onNotification: mockOnNotification,
        }),
      );

      await waitFor(() => {
        expect(mockUpdateGlobalError).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'TEST_ERROR',
            message: '테스트 에러',
            status: 500,
          }),
        );
      });
    });

    it('토큰 갱신에 실패하면 TOKEN_EXPIRED 에러를 발생시킨다.', async () => {
      mockPreflightNotifications.mockResolvedValue({ok: false, status: 401} as Response);
      mockTokenRefresh.mockResolvedValue({ok: false} as Response);

      renderHook(() =>
        useConnectSSE({
          onMeta: mockOnMeta,
          onNotification: mockOnNotification,
        }),
      );

      await waitFor(() => {
        expect(mockUpdateGlobalError).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'TOKEN_EXPIRED',
            status: 401,
          }),
        );
      });
    });
  });

  describe('연결 해제', () => {
    it('컴포넌트가 언마운트되면 연결을 닫는다.', async () => {
      mockPreflightNotifications.mockResolvedValue({ok: true} as Response);

      const {unmount} = renderHook(() =>
        useConnectSSE({
          onMeta: mockOnMeta,
          onNotification: mockOnNotification,
        }),
      );

      await waitFor(() => {
        expect(global.EventSource).toHaveBeenCalled();
      });

      unmount();

      expect(mockEventSource.close).toHaveBeenCalledTimes(1);
    });
  });
});
