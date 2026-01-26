import {render, screen} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import NotificationList from '../NotificationList';
import {notificationsStub} from './stub';
import {Notification, useGetNotifications} from '@/entities/notifications';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('next/navigation', () => require('next-router-mock/navigation'));
jest.mock('@/entities/notifications');
jest.mock('../NotificationCard', () => ({
  __esModule: true,
  default: ({notification}: {notification: Notification}) => (
    <div data-testid={`notification-card-${notification.id}`}>{notification.title}</div>
  ),
}));

const mockUseGetNotifications = useGetNotifications as jest.MockedFunction<typeof useGetNotifications>;

describe('src/features/notifications/ui/NotificationList.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  it('알림이 있으면 리스트와 페이지네이션이 렌더링된다.', () => {
    mockUseGetNotifications.mockReturnValue(notificationsStub);

    render(withAllContext(<NotificationList />), {wrapper: MemoryRouterProvider});

    notificationsStub.results.forEach(notification => {
      expect(screen.getByTestId(`notification-card-${notification.id}`)).toBeInTheDocument();
    });

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('URL의 페이지 파라미터를 올바르게 추출한다.', () => {
    mockRouter.push('/test?page=5');
    mockUseGetNotifications.mockReturnValue(notificationsStub);

    render(withAllContext(<NotificationList />), {wrapper: MemoryRouterProvider});

    expect(mockUseGetNotifications).toHaveBeenCalledWith(5);
  });

  it('알림이 없으면 빈 상태 메세지가 표시된다.', () => {
    mockUseGetNotifications.mockReturnValue({
      results: [],
      current_page: 1,
      total_pages: 1,
    });

    render(withAllContext(<NotificationList />), {wrapper: MemoryRouterProvider});

    expect(screen.getByText('아직 알림이 없어요.')).toBeInTheDocument();
    expect(screen.getByText('새로운 알림이 도착하면 여기에서 확인할 수 있어요.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('페이지 파라미터가 없으면 기본값 1을 사용한다.', () => {
    mockUseGetNotifications.mockReturnValue(notificationsStub);

    render(withAllContext(<NotificationList />), {wrapper: MemoryRouterProvider});

    expect(mockUseGetNotifications).toHaveBeenCalledWith(1);
  });
});
