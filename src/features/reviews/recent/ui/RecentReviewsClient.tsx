'use client';

import {RQProvider} from '@/shared/providers';
import dynamic from 'next/dynamic';
import {RecentReviewsCarouselLoading} from './RecentReviewsCarouselLoading';

const RecentReviewsCarousel = dynamic(() => import('./RecentReviewsCarousel'), {
  ssr: false,
  loading: () => <RecentReviewsCarouselLoading />,
});

export default function RecentReviewsClient() {
  return (
    <RQProvider LoadingFallback={<RecentReviewsCarouselLoading />}>
      <RecentReviewsCarousel />
    </RQProvider>
  );
}
