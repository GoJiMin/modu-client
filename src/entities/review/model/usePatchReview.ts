'use client';

import {useRouter} from 'next/navigation';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {patchReview} from '../apis/api-service';
import {ReviewPayload} from './type';
import toast from '@/shared/ui/toast';
import {reviewsQueryKeys} from '@/entities/reviews';

type MutationVariables = {
  data: ReviewPayload;
  reviewId: number;
};

export default function usePatchReview() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {mutate, ...rest} = useMutation({
    mutationFn: ({data, reviewId}: MutationVariables) => patchReview(data, reviewId),
    onSuccess: (_data, {data: {category}, reviewId}) => {
      toast.success({
        title: '리뷰를 성공적으로 수정했어요.',
      });

      const invalidateKeys = [
        reviewsQueryKeys.my.all(),
        reviewsQueryKeys.category.category('all'),
        reviewsQueryKeys.category.category(category),
        reviewsQueryKeys.keyword.all(),
      ];

      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({queryKey: key});
      });

      router.push(`/reviews/${reviewId}`);
    },
  });

  return {
    patchReview: mutate,
    ...rest,
  };
}
