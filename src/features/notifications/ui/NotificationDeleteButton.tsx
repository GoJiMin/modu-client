import {useDeleteNotification} from '@/entities/notifications';
import {LucideIcon} from '@/shared/ui/icons';
import {MouseEvent} from 'react';

type Props = {
  id: number;
  page: number;
  configTitle: string;
  configMessage: string;
};

export default function NotificationDeleteButton({id, page, configTitle, configMessage}: Props) {
  const {deleteNotification, isPending} = useDeleteNotification();

  const handleDeleteNotification = (e: MouseEvent) => {
    e.stopPropagation();
    deleteNotification({notificationId: id, page});
  };
  return (
    <button
      className="absolute top-2 md:inset-y-0 md:translate-y-[-4%] right-2 md:right-6"
      onClick={handleDeleteNotification}
      disabled={isPending}
      aria-label={`${configTitle} - ${configMessage} 알림 삭제`}
    >
      <LucideIcon name="X" className="w-5 h-5 md:w-5 md:h-5 text-gray-500 hover:text-gray-700" />
    </button>
  );
}
