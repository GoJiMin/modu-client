import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBell from '../NotificationBell';
import {useHasNotifications, useSetHasNotifications} from '@/entities/notifications';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';

jest.mock('@/entities/notifications');

const mockUseHasNotifications = useHasNotifications as jest.MockedFunction<typeof useHasNotifications>;
const mockUseSetHasNotifications = useSetHasNotifications as jest.MockedFunction<typeof useSetHasNotifications>;

describe('src/features/notifications/ui/NotificationBell.tsx', () => {
  const mockSetHasNotifications = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSetHasNotifications.mockReturnValue(mockSetHasNotifications);
  });

  it('새로운 알림이 있다면 알림 배지가 표시된다.', () => {
    mockUseHasNotifications.mockReturnValue(true);

    render(<NotificationBell />);

    const link = screen.getByRole('link');
    const badge = link.querySelector('.bg-boldBlue');
    expect(badge).toBeInTheDocument();
  });

  it('알림벨 클릭 시 알림을 읽음 처리한다.', async () => {
    const user = userEvent.setup();
    mockUseHasNotifications.mockReturnValue(true);

    render(<NotificationBell />, {wrapper: MemoryRouterProvider});

    const link = screen.getByRole('link');
    await user.click(link);

    expect(mockSetHasNotifications).toHaveBeenCalledWith(false);
  });

  it('알림벨 클릭 시 알림 페이지로 이동한다.', async () => {
    const user = userEvent.setup();
    mockUseHasNotifications.mockReturnValue(false);

    render(<NotificationBell />, {wrapper: MemoryRouterProvider});

    const link = screen.getByRole('link');
    await user.click(link);

    expect(mockRouter.asPath).toBe('/notifications');
  });

  it('알림이 없다면 알림 배지가 표시되지 않는다.', () => {
    mockUseHasNotifications.mockReturnValue(false);

    render(<NotificationBell />);

    const link = screen.getByRole('link');
    const badge = link.querySelector('.bg-boldBlue');

    expect(badge).not.toBeInTheDocument();
  });
});
