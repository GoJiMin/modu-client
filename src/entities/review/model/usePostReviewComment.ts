'use client';

import {useRouter} from 'next/navigation';
import {postReviewComment} from '../apis/api-service';
import {reviewQueryKeys} from './query-service';
import {CommentPayload, ReviewComments} from './type';
import {useMutation, useQueryClient} from '@tanstack/react-query';

export default function usePostReviewComment(page: number) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {mutate, ...rest} = useMutation({
    mutationFn: ({reviewId, category, content}: CommentPayload) => postReviewComment({reviewId, category, content}),
    onMutate: async ({userNickname, reviewId, content}) => {
      const previousComments = queryClient.getQueryData<ReviewComments>(reviewQueryKeys.comments.page(reviewId, page));

      if (!previousComments || page !== previousComments.total_pages) {
        return {previousComments, wasNewPageCreated: false, currentRequestPage: page};
      }

      const newComment = {
        id: Date.now(),
        profile_image: 'https://picsum.photos/seed/picsum/200/200', // TODO: 실제 사용자 프로필 이미지로 변경.
        author_nickname: userNickname,
        content,
        created_at: new Date().toISOString(),
      };
      const wasNewPageCreated = previousComments.comments.length === 8;

      if (wasNewPageCreated) {
        const updatedComments = {
          comments_count: previousComments.comments_count + 1,
          comments: [newComment],
          current_page: previousComments.current_page + 1,
          total_pages: previousComments.total_pages + 1,
        };

        queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, page + 1), updatedComments);

        router.push(`?page=${page + 1}`, {scroll: false});
      } else {
        await queryClient.cancelQueries({queryKey: reviewQueryKeys.comments.page(reviewId, page)});

        const updatedComments = {
          ...previousComments,
          comments_count: previousComments.comments_count + 1,
          comments: [...previousComments.comments, newComment],
        };

        queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, page), updatedComments);
      }

      return {previousComments, wasNewPageCreated, currentRequestPage: page};
    },
    onSuccess: (_, {reviewId}) => {
      queryClient.invalidateQueries({queryKey: reviewQueryKeys.comments.all(reviewId)});
    },
    onError: (_, {reviewId}, context) => {
      if (!context) return;

      const {previousComments, wasNewPageCreated, currentRequestPage} = context;

      if (wasNewPageCreated) {
        queryClient.removeQueries({queryKey: reviewQueryKeys.comments.page(reviewId, currentRequestPage + 1)});

        router.push(`?page=${currentRequestPage}`, {scroll: false});
      } else {
        queryClient.setQueryData(reviewQueryKeys.comments.page(reviewId, currentRequestPage), previousComments);
      }
    },
  });

  return {
    postComment: mutate,
    ...rest,
  };
}
