import {useCallback} from 'react';
import {SortKey} from '@/features/reviews/sorting';
import {NoSearchResults, ReviewArticle, ReviewArticleLoading, useCategoryReviews} from '@/entities/reviews';
import {Category} from '@/entities/review';

type Props = {
  selectedCategory: Category;
  sort: SortKey;
};

export default function ReviewsWithScroll({selectedCategory, sort}: Props) {
  const {data, hasNextPage, fetchNextPage, isFetchingNextPage} = useCategoryReviews(selectedCategory, sort);

  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      observer.observe(node);

      return () => observer.disconnect();
    },
    [hasNextPage, fetchNextPage],
  );

  if (data.pages[0].results.length === 0) {
    return (
      <NoSearchResults
        title="아직 해당 카테고리에 리뷰가 등록되지 않았어요."
        description="다른 카테고리를 클릭해 리뷰를 확인해보세요!"
      />
    );
  }

  return (
    <>
      <ul>
        {data.pages.map((page, pageIndex) =>
          page.results.map((review, reviewIndex) => {
            const shouldPrioritize = pageIndex === 0 && reviewIndex < 3;

            return (
              <li key={review.board_id}>
                <ReviewArticle searchReview={review} priority={shouldPrioritize} />
              </li>
            );
          }),
        )}
      </ul>
      {hasNextPage ? (
        <div className="w-full mt-6" ref={observerRef} data-testid="observer">
          {isFetchingNextPage && Array.from({length: 3}, (_, idx) => <ReviewArticleLoading key={idx} />)}
        </div>
      ) : (
        data.pages.length > 1 && (
          <div className="w-full flex flex-col justify-center items-center">
            <p className="font-semibold text-lg md:text-xl mt-4 md:mt-3">더 이상 불러올 게시글이 없어요.</p>
            <p className="text-muted-foreground mt-1">다른 카테고리를 클릭해 리뷰를 확인해보세요!</p>
          </div>
        )
      )}
    </>
  );
}
