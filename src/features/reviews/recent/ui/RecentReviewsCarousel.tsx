import RecentReviewCard from './RecentReviewCard';
import MultiCarousel from './MultiCarousel';
import MoreReviewsLink from './MoreReviewsLink';
import {useGetRecentReviews} from '@/entities/reviews';

export default function RecentReviewsCarousel() {
  const {
    data: {latest_reviews},
  } = useGetRecentReviews();

  if (latest_reviews.length === 0) {
    return (
      <section className="flex justify-center items-center min-h-[200px]">
        <p className="text-xl font-semibold">아직 등록된 후기가 없어요.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="overflow-hidden w-full">
        <MultiCarousel>
          {latest_reviews.map(post => (
            <RecentReviewCard key={`1-${post.board_id}`} post={post} />
          ))}
        </MultiCarousel>
        <div className="hidden md:block mt-14">
          <MultiCarousel rightToLeft={false}>
            {latest_reviews.map(post => (
              <RecentReviewCard key={`2-${post.board_id}`} post={post} />
            ))}
          </MultiCarousel>
        </div>
      </div>
      <MoreReviewsLink />
    </section>
  );
}
