import Image from 'next/image';
import {CATEGORY_MAP, ReviewCard} from '@/entities/review';
import {LucideIcon} from '@/shared/ui/icons';
import {cva} from 'class-variance-authority';
import {cn} from '@/shared/lib/utils/cn';
import {Badge} from '@/shared/ui/components';

const imageWrapperVariants = cva('relative overflow-hidden rounded-[30px] mb-1 shadow-md', {
  variants: {
    variant: {
      default: 'shadow-black w-[250px] h-[180px] mt-3 mb-3',
      my: 'w-[140px] h-[140px] shadow-gray-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const badgeVariants = cva('', {
  variants: {
    variant: {
      default: 'hidden',
      my: '',
    },
  },
});

type Props = {
  card: ReviewCard;
  priority: boolean;
  variant?: 'default' | 'my';
};

export default function CardDescription({
  card: {category, image_url, title, preview, author_nickname, comments_count, bookmarks},
  priority,
  variant = 'default',
}: Props) {
  return (
    <article className="h-full flex flex-col items-center justify-between font-semibold">
      <Badge className={badgeVariants({variant})}>{CATEGORY_MAP[category]}</Badge>

      <div className="flex flex-col items-center text-center">
        <div className={cn(imageWrapperVariants({variant}))}>
          <Image
            src={image_url}
            alt={`카드 이미지: ${title}`}
            className="w-full h-full object-cover aspect-square"
            width={140}
            height={140}
            priority={priority}
            quality={60}
            fetchPriority={priority ? 'high' : 'low'}
          />
        </div>
        <h3 className="mt-4 mb-2 px-3 line-clamp-1">{title}</h3>
        <div className="min-h-[30px]">
          <p className="text-[13px] font-normal line-clamp-2 px-5">{preview}</p>
        </div>
      </div>

      <p className="text-boldBlue text-sm">{author_nickname}</p>

      <div className="flex mb-5 gap-7 text-sm font-normal">
        <div className="flex gap-1 items-center">
          <LucideIcon name="Bookmark" className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
          {bookmarks}
        </div>
        <div className="flex gap-1 items-center">
          <LucideIcon name="MessageCircle" className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
          {comments_count}
        </div>
      </div>
    </article>
  );
}
