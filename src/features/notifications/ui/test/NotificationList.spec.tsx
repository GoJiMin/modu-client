import {render, screen, waitFor, waitForElementToBeRemoved, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {Suspense} from 'react';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import {deleteNotification, getNotifications, markNotificationAsRead} from '@/entities/notifications/apis/api-service';
import NotificationList from '../NotificationList';
import {NOTIFICATION_CONFIG} from '../config/notification-config';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/notifications/apis/api-service');

const mockGetNotifications = getNotifications as jest.MockedFunction<typeof getNotifications>;
const mockMarkAsRead = markNotificationAsRead as jest.MockedFunction<typeof markNotificationAsRead>;
const mockDeleteNotification = deleteNotification as jest.MockedFunction<typeof deleteNotification>;

const createNotificationStub = (id: number, isRead = false, type: 'comment' | 'bookmark' = 'comment') => ({
  id,
  type,
  title: `테스트 게시글 제목 ${id}`,
  content: `테스트 알림 내용 ${id}`,
  isRead,
  isDeleted: false,
  created_at: '2026-01-29',
  board_id: 100 + id,
  sender_nickname: `user${id}`,
});

const createNotificationListStub = (count: number, page = 1) => ({
  results: Array.from({length: count}, (_, i) => createNotificationStub(i + 1)),
  total_pages: Math.ceil(count / 10) || 1,
  current_page: page,
});

const setupRender = async (route = '/?page=1') => {
  const user = userEvent.setup();
  mockRouter.push(route);

  render(
    withAllContext(
      <Suspense fallback={<div>loading...</div>}>
        <NotificationList />
      </Suspense>,
    ),
  );

  await waitForElementToBeRemoved(screen.queryByText('loading...'));

  return {user};
};

describe('src/features/notification/ui/NotificationList.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    it('알림이 없는 경우 빈 상태 UI를 보여준다.', async () => {
      mockGetNotifications.mockResolvedValue(createNotificationListStub(0));

      await setupRender();

      expect(screen.getByText('아직 알림이 없어요.')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('알림이 있는 경우 알림 목록을 보여준다.', async () => {
      const targetNotification = createNotificationStub(99);
      const targetNotificationConfig = NOTIFICATION_CONFIG[targetNotification.type];
      const initialData = createNotificationListStub(2);

      mockGetNotifications.mockResolvedValue({
        ...initialData,
        results: [...initialData.results, targetNotification],
      });

      await setupRender();

      const lists = screen.getAllByRole('list');
      const NotificationList = lists[0];

      expect(within(NotificationList).getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText(targetNotificationConfig.getMessage(targetNotification.title))).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    describe('알림 리스트', () => {
      beforeEach(() => {
        const notificationsPage1Stub = {results: [], current_page: 1, total_pages: 3};
        const notificationsPage2Stub = {results: [], current_page: 2, total_pages: 3};
        const notificationsPage3Stub = {results: [], current_page: 3, total_pages: 3};

        mockGetNotifications.mockImplementation(page => {
          if (page === 1) {
            return Promise.resolve(notificationsPage1Stub);
          }

          if (page === 2) {
            return Promise.resolve(notificationsPage2Stub);
          }

          if (page === 3) {
            return Promise.resolve(notificationsPage3Stub);
          }

          return Promise.resolve({results: [], current_page: page, total_pages: 0});
        });
      });

      it('총 3페이지 중 사용자가 1페이지를 조회하면 2페이지를 미리 로드한다.', async () => {
        await setupRender();

        expect(mockGetNotifications.mock.calls).toStrictEqual([[1], [2]]);
      });

      it('총 3페이지 중 사용자가 2페이지를 조회하면 1, 3페이지를 미리 로드한다.', async () => {
        await setupRender('/?page=2');

        expect(mockGetNotifications.mock.calls).toStrictEqual([[2], [3], [1]]);
      });
    });

    describe('알림 읽음', () => {
      it('안 읽은 알림을 클릭하면 해당 게시글로 이동하고 읽음 표시한다.', async () => {
        // 99번 알림은 안 읽음 상태
        const targetNotification = createNotificationStub(99, false);
        const initialData = createNotificationListStub(2);

        mockGetNotifications.mockResolvedValue({
          ...initialData,
          results: [...initialData.results, targetNotification],
        });

        const {user} = await setupRender();

        const notificationItem = screen.getByLabelText(`${targetNotification.title} 게시글로 이동`, {
          selector: 'button',
        });
        await user.click(notificationItem);

        expect(mockRouter.asPath).toBe(`/reviews/${targetNotification.board_id}`);

        expect(mockMarkAsRead).toHaveBeenCalledTimes(1);
        expect(mockMarkAsRead).toHaveBeenCalledWith(targetNotification.id);
      });

      it('이미 읽은 알림을 클릭하면 게시글로 이동하기만 한다.', async () => {
        // 99번 알림은 이미 읽음 상태
        const targetNotification = createNotificationStub(99, true);
        const initialData = createNotificationListStub(2);

        mockGetNotifications.mockResolvedValue({
          ...initialData,
          results: [...initialData.results, targetNotification],
        });

        const {user} = await setupRender();

        const notificationItem = screen.getByLabelText(`${targetNotification.title} 게시글로 이동`, {
          selector: 'button',
        });
        await user.click(notificationItem);

        expect(mockRouter.asPath).toBe(`/reviews/${targetNotification.board_id}`);

        expect(mockMarkAsRead).toHaveBeenCalledTimes(0);
      });
    });

    describe('알림 삭제', () => {
      it('삭제 버튼 클릭 시 목록에서 즉시 제거된다.', async () => {
        const targetNotification = createNotificationStub(99);
        const targetNotificationMessage = NOTIFICATION_CONFIG[targetNotification.type] //
          .getMessage(targetNotification.title);
        const initialData = createNotificationListStub(3);

        mockGetNotifications
          .mockResolvedValueOnce({
            ...initialData,
            results: [...initialData.results, targetNotification],
          })
          .mockResolvedValueOnce(initialData);

        let resolveDeleteNotification: any;
        mockDeleteNotification.mockImplementation(() => {
          return new Promise(resolve => {
            resolveDeleteNotification = resolve;
          });
        });

        const {user} = await setupRender();

        const lists = screen.getAllByRole('list');
        const NotificationList = lists[0];

        expect(within(NotificationList).getAllByRole('listitem')).toHaveLength(4);

        // 알림 삭제
        const deleteButton = screen.getByLabelText(`${targetNotification.title} 알림 삭제`, {selector: 'button'});
        await user.click(deleteButton);

        // 즉시 화면에서 알림을 4개에서 3개로 삭제
        expect(within(NotificationList).getAllByRole('listitem')).toHaveLength(3);
        expect(screen.queryByText(targetNotificationMessage)).not.toBeInTheDocument();

        resolveDeleteNotification();

        await waitFor(() => {
          expect(within(NotificationList).getAllByRole('listitem')).toHaveLength(3);
          expect(screen.queryByText(targetNotificationMessage)).not.toBeInTheDocument();
        });
      });

      it('삭제 요청이 실패하면 지워졌던 알림이 다시 목록에 복구된다.', async () => {
        const targetNotification = createNotificationStub(99);
        const targetNotificationMessage = NOTIFICATION_CONFIG[targetNotification.type] //
          .getMessage(targetNotification.title);
        const initialData = createNotificationListStub(3);

        mockGetNotifications.mockResolvedValue({
          ...initialData,
          results: [...initialData.results, targetNotification],
        });

        let rejectDeleteNotification: any;
        mockDeleteNotification.mockImplementation(() => {
          return new Promise((resolve, reject) => {
            rejectDeleteNotification = reject;
          });
        });

        const {user} = await setupRender();

        const lists = screen.getAllByRole('list');
        const NotificationList = lists[0];

        expect(within(NotificationList).getAllByRole('listitem')).toHaveLength(4);

        // 알림 삭제
        const deleteButton = screen.getByLabelText(`${targetNotification.title} 알림 삭제`, {selector: 'button'});
        await user.click(deleteButton);

        // 즉시 화면에서 알림을 4개에서 3개로 삭제
        expect(within(NotificationList).getAllByRole('listitem')).toHaveLength(3);
        expect(screen.queryByText(targetNotificationMessage)).not.toBeInTheDocument();

        rejectDeleteNotification();

        await waitFor(() => {
          expect(within(NotificationList).getAllByRole('listitem')).toHaveLength(4);
          expect(screen.queryByText(targetNotificationMessage)).toBeInTheDocument();
        });
      });
    });
  });
});
