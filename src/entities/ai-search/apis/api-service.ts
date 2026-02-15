import {Category} from '@/entities/review';
import {requestGet} from '@/shared/apis';
import {AISearchResult} from '../model/types';

export async function getAIReviewSummary(keyword: string, category: Category) {
  return await requestGet<AISearchResult>({
    baseUrl: process.env.NEXT_PUBLIC_CLIENT_URL,
    endpoint: '/api/search',
    queryParams: {
      keyword,
      category,
    },
  });
}
