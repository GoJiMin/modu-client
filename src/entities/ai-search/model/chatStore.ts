import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {AISearchCategory, AISearchResult, ChatHistoryItem, SearchLimitState} from './types';
import {Category} from '@/entities/review';

type ChatStep = 'input' | 'ask' | 'search' | 'result' | 'history';

type State = {
  isOpen: boolean;
  step: ChatStep;
  keyword: string;
  category: Category;
  result: AISearchResult | null;
  limitState: SearchLimitState;
  history: ChatHistoryItem[];
  selectedHistoryId: string | null;
};

type Action = {
  openChat: (keyword?: string) => void;
  closeChat: () => void;

  goToInput: () => void;
  openHistory: () => void;
  openHistoryResult: (historyId: string) => void;
  setStep: (step: ChatStep) => void;
  setCategory: (category: AISearchCategory) => void;
  setKeyword: (keyword: string) => void;
  setResult: (result: AISearchResult) => void;

  addHistory: (history: Omit<ChatHistoryItem, 'id' | 'savedAt'>) => void;
  removeHistory: (historyId: string) => void;
  clearHistory: () => void;

  setLimit: (limit: SearchLimitState) => void;
  decreaseLimit: () => void;
};

export const CHAT_HISTORY_STORAGE_KEY = 'chatbot-history-storage';
export const CHAT_HISTORY_MAX_COUNT = 20;

const createHistoryId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const useChatStore = create<State & Action>()(
  persist(
    set => ({
      isOpen: false,
      step: 'input',
      keyword: '',
      category: 'all',
      result: null,
      limitState: {usage: 0, maxLimit: 0, remaining: 0},
      history: [],
      selectedHistoryId: null,

      openChat: () => set({isOpen: true}),
      closeChat: () => set({isOpen: false, category: 'all', selectedHistoryId: null}),

      goToInput: () => set({step: 'input', keyword: '', result: null, category: 'all', selectedHistoryId: null}),
      openHistory: () => set({step: 'history', selectedHistoryId: null}),
      openHistoryResult: historyId =>
        set(state => {
          const historyItem = state.history.find(item => item.id === historyId);
          if (!historyItem) return state;

          return {
            step: 'result',
            keyword: historyItem.keyword,
            category: historyItem.category,
            result: historyItem.result,
            selectedHistoryId: historyItem.id,
          };
        }),
      setStep: step => set({step}),
      setCategory: category => set({category}),
      setKeyword: keyword => set({keyword}),
      setResult: result => set({result, step: 'result', selectedHistoryId: null}),

      addHistory: history =>
        set(state => ({
          history: [{...history, id: createHistoryId(), savedAt: Date.now()}, ...state.history].slice(
            0,
            CHAT_HISTORY_MAX_COUNT,
          ),
        })),
      removeHistory: historyId =>
        set(state => ({
          history: state.history.filter(item => item.id !== historyId),
          selectedHistoryId: state.selectedHistoryId === historyId ? null : state.selectedHistoryId,
        })),
      clearHistory: () => set({history: [], selectedHistoryId: null}),

      setLimit: limitState => set({limitState}),
      decreaseLimit: () =>
        set(state => ({
          limitState: {
            ...state.limitState,
            usage: state.limitState.usage + 1,
            remaining: Math.max(0, state.limitState.remaining - 1),
          },
        })),
    }),
    {
      name: CHAT_HISTORY_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({history: state.history}),
    },
  ),
);
