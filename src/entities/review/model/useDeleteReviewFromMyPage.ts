import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteReview} from '../apis/api-service';
import {Category} from './type';
import {reviewsQueryKeys} from '@/entities/reviews';
import toast from '@/shared/ui/toast';

type MutationVariables = {
  category: Category;
  reviewId: number;
  context: 'my' | 'myBookmarks';
};

export default function useDeleteReviewFromMyPage() {
  const queryClient = useQueryClient();

  const {mutate, ...rest} = useMutation({
    mutationFn: ({reviewId}: MutationVariables) => deleteReview(reviewId),
    onSuccess: (_data, {category, context}) => {
      toast.success({
        title: '리뷰를 성공적으로 삭제했어요.',
      });

      const baseKeys = [
        reviewsQueryKeys.my.all(),
        reviewsQueryKeys.category.category('all'),
        reviewsQueryKeys.category.category(category),
        reviewsQueryKeys.keyword.all(),
      ];

      const invalidateKeys = context === 'myBookmarks' ? [...baseKeys, reviewsQueryKeys.myBookmarks.all()] : baseKeys;

      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({queryKey: key});
      });
    },
  });

  return {
    deleteReview: mutate,
    ...rest,
  };
}
