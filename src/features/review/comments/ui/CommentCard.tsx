import Link from 'next/link';
import {Comment, useDeleteReviewComment} from '@/entities/review';
import {Avatar} from '@/shared/ui/components';
import {ConfirmDeleteTrigger} from '@/shared/ui/modal';

type Props = {
  comment: Comment;
  userNickname: string | null;
  reviewId: number;
  page: number;
};

export default function CommentCard({comment, userNickname, reviewId, page}: Props) {
  const {author_nickname, content, created_at, profile_image} = comment;
  const isAuthor = userNickname === author_nickname;

  const {deleteReviewComment, isPending} = useDeleteReviewComment();

  const handleDelete = () => {
    if (!userNickname) return;

    deleteReviewComment({
      commentId: comment.id,
      reviewId,
      page,
    });
  };

  return (
    <>
      <div className="flex min-h-[100px] gap-3 mx-2 px-3 pt-5 mb-5 bg-slate-100 rounded-lg relative">
        <Avatar src={profile_image} alt={`${author_nickname}님의 프로필 이미지`} />
        <article className="w-full flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/users/${author_nickname}`}
              className="text-sm md:text-base font-semibold hover:underline underline-offset-[3px]"
            >
              {author_nickname}
            </Link>
            <time className="text-[10.5px] md:text-sm text-gray-500" dateTime={created_at}>
              ({created_at})
            </time>
          </div>
          <p className="text-sm md:text-base flex-1">{content}</p>
          {isAuthor && (
            <section className="flex items-center gap-2 justify-end my-3 pr-2 text-sm text-gray-500 transition-colors">
              <ConfirmDeleteTrigger onConfirm={handleDelete} isPending={isPending} label="댓글 삭제">
                {props => (
                  <button {...props} className="hover:text-gray-700">
                    삭제
                  </button>
                )}
              </ConfirmDeleteTrigger>
            </section>
          )}
        </article>
      </div>
      <div className="w-full h-[1.5px] bg-gray-300" />
    </>
  );
}
