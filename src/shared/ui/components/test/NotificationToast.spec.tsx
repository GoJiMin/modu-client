import {fireEvent, render, screen} from '@testing-library/react';
import {toast as sonnerToast} from 'sonner';
import NotificationToast, {NotificationToastProps} from '../NotificationToast';

jest.mock('sonner', () => ({
  toast: {
    dismiss: jest.fn(),
  },
}));

jest.mock('../../icons', () => ({
  LucideIcon: ({name, className}: {name: string; className?: string}) => (
    <span data-testid={`icon-${name}`} className={className} />
  ),
}));

jest.mock('next/link', () => {
  return ({children, href, onClick}: {children: React.ReactNode; href: string; onClick?: () => void}) => (
    <a href={href} onClick={onClick} data-testid="notification-link">
      {children}
    </a>
  );
});

const mockDismiss = sonnerToast.dismiss as jest.MockedFunction<typeof sonnerToast.dismiss>;

describe('src/shared/ui/components/NotificationToast.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderNotificationToast = (props: Partial<NotificationToastProps> = {}) => {
    const defaultProps: NotificationToastProps = {
      id: 'test-notification-id',
      board_id: 123,
      title: '테스트 게시글',
      type: 'comment',
      ...props,
    };
    return render(<NotificationToast {...defaultProps} />);
  };

  describe('comment 타입', () => {
    it('MessageCircle 아이콘이 표시된다', () => {
      renderNotificationToast({type: 'comment'});

      expect(screen.getByTestId('icon-MessageCircle')).toBeInTheDocument();
    });

    it('댓글 관련 타이틀이 표시된다', () => {
      renderNotificationToast({type: 'comment'});

      expect(screen.getByText('누군가 댓글을 남겼어요.')).toBeInTheDocument();
    });

    it('게시글 제목이 포함된 메시지가 표시된다', () => {
      renderNotificationToast({type: 'comment', title: '내 게시글'});

      expect(screen.getByText("'내 게시글'에 댓글을 남겼어요!")).toBeInTheDocument();
    });

    it('bg-red-300 배경색이 적용된다', () => {
      renderNotificationToast({type: 'comment'});

      const iconContainer = screen.getByTestId('icon-MessageCircle').parentElement;
      expect(iconContainer).toHaveClass('bg-red-300');
    });
  });

  describe('bookmark 타입', () => {
    it('Bookmark 아이콘이 표시된다', () => {
      renderNotificationToast({type: 'bookmark'});

      expect(screen.getByTestId('icon-Bookmark')).toBeInTheDocument();
    });

    it('북마크 관련 타이틀이 표시된다', () => {
      renderNotificationToast({type: 'bookmark'});

      expect(screen.getByText('누군가 게시글을 저장했어요.')).toBeInTheDocument();
    });

    it('게시글 제목이 포함된 메시지가 표시된다', () => {
      renderNotificationToast({type: 'bookmark', title: '인기 게시글'});

      expect(screen.getByText("'인기 게시글'을 저장했어요!")).toBeInTheDocument();
    });

    it('bg-black 배경색이 적용된다', () => {
      renderNotificationToast({type: 'bookmark'});

      const iconContainer = screen.getByTestId('icon-Bookmark').parentElement;
      expect(iconContainer).toHaveClass('bg-black');
    });
  });

  describe('Link 렌더링', () => {
    it('올바른 href(/reviews/{board_id})로 Link가 렌더링된다', () => {
      renderNotificationToast({board_id: 456});

      const link = screen.getByTestId('notification-link');
      expect(link).toHaveAttribute('href', '/reviews/456');
    });
  });

  describe('클릭 동작', () => {
    it('클릭 시 toast.dismiss가 호출된다', () => {
      renderNotificationToast({id: 'notification-123'});

      const link = screen.getByTestId('notification-link');
      fireEvent.click(link);

      expect(mockDismiss).toHaveBeenCalledWith('notification-123');
    });
  });
});
