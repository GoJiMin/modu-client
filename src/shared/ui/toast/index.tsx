import {toast as sonnerToast} from 'sonner';
import AlertToast from './ui/AlertToast';
import NotificationToast from './ui/NotificationToast';
import {AlertToastProps, NotificationToastProps} from './model/type';

type ToastOptions = Omit<AlertToastProps, 'id' | 'type'>;
type NotificationToastOptions = Omit<NotificationToastProps, 'id'>;

const toast = {
  show: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast id={id} type="default" {...options} />);
  },

  success: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast id={id} type="success" {...options} />);
  },

  error: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast id={id} type="error" {...options} />);
  },

  info: (options: ToastOptions) => {
    return sonnerToast.custom(id => <AlertToast id={id} type="info" {...options} />);
  },

  notification: (options: NotificationToastOptions) => {
    return sonnerToast.custom(id => <NotificationToast id={id} {...options} />);
  },
};

export default toast;
