import {render, screen} from '@testing-library/react';
import NotificationItem from '../NotificationItem';
import {NOTIFICATION_CONFIG} from '../config/notification-config';
import {Notification} from '@/entities/notifications';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('next/navigation', () => require('next-router-mock/navigation'));
jest.mock('@/shared/ui/icons', () => ({
  LucideIcon: ({name}: {name: string}) => <div>{name}</div>,
}));

describe('src/features/notifications/ui/NotificationItem.tsx', () => {
  const defaultNotificationStub: Notification = {
    id: 1,
    board_id: 1,
    isRead: true,
    isDeleted: false,
    title: '테스트',
    created_at: '2026년 1월 24일',
    type: 'bookmark',
  };

  it('컴포넌트가 렌더링된다.', () => {
    const notification = defaultNotificationStub;
    const config = NOTIFICATION_CONFIG[notification.type];
    const ariaLabel = `${notification.title} 게시글로 이동`;

    render(withAllContext(<NotificationItem notification={notification} />));

    expect(screen.getByLabelText(ariaLabel, {selector: 'button'})).toBeInTheDocument();
    expect(screen.getByText(config.title)).toBeInTheDocument();
    expect(screen.getByText(config.getMessage(notification.title))).toBeInTheDocument();
    expect(screen.getByText(notification.created_at));
  });

  it('북마크 타입의 알림이 렌더링된다.', () => {
    const type = 'bookmark' as const;
    const bookmarkNotification = {
      ...defaultNotificationStub,
      type,
    };
    const config = NOTIFICATION_CONFIG[type];

    render(withAllContext(<NotificationItem notification={bookmarkNotification} />));

    const icon = screen.getByText(config.icon);

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass(config.bgColor);
  });

  it('댓글 타입의 알림이 렌더링된다.', () => {
    const type = 'comment' as const;
    const bookmarkNotification = {
      ...defaultNotificationStub,
      type,
    };
    const config = NOTIFICATION_CONFIG[type];

    render(withAllContext(<NotificationItem notification={bookmarkNotification} />));

    const icon = screen.getByText(config.icon);

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass(config.bgColor);
  });

  it('읽지 않은 알림은 배경 색을 흰색으로 표시한다.', () => {
    const notification = {
      ...defaultNotificationStub,
      isRead: false,
    };
    const ariaLabel = `${notification.title} 게시글로 이동`;

    render(withAllContext(<NotificationItem notification={notification} />));

    const button = screen.getByLabelText(ariaLabel, {selector: 'button'});

    expect(button).toHaveClass('bg-white');
  });

  it('이미 읽은 알림은 배경 색을 회색으로 표시한다.', () => {
    const notification = {
      ...defaultNotificationStub,
      isRead: true,
    };
    const ariaLabel = `${notification.title} 게시글로 이동`;

    render(withAllContext(<NotificationItem notification={notification} />));

    const button = screen.getByLabelText(ariaLabel, {selector: 'button'});

    expect(button).toHaveClass('bg-gray-200');
  });
});
