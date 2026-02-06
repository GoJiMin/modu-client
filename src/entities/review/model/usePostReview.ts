'use client';

import {useRouter} from 'next/navigation';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {postReview} from '../apis/api-service';
import {reviewsQueryKeys} from '@/entities/reviews';
import toast from '@/shared/ui/toast';

export function usePostReview() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {mutate, ...rest} = useMutation({
    mutationFn: postReview,
    onSuccess: (_data, {category}) => {
      toast.success({
        title: '리뷰를 성공적으로 등록했어요.',
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

      router.push('/search');
    },
  });

  return {
    postReview: mutate,
    ...rest,
  };
}
