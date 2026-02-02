'use client';

import {Notification} from '@/entities/notifications';
import NotificationDeleteButton from './NotificationDeleteButton';
import NotificationItem from './NotificationItem';

type Props = {
  notification: Notification;
  page: number;
};

export default function NotificationCard({notification, page}: Props) {
  return (
    <>
      <NotificationItem notification={notification} />
      <NotificationDeleteButton id={notification.id} page={page} notificationTitle={notification.title} />
    </>
  );
}
