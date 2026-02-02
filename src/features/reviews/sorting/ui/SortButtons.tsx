import {cn} from '@/shared/lib/utils/cn';
import {SortKey} from '../model/type';
import {SORT_OPTIONS} from '../const/sortOptions';

type Props = {
  sort: SortKey;
  onValueChange: (value: SortKey) => void;
  className?: string;
};

export default function SortButtons({sort, onValueChange, className}: Props) {
  return (
    <div className={cn('flex gap-4', className)} role="group" aria-label="정렬 방식 선택">
      {SORT_OPTIONS.map(({name, value}) => {
        const isActive = sort === value;
        return (
          <button
            key={value}
            onClick={() => onValueChange(value)}
            className={cn(
              'text-[15px] transition-colors',
              isActive ? 'font-extrabold text-boldBlue' : 'hover:text-boldBlue text-gray-400',
            )}
            style={{textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'}}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
