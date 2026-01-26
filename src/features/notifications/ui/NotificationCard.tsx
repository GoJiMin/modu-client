'use client';

import {Notification} from '@/entities/notifications';
import NotificationDeleteButton from './NotificationDeleteButton';
import {NOTIFICATION_CONFIG} from './config/notification-config';
import NotificationItem from './NotificationItem';

type Props = {
  notification: Notification;
  page: number;
};

export default function NotificationCard({notification, page}: Props) {
  const config = NOTIFICATION_CONFIG[notification.type];

  return (
    <>
      <NotificationItem notification={notification} />
      <NotificationDeleteButton
        id={notification.id}
        page={page}
        configTitle={config.title}
        configMessage={config.getMessage(notification.title)}
      />
    </>
  );
}
