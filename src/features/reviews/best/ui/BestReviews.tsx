'use client';

// import Link from 'next/link';
import BestReviewsGrid from './BestReviewsGrid';
import {CategoryBar, useSelectCategory} from '@/features/reviews/filtering';
import {BestReviewsResult} from '@/entities/reviews';
// import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  reviews: BestReviewsResult;
};

export default function BestReviews({reviews}: Props) {
  const {selectedCategory, handleSelectCategory} = useSelectCategory();
  const filteredReview = reviews[selectedCategory];

  return (
    <section className="bg-boldBlue">
      <div className="w-full max-w-[1250px] mx-auto flex flex-col justify-center py-6 md:py-9 md:px-8">
        <h3 className="text-white font-bold text-2xl text-center md:text-start md:ml-14 mb-5 md:mb-8 lg:text-3xl">
          실시간 베스트 후기
        </h3>
        <article className="w-full max-w-[1150px] mx-auto px-1 xs:px-3 mb-2 md:mb-4">
          <CategoryBar selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />
        </article>
        <BestReviewsGrid filteredReview={filteredReview} />
      </div>
    </section>
  );
}
