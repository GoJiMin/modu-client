'use client';

import {useCallback} from 'react';
import {MetaEvent, NotificationEvent, useConnectSSE, useSetHasNotifications} from '@/entities/notifications';
import toast from '@/shared/ui/toast';

type Props = {
  children: React.ReactNode;
};

export default function NotificationProvider({children}: Props) {
  const setHasNotification = useSetHasNotifications();

  const handleMeta = useCallback(
    (data: MetaEvent) => {
      setHasNotification(data.hasNotification);
    },
    [setHasNotification],
  );

  const handleNotification = useCallback(
    (data: NotificationEvent) => {
      setHasNotification(true);
      toast.notification({
        title: data.title,
        type: data.type,
        board_id: data.board_id,
      });
    },
    [setHasNotification],
  );

  useConnectSSE({
    onMeta: handleMeta,
    onNotification: handleNotification,
  });

  return children;
}
