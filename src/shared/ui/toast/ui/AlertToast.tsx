import {toast as sonnerToast} from 'sonner';
import {cva} from 'class-variance-authority';
import {AlertToastProps, AlertToastType} from '../model/type';
import {LucideIcon} from '../../icons';

const toastContainerVariants = cva(
  'flex rounded-lg shadow-lg ring-1 ring-black/5 w-full md:min-w-[400px] md:max-w-[420px] items-center p-4',
  {
    variants: {
      type: {
        success: 'bg-green-50',
        error: 'bg-red-50',
        info: 'bg-blue-50',
        default: 'bg-white',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  },
);

const toastTitleVariants = cva('font-medium', {
  variants: {
    type: {
      success: 'text-green-800',
      error: 'text-red-800',
      info: 'text-blue-800',
      default: 'text-gray-900',
    },
  },
  defaultVariants: {
    type: 'default',
  },
});

const toastButtonVariants = cva('rounded-md px-6 py-1 md:px-4 md:py-1.5 text-sm', {
  variants: {
    type: {
      success: 'bg-white hover:bg-neutral-100 text-black',
      error: 'bg-white hover:bg-neutral-100 text-black',
      info: 'bg-white hover:bg-neutral-100 text-black',
      default: 'bg-boldBlue hover:bg-extraboldBlue text-white',
    },
  },
});

const toastTypeIcons: Record<AlertToastType, React.ReactNode> = {
  success: <LucideIcon name="CircleCheck" size={21} color="green" />,
  error: <LucideIcon name="CircleAlert" size={21} color="red" />,
  info: <LucideIcon name="Sparkles" size={21} color="blue" />,
  default: <LucideIcon name="Info" size={21} color="grey" />,
};

function AlertToast(props: AlertToastProps) {
  const {title, description, button, id, type = 'default'} = props;

  return (
    <div className={toastContainerVariants({type})}>
      <div className="mr-3 flex-shrink-0">{toastTypeIcons[type]}</div>

      <div className="flex flex-1 items-center ">
        <div className="w-full">
          <p className={toastTitleVariants({type})}>{title}</p>
          {description && <p className="text-sm text-gray-500 bg-">{description}</p>}
        </div>
      </div>

      {button && (
        <div className="ml-5 shrink-0 rounded-md text-sm focus:ring-2 focus:ring-extraboldBlue focus:ring-offset-2 focus:outline-hidden">
          <button
            className={toastButtonVariants({type})}
            onClick={() => {
              button.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {button.label}
          </button>
        </div>
      )}
    </div>
  );
}

export default AlertToast;
