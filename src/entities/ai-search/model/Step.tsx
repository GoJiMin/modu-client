import {cn} from '@/shared/lib/utils/cn';

type Props = {
  children: React.ReactNode;
  className?: HTMLDivElement['className'];
};

export function Step({children, className}: Props) {
  return <div className={cn('flex flex-col h-full justify-between animate-fade-in p-2', className)}>{children}</div>;
}
