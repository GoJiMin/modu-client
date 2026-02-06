import {Suspense} from 'react';
import EditReview from './EditReview';
import {LoadingSpinner} from '@/shared/ui/components';
import getSessionUserNickname from '@/shared/lib/utils/getSessionUserNickname';
import {Metadata} from 'next';

type Props = {
  params: Promise<{reviewId: string}>;
};

export const metadata: Metadata = {
  title: '후기 수정',
  description: '후기글을 수정해보세요.',
};

export default async function ReviewEditPage({params}: Props) {
  const {reviewId} = await params;
  const parsedReviewId = Number(reviewId);

  const sessionUserNickname = await getSessionUserNickname();

  if (!sessionUserNickname) {
    throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  return (
    <section className="fixed inset-0 z-20 bg-gray-50">
      <Suspense fallback={<LoadingSpinner text="리뷰 정보를 불러오고 있어요." />}>
        <EditReview reviewId={parsedReviewId} sessionUserNickname={sessionUserNickname} />
      </Suspense>
    </section>
  );
}
