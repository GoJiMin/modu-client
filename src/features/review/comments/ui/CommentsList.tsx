import CommentCard from './CommentCard';
import Pagination from '@/widgets/pagination';
import {Comment} from '@/entities/review';
import {useUserNickname} from '@/entities/auth';

type Props = {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  reviewId: number;
};

export default function CommentsList({comments, currentPage, totalPages, reviewId}: Props) {
  const userNickname = useUserNickname();

  return (
    <>
      <ul className="flex flex-col gap-5 mt-6">
        {comments.map(comment => (
          <li key={comment.id}>
            <CommentCard comment={comment} userNickname={userNickname} reviewId={reviewId} page={currentPage} />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        generateUrl={page => `?page=${page}`}
        className="my-5"
        scrollToTop={false}
      />
    </>
  );
}
