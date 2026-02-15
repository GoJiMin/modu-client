import {Category} from '@/entities/review';
import {getAIReviewSummary} from '../apis/api-service';

export const AISearchKeys = {
  all: ['AISearch'] as const,

  summary: (keyword: string, category: Category) => [...AISearchKeys.all, keyword, category] as const,
};

export const AISearchOptions = {
  summary: (keyword: string, category: Category) => ({
    queryKey: AISearchKeys.summary(keyword, category),
    queryFn: () => getAIReviewSummary(keyword, category),
  }),
};
