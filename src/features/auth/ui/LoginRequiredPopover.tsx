import dynamic from 'next/dynamic';
import LoginButtonLoading from './LoginButtonLoading';
import {Popover, PopoverContent, PopoverTrigger} from '@/shared/shadcnComponent/ui/popover';
import {LucideIcon} from '@/shared/ui/icons';

const LoginButton = dynamic(() => import('@/features/auth/ui/LoginButton'), {
  ssr: false,
  loading: () => <LoginButtonLoading className="text-sm" text="로그인하기" />,
});

type Props = {
  title: string;
};

export default function LoginRequiredPopover({title}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild aria-label={`${title}로 이동`}>
        <button
          type="button"
          className="flex items-center text-muted-foreground gap-1 hover:text-boldBlue transition-colors"
        >
          <LucideIcon name="LockKeyhole" size={20} /> <span>{title}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col">
          <h3 className="font-semibold mb-1">로그인 후 이용할 수 있어요.</h3>
          <p className="text-sm text-muted-foreground mb-2">로그인하면 더 많은 기능을 이용할 수 있어요.</p>
          <LoginButton className="text-sm" text="로그인하기" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
