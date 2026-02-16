import {useShallow} from 'zustand/react/shallow';
import {useChatStore} from '@/entities/ai-search';
import {LucideIcon} from '@/shared/ui/icons';

export default function ChatWindowHeader() {
  const {step, closeChat, openHistory, goToInput, limitState} = useChatStore(
    useShallow(state => ({
      step: state.step,
      closeChat: state.closeChat,
      openHistory: state.openHistory,
      goToInput: state.goToInput,
      limitState: state.limitState,
    })),
  );

  const isHistoryStep = step === 'history';
  const isLimitReached = limitState.remaining <= 0;

  return (
    <header className="py-3 md:py-4 bg-white border-b flex justify-center items-center relative shrink-0">
      <button
        onClick={isHistoryStep ? goToInput : openHistory}
        aria-label={isHistoryStep ? '검색 단계로 이동' : '저장 기록 보기'}
        className="absolute left-6 md:left-7 flex items-center text-gray-500 hover:text-mediumBlue transition-colors"
      >
        <LucideIcon name={isHistoryStep ? 'Search' : 'History'} className="w-6 h-6" />
      </button>
      <div className="flex flex-col items-center gap-1">
        <h3 className="font-bold text-lg text-gray-800 leading-tight">모후봇</h3>
        <span
          className={`
            text-sm font-medium px-2 py-0.5 rounded-full
            ${isLimitReached ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-mediumBlue'}
          `}
        >
          오늘 남은 횟수 {limitState.remaining} / {limitState.maxLimit}
        </span>
      </div>
      <button onClick={closeChat} aria-label="닫기" className="absolute right-6 md:hidden ">
        <LucideIcon name="X" className="w-6 h-6 text-gray-500" />
      </button>
    </header>
  );
}
