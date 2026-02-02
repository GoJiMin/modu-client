import Link from 'next/link';
import {ReviewCard, useDeleteReviewFromMyPage} from '@/entities/review';
import {CardDescription} from '@/entities/reviews';
import {LucideIcon} from '@/shared/ui/icons';
import {LoadingSpinner} from '@/shared/ui/components';
import {ConfirmDeleteTrigger} from '@/shared/ui/modal';

type Props = {
  card: ReviewCard;
  isAuthor: boolean;
  context: 'my' | 'myBookmarks';
  priority: boolean;
};

export default function MyReviewCard({card, isAuthor, context, priority}: Props) {
  const {deleteReview, isPending} = useDeleteReviewFromMyPage();

  const handleDelete = () => {
    deleteReview({
      reviewId: card.board_id,
      category: card.category,
      context,
    });
  };

  return (
    <article className="relative bg-white rounded-[2rem] pt-4 w-[325px] h-[410px] md:w-[300px] md:h-[400px] shadow-md shadow-gray-400 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-gray-500 transition-all">
      {isPending && (
        <div className="absolute inset-0 bg-black/60 rounded-[2rem] z-50">
          <LoadingSpinner text="리뷰를 삭제하고 있어요." className="text-white mt-3" textSize="text-xl" />
        </div>
      )}
      {isAuthor && (
        <div className="absolute w-full px-6 flex justify-between text-gray-500 transition-colors mt-[0.2rem]">
          <Link className="hover:text-gray-800" href={`/reviews/${card.board_id}/edit`} aria-label={`${card.title} 리뷰 수정`}>
            <LucideIcon name="PencilLine" size={20} />
          </Link>
          <ConfirmDeleteTrigger onConfirm={handleDelete} isPending={isPending} label={`${card.title} 리뷰 삭제`}>
            {props => (
              <button {...props} className="hover:text-gray-800">
                <LucideIcon name="X" size={20} />
              </button>
            )}
          </ConfirmDeleteTrigger>
        </div>
      )}{' '}
      <Link href={`/reviews/${card.board_id}`} aria-label={`${card.title} 리뷰 이동`}>
        <CardDescription card={card} priority={priority} variant="my" />
      </Link>
    </article>
  );
}
