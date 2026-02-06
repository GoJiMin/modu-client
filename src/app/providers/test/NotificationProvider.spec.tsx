import {render, screen, act, waitFor} from '@testing-library/react';
import {Toaster} from 'sonner';
import NotificationProvider from '../NotificationProvider';
import {NotificationEvent, useConnectSSE, useHasNotifications} from '@/entities/notifications';

jest.mock('@/entities/notifications', () => ({
  ...jest.requireActual('@/entities/notifications'),
  useConnectSSE: jest.fn(),
}));

const mockUseConnectSSE = useConnectSSE as jest.MockedFunction<typeof useConnectSSE>;

describe('src/features/notification/ui/NotificationProvider.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function TestComponent() {
    const hasNotifications = useHasNotifications();
    return <div>{hasNotifications ? '알림 있음' : '알림 없음'}</div>;
  }

  function RenderTestEnvironment() {
    render(
      <NotificationProvider>
        <TestComponent />
        <Toaster />
      </NotificationProvider>,
    );
  }

  it('연결 이벤트를 수신하면 전역 알림 상태를 업데이트한다.', async () => {
    RenderTestEnvironment();

    expect(mockUseConnectSSE).toHaveBeenCalled();
    const {onMeta} = mockUseConnectSSE.mock.calls[0][0];

    expect(screen.getByText('알림 없음')).toBeInTheDocument();

    // 초기 연결 시 알림이 있는 상태
    act(() => {
      onMeta({hasNotification: true});
    });

    expect(await screen.findByText('알림 있음')).toBeInTheDocument();
  });

  it('알림 이벤트를 수신하면 전역 알림 상태를 변경하고 토스트를 표시한다.', async () => {
    const NOTIFICATION_EVENT: NotificationEvent = {
      id: 5,
      board_id: 5,
      type: 'bookmark',
      title: '오늘 저녁밥 추천',
      isRead: false,
      isDeleted: false,
      created_at: '2026년 2월 6일',
    };

    RenderTestEnvironment();

    const {onMeta, onNotification} = mockUseConnectSSE.mock.calls[0][0];

    // 초기 연결 시 알림이 없는 상태
    act(() => {
      onMeta({hasNotification: false});
    });

    act(() => {
      onNotification(NOTIFICATION_EVENT);
    });

    await waitFor(() => {
      expect(screen.getByText('알림 있음')).toBeInTheDocument();

      // 알림의 각 데이터를 제대로 넘겨줬는지
      expect(screen.getByText('누군가 게시글을 저장했어요.')).toBeInTheDocument();
      expect(screen.getByText(/오늘 저녁밥 추천/)).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/reviews/5');
    });
  });
});
