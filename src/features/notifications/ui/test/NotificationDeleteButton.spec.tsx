import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationDeleteButton from '../NotificationDeleteButton';
import {useDeleteNotification} from '@/entities/notifications';
import {unReadNotificationStub} from './stub';
import {NOTIFICATION_CONFIG} from '../config/notification-config';

jest.mock('@/entities/notifications');

const mockUseDeleteNotification = useDeleteNotification as jest.MockedFunction<typeof useDeleteNotification>;
const mockDeleteNotificationFn = jest.fn();

describe('src/features/notifications/ui/NotificationDeleteButton.tsx', () => {
  const page = 1;
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDeleteNotification.mockReturnValue({
      deleteNotification: mockDeleteNotificationFn,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteNotification>);
  });

  it('컴포넌트가 렌더링되고 버튼이 활성화된다.', async () => {
    const notification = unReadNotificationStub;
    const config = NOTIFICATION_CONFIG[notification.type];

    const ariaLabel = `${config.title} - ${config.getMessage(notification.title)} 알림 삭제`;

    render(
      <NotificationDeleteButton
        id={notification.id}
        page={page}
        configTitle={config.title}
        configMessage={config.getMessage(notification.title)}
      />,
    );

    const button = screen.getByLabelText(ariaLabel, {selector: 'button'});
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('삭제 버튼을 클릭하면 알림 삭제 요청을 보낸다.', async () => {
    const user = userEvent.setup();
    const notification = unReadNotificationStub;
    const config = NOTIFICATION_CONFIG[notification.type];

    const ariaLabel = `${config.title} - ${config.getMessage(notification.title)} 알림 삭제`;

    render(
      <NotificationDeleteButton
        id={notification.id}
        page={page}
        configTitle={config.title}
        configMessage={config.getMessage(notification.title)}
      />,
    );

    const button = screen.getByLabelText(ariaLabel, {selector: 'button'});
    await user.click(button);

    expect(mockDeleteNotificationFn).toHaveBeenCalledTimes(1);
    expect(mockDeleteNotificationFn).toHaveBeenCalledWith({
      notificationId: notification.id,
      page,
    });
  });

  it('삭제 중일 때는 버튼이 비활성화 된다.', async () => {
    mockUseDeleteNotification.mockReturnValue({
      deleteNotification: mockDeleteNotificationFn,
      isPending: true,
    } as unknown as ReturnType<typeof useDeleteNotification>);

    const user = userEvent.setup();
    const notification = unReadNotificationStub;
    const config = NOTIFICATION_CONFIG[notification.type];

    const ariaLabel = `${config.title} - ${config.getMessage(notification.title)} 알림 삭제`;

    render(
      <NotificationDeleteButton
        id={notification.id}
        page={page}
        configTitle={config.title}
        configMessage={config.getMessage(notification.title)}
      />,
    );

    const button = screen.getByLabelText(ariaLabel, {selector: 'button'});
    await user.click(button);

    expect(mockDeleteNotificationFn).toHaveBeenCalledTimes(0);
    expect(button).toBeDisabled();
  });
});
