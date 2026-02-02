import {useRouter} from 'next/navigation';
import {Notification, useMarkNotificationAsRead} from '@/entities/notifications';
import {NOTIFICATION_CONFIG} from './config/notification-config';
import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  notification: Notification;
};

export default function NotificationItem({notification}: Props) {
  const {id, board_id, isRead, title, created_at, type} = notification;
  const config = NOTIFICATION_CONFIG[type];

  const router = useRouter();
  const {markNotificationAsRead} = useMarkNotificationAsRead();

  const handleMarkAsRead = () => {
    router.push(`/reviews/${board_id}`);

    if (!isRead) {
      markNotificationAsRead(id);
    }
  };

  return (
    <button
      className={`w-full text-left flex items-center border-b-2 border-neutral-300 ${notification.isRead ? 'bg-gray-200' : 'bg-white'} py-5 px-3 md:px-5 pb-8 md:pb-6 hover:bg-gray-100 transition-colors`}
      onClick={handleMarkAsRead}
      aria-label={`${notification.title} 게시글로 이동`}
    >
      <div className={`${config.bgColor} p-2 md:p-2 rounded-lg mr-3 md:mr-3`}>
        <LucideIcon name={config.icon} className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      <div className="flex flex-col flex-1 md:flex-[0.75]">
        <p className="font-semibold">{config.title}</p>
        <p className="text-[13px] md:text-sm text-muted-foreground">{config.getMessage(title)}</p>
      </div>
      <p className="absolute right-3 bottom-2 md:static text-[12px] md:text-sm font-semibold flex-[0.2] whitespace-nowrap">
        {created_at}
      </p>
    </button>
  );
}
