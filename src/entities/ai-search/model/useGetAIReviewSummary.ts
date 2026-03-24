import {useSuspenseQuery} from '@tanstack/react-query';
import {AISearchOptions} from './query-service';
import {Category} from '@/entities/review';

export function useGetAIReviewSummary(keyword: string, category: Category) {
  return useSuspenseQuery(AISearchOptions.summary(keyword, category));
}
