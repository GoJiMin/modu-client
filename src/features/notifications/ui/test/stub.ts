import {Notification, Notifications} from '@/entities/notifications';

export const readNotificationStub: Notification = {
  id: 1,
  board_id: 1,
  isRead: true,
  isDeleted: false,
  title: '테스트',
  created_at: '2026년 1월 24일',
  type: 'bookmark',
};

export const unReadNotificationStub: Notification = {
  id: 1,
  board_id: 1,
  isRead: false,
  isDeleted: false,
  title: '테스트',
  created_at: '2026년 1월 24일',
  type: 'bookmark',
};

export const notificationsStub: Notifications = {
  results: [
    {
      id: 1,
      board_id: 1,
      isRead: true,
      isDeleted: false,
      title: '테스트',
      created_at: '2026년 1월 24일',
      type: 'bookmark',
    },
    {
      id: 2,
      board_id: 2,
      isRead: true,
      isDeleted: false,
      title: '테스트2',
      created_at: '2026년 1월 24일',
      type: 'comment',
    },
    {
      id: 3,
      board_id: 3,
      isRead: true,
      isDeleted: false,
      title: '테스트2',
      created_at: '2026년 1월 24일',
      type: 'comment',
    },
  ],
  current_page: 1,
  total_pages: 1,
};
