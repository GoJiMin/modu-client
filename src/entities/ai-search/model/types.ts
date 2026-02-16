import {Category} from '@/entities/review';

export type AISearchSource = {
  title: string;
  url: string;
  snippet: string;
};

export type AISearchResult = {
  status: 'success' | 'fail';
  summary: string;
  sources: AISearchSource[];
};

export type ChatHistoryItem = {
  id: string;
  keyword: string;
  category: Category;
  result: AISearchResult;
  savedAt: number;
};

export type AISearchCategory = Exclude<Category, 'all'>;

export type SearchLimitState = {
  usage: number;
  maxLimit: number;
  remaining: number;
};
