import {useShallow} from 'zustand/react/shallow';
import {BotResponse, ChatBubble, Step, useChatStore} from '@/entities/ai-search';
import {CATEGORY_MAP} from '@/entities/review';
import {LucideIcon} from '@/shared/ui/icons';

export default function History() {
  const {history, openHistoryResult, removeHistory, goToInput} = useChatStore(
    useShallow(state => ({
      history: state.history,
      openHistoryResult: state.openHistoryResult,
      removeHistory: state.removeHistory,
      goToInput: state.goToInput,
    })),
  );

  if (history.length === 0) {
    return (
      <Step className="gap-4">
        <BotResponse>
          <ChatBubble>
            저장된 결과가 아직 없어요.
            <br />
            결과 화면에서 <strong>결과 저장하기</strong>를 눌러 모아보세요.
          </ChatBubble>
        </BotResponse>
        <button
          onClick={goToInput}
          className="mt-auto bg-mediumBlue text-white py-2.5 w-full rounded-full font-semibold hover:bg-boldBlue transition-colors"
        >
          검색하러 가기
        </button>
      </Step>
    );
  }

  return (
    <Step className="gap-4 h-fit min-h-full justify-start">
      <BotResponse>
        <ChatBubble>
          저장해둔 요약 기록이에요.
          <br />
          원하는 항목을 누르면 결과를 다시 보여드릴게요.
        </ChatBubble>
        <ChatBubble>
          결과는 최대 20개까지 저장되고,
          <br />
          20개 초과 시 가장 오래된 결과부터 사라져요.
        </ChatBubble>
      </BotResponse>

      <ul className="flex flex-col gap-4">
        {history.map(item => (
          <li key={item.id} className="flex flex-col gap-2">
            <ChatBubble variant="user">{item.keyword}</ChatBubble>

            <BotResponse>
              <div className="flex gap-2 items-start">
                <button
                  onClick={() => openHistoryResult(item.id)}
                  aria-label={`히스토리 열기: ${item.keyword}`}
                  className="flex-1 rounded-lg rounded-tl-none bg-white p-3 border border-gray-100 shadow-sm text-left hover:border-mediumBlue/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>카테고리: {CATEGORY_MAP[item.category]}</span>
                    <span>출처 {item.result.sources.length}개</span>
                  </div>
                  <p className="mt-2 text-sm md:text-base text-gray-700 line-clamp-3 break-keep">
                    {item.result.summary}
                  </p>
                </button>

                <button
                  onClick={() => removeHistory(item.id)}
                  aria-label={`히스토리 삭제: ${item.keyword}`}
                  className="shrink-0 rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <LucideIcon name="Trash2" className="w-4 h-4" />
                </button>
              </div>
            </BotResponse>
          </li>
        ))}
      </ul>
    </Step>
  );
}
