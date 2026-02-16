import {AISearchResult} from '../types';
import {CHAT_HISTORY_MAX_COUNT, CHAT_HISTORY_STORAGE_KEY, useChatStore} from '../chatStore';

const searchResultStub: AISearchResult = {
  status: 'success',
  summary: '양이 넉넉하고 가격 대비 만족도가 높다는 후기가 많아요.',
  sources: [
    {
      title: '프레드피자 리뷰',
      url: 'https://example.com/reviews/fred-pizza',
      snippet: '토핑이 풍부하고 가성비가 좋다는 의견이 많았어요.',
    },
  ],
};

function resetChatStore() {
  useChatStore.setState({
    isOpen: false,
    step: 'input',
    keyword: '',
    category: 'all',
    result: null,
    limitState: {usage: 0, maxLimit: 0, remaining: 0},
    history: [],
    selectedHistoryId: null,
  });
}

describe('src/entities/ai-search/model/chatStore.ts', () => {
  beforeEach(() => {
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    resetChatStore();
  });

  it('검색 결과를 히스토리에 추가하면 로컬 스토리지에 함께 저장된다.', () => {
    useChatStore.getState().addHistory({
      keyword: '프레드피자',
      category: 'food',
      result: searchResultStub,
    });

    const storeState = useChatStore.getState();
    expect(storeState.history).toHaveLength(1);
    expect(storeState.history[0]).toMatchObject({
      keyword: '프레드피자',
      category: 'food',
      result: searchResultStub,
    });
    expect(storeState.history[0].id).toEqual(expect.any(String));
    expect(storeState.history[0].savedAt).toEqual(expect.any(Number));

    const persistedRaw = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    expect(persistedRaw).not.toBeNull();

    const persistedState = JSON.parse(persistedRaw!);
    expect(persistedState).toMatchObject({
      state: {
        history: [
          expect.objectContaining({
            keyword: '프레드피자',
            category: 'food',
          }),
        ],
      },
    });
  });

  it('히스토리 단계를 열면 step이 history로 전환된다.', () => {
    useChatStore.getState().openHistory();

    expect(useChatStore.getState().step).toBe('history');
  });

  it('히스토리 항목을 열면 result 단계로 이동하고 해당 결과가 설정된다.', () => {
    useChatStore.getState().addHistory({
      keyword: '프레드피자',
      category: 'food',
      result: searchResultStub,
    });
    const historyId = useChatStore.getState().history[0].id;

    useChatStore.getState().openHistoryResult(historyId);

    const state = useChatStore.getState();
    expect(state.step).toBe('result');
    expect(state.keyword).toBe('프레드피자');
    expect(state.category).toBe('food');
    expect(state.result).toEqual(searchResultStub);
    expect(state.selectedHistoryId).toBe(historyId);
  });

  it('히스토리 항목 삭제 시 목록에서 제거되고 선택 상태도 초기화된다.', () => {
    useChatStore.getState().addHistory({
      keyword: '프레드피자',
      category: 'food',
      result: searchResultStub,
    });
    const historyId = useChatStore.getState().history[0].id;

    useChatStore.getState().openHistoryResult(historyId);
    useChatStore.getState().removeHistory(historyId);

    const state = useChatStore.getState();
    expect(state.history).toHaveLength(0);
    expect(state.selectedHistoryId).toBeNull();
  });

  it('히스토리는 최대 20개까지만 유지되고 초과 저장 시 가장 오래된 항목이 제거된다.', () => {
    for (let i = 0; i <= CHAT_HISTORY_MAX_COUNT; i += 1) {
      useChatStore.getState().addHistory({
        keyword: `프레드피자-${i}`,
        category: 'food',
        result: searchResultStub,
      });
    }

    const {history} = useChatStore.getState();

    expect(history).toHaveLength(CHAT_HISTORY_MAX_COUNT);
    expect(history[0].keyword).toBe(`프레드피자-${CHAT_HISTORY_MAX_COUNT}`);
    expect(history[history.length - 1].keyword).toBe('프레드피자-1');
    expect(history.some(item => item.keyword === '프레드피자-0')).toBe(false);
  });
});
