import {create} from 'zustand';
import {AISearchCategory, AISearchResult, SearchLimitState} from './types';
import {Category} from '@/entities/review';

type ChatStep = 'input' | 'ask' | 'search' | 'result';

type State = {
  isOpen: boolean;
  step: ChatStep;
  keyword: string;
  category: Category;
  result: AISearchResult | null;
  limitState: SearchLimitState;
};

type Action = {
  openChat: (keyword?: string) => void;
  closeChat: () => void;

  goToInput: () => void;
  setStep: (step: ChatStep) => void;
  setCategory: (category: AISearchCategory) => void;
  setKeyword: (keyword: string) => void;
  setResult: (result: AISearchResult) => void;

  setLimit: (limit: SearchLimitState) => void;
  decreaseLimit: () => void;
};

export const useChatStore = create<State & Action>(set => ({
  isOpen: false,
  step: 'input',
  keyword: '',
  category: 'all',
  result: null,
  limitState: {usage: 0, maxLimit: 0, remaining: 0},

  openChat: () => set({isOpen: true}),
  closeChat: () => set({isOpen: false, category: 'all'}),

  goToInput: () => set({step: 'input', keyword: '', result: null, category: 'all'}),
  setStep: step => set({step}),
  setCategory: category => set({category}),
  setKeyword: keyword => set({keyword}),
  setResult: result => set({result, step: 'result'}),

  setLimit: limitState => set({limitState}),
  decreaseLimit: () =>
    set(state => ({
      limitState: {
        ...state.limitState,
        usage: state.limitState.usage + 1,
        remaining: Math.max(0, state.limitState.remaining - 1),
      },
    })),
}));
