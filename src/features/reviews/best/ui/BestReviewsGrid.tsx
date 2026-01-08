import BestReviewCard from './BestReviewCard';
import {ReviewCard} from '@/entities/review';

type Props = {
  filteredReview: {
    count: number;
    reviews: ReviewCard[];
  };
};

export default function BestReviewsGrid({filteredReview}: Props) {
  const {count, reviews} = filteredReview;

  if (count === 0) {
    return (
      <section className="w-full h-full min-h-[250px] md:min-h-[350px] lg:min-h-[450px] mb-10 flex flex-col items-center justify-center">
        <p className="text-white text-lg md:text-2xl font-semibold">해당 카테고리는 아직 베스트 후기가 없어요.</p>
      </section>
    );
  }

  return (
    <ul className="w-full grid content-center justify-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-14 md:gap-y-20 mb-16">
      {reviews.map((card, index) => {
        const shouldPrioritize = index < 3;

        return (
          <li key={card.board_id}>
            <BestReviewCard card={card} priority={shouldPrioritize} />
          </li>
        );
      })}
    </ul>
  );
}
