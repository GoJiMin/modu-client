'use client';

import {useEffect} from 'react';
import {useParams, useSearchParams} from 'next/navigation';
import {useShallow} from 'zustand/react/shallow';
import Pagination from '@/widgets/pagination';
import {SortKey} from '@/features/reviews/sorting';
import {NoSearchResults, ReviewArticle, useKeywordReviews} from '@/entities/reviews';
import {useChatStore} from '@/entities/ai-search';

type Props = {
  sort: SortKey;
};

export default function ReviewWithPagination({sort}: Props) {
  const {keyword} = useParams<{keyword: string}>();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const {results, total_pages} = useKeywordReviews(keyword, currentPage, sort);

  const {openChat, limitState} = useChatStore(
    useShallow(state => ({
      openChat: state.openChat,
      limitState: state.limitState,
    })),
  );

  useEffect(() => {
    if (results.length === 0 && limitState.remaining > 0) {
      openChat();
    }
  }, [results.length, limitState.remaining, openChat]);

  if (results.length === 0) {
    return (
      <NoSearchResults
        title={`${decodeURIComponent(keyword)}에 대한 검색 결과가 없어요.`}
        description="검색어의 철자가 정확한지 확인해주세요."
        description2="또는 검색어를 변경해 다시 검색할 수 있어요."
      />
    );
  }

  return (
    <ul className="flex flex-col mb-6">
      {results.map((searchReview, index) => (
        <li key={searchReview.board_id}>
          <ReviewArticle searchReview={searchReview} priority={index < 3} />
        </li>
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={total_pages}
        generateUrl={(page: number) => `/search/${keyword}?page=${page}&sort=${sort}`}
      />
    </ul>
  );
}
