import Link from 'next/link';
import {toast as sonnerToast} from 'sonner';
import {NotificationToastProps} from '../model/type';
import {LucideIcon} from '../../icons';

const NOTIFICATION_CONFIG = {
  comment: {
    icon: 'MessageCircle' as const,
    bgColor: 'bg-red-300',
    title: '누군가 댓글을 남겼어요.',
    getMessage: (title: string) => `'${title}'에 댓글을 남겼어요!`,
  },
  bookmark: {
    icon: 'Bookmark' as const,
    bgColor: 'bg-black',
    title: '누군가 게시글을 저장했어요.',
    getMessage: (title: string) => `'${title}'을 저장했어요!`,
  },
} as const;

function NotificationToast(props: NotificationToastProps) {
  const {id, title, board_id, type} = props;
  const config = NOTIFICATION_CONFIG[type];

  return (
    <Link
      className="flex rounded-lg shadow-lg ring-1 bg-white ring-black/5 w-full md:min-w-[400px] md:max-w-[420px] items-center p-4"
      href={`/reviews/${board_id}`}
      onClick={() => {
        sonnerToast.dismiss(id);
      }}
    >
      <div className={`${config.bgColor} p-2 md:p-2 rounded-lg mr-3 md:mr-3 flex-shrink-0`}>
        <LucideIcon name={config.icon} className="w-5 h-5 text-white" />
      </div>

      <div className="flex flex-1 items-center ">
        <div className="w-full">
          <p className="font-medium">{config.title}</p>
          <p className="text-sm text-gray-500">{config.getMessage(title)}</p>
        </div>
      </div>
    </Link>
  );
}

export default NotificationToast;
