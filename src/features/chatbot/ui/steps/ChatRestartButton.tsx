import {useChatStore} from '@/entities/ai-search';
import {cn} from '@/shared/lib/utils/cn';
import {ButtonHTMLAttributes} from 'react';

type Props = {
  text?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function ChatRestartButton({text = '다른 검색하기', className, ...props}: Props) {
  const goToInput = useChatStore(state => state.goToInput);

  return (
    <button
      onClick={goToInput}
      className={cn(
        'bg-white border border-gray-200 text-gray-500 py-2.5 w-full rounded-full font-semibold hover:bg-gray-50 transition-colors',
        className,
      )}
      {...props}
    >
      {text}
    </button>
  );
}
