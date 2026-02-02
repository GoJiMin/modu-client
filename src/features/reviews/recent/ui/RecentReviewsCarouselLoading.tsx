import {Skeleton} from '@/shared/shadcnComponent/ui/skeleton';
import RecentReviewCardLoading from './RecentReviewsCardLoading';

export function RecentReviewsCarouselLoading() {
  return (
    <section className="w-full flex-col overflow-hidden">
      <div className="flex gap-20 justify-center">
        {Array.from({length: 3}).map((_, idx) => (
          <RecentReviewCardLoading key={idx} />
        ))}
      </div>
      <div className="hidden justify-center md:flex md:gap-20 mt-14 pb-1">
        {Array.from({length: 3}).map((_, idx) => (
          <RecentReviewCardLoading key={idx} />
        ))}
      </div>
      <div className="flex w-full justify-center mt-16 md:mt-24">
        <Skeleton className="w-[180px] h-[55px]" />
      </div>
    </section>
  );
}
