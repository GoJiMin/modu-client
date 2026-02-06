export type NotificationToastType = 'bookmark' | 'comment';
export type AlertToastType = 'success' | 'error' | 'info' | 'default';

export type AlertToastProps = {
  id: string | number;
  title: string;
  description?: string;
  type?: AlertToastType;
  button?: {
    label: string;
    onClick: () => void;
  };
};

export type NotificationToastProps = {
  id: string | number;
  board_id: number;
  title: string;
  type: NotificationToastType;
};
