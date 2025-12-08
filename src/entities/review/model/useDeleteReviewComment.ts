import {useMutation, useQueryClient} from '@tanstack/react-query';
import {ReviewComments} from './type';
import {deleteReviewComment} from '../apis/api-service';
import toast from '@/shared/lib/utils/toastService';
import {reviewQueryKeys} from './query-service';

type MutationVariables = {
  commentId: number;
  reviewId: number;
  page: number;
};

export default function useDeleteReviewComment() {
  const queryClient = useQueryClient();

  const {mutate, ...rest} = useMutation({
    mutationFn: ({commentId, reviewId}: MutationVariables) => deleteReviewComment({commentId, reviewId}),
    onMutate: async ({commentId, reviewId, page}) => {
      await queryClient.cancelQueries({queryKey: reviewQueryKeys.comments.page(reviewId, page)});

      const previousComments = queryClient.getQueryData<ReviewComments>(reviewQueryKeys.comments.page(reviewId, page));

      if (previousComments) {
        const newCommentsCounts = previousComments.comments_count - 1;
        const newComments = previousComments.comments.filter(comment => comment.id !== commentId);

        const updated: ReviewComments = {
          ...previousComments,
          comments_count: newCommentsCounts < 0 ? 0 : newCommentsCounts,
          comments: newComments,
        };

        queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, page), updated);
      }

      return {previousComments};
    },
    onSuccess: (_data, {reviewId}) => {
      toast.success({
        title: '댓글을 성공적으로 삭제했어요.',
      });

      queryClient.invalidateQueries({queryKey: reviewQueryKeys.comments.all(reviewId)});
    },
    onError: (_, {reviewId, page}, context) => {
      if (context) {
        queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, page), context.previousComments);
      }
    },
  });

  return {
    deleteReviewComment: mutate,
    ...rest,
  };
}
