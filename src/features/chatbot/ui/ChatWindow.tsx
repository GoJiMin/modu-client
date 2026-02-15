import {Suspense} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Input from './steps/Input';
import Ask from './steps/Ask';
import Search from './steps/Search';
import Result from './steps/Result';
import Error from './steps/Error';
import Loading from './steps/Loading';
import LimitExceeded from './LimitExceeded';
import ChatErrorBoundary from './ChatErrorBoundary';
import {useChatStore} from '@/entities/ai-search';
import {LucideIcon} from '@/shared/ui/icons';

export default function ChatWindow() {
  const {step, closeChat, limitState} = useChatStore(
    useShallow(state => ({
      step: state.step,
      closeChat: state.closeChat,
      limitState: state.limitState,
    })),
  );

  const isLimitReached = limitState.remaining <= 0;
  const shouldBlock = isLimitReached && step !== 'result';

  return (
    <section
      className={`
        relative flex flex-col bg-neutral-100 shadow-2xl overflow-hidden
        w-full h-full rounded-none
        md:w-[500px] md:h-[700px] md:rounded-2xl
      `}
    >
      <header className="py-3 bg-white border-b flex justify-center items-center relative shrink-0">
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
        <button onClick={closeChat} aria-label="닫기" className="absolute right-5 md:hidden ">
          <LucideIcon name="X" className="w-6 h-6 text-gray-500" />
        </button>
      </header>
      <section className="p-2 pt-4 md:p-4 h-full overflow-y-auto">
        {shouldBlock ? (
          <LimitExceeded />
        ) : (
          <>
            {step === 'input' && <Input />}
            {step === 'ask' && <Ask />}
            {step === 'search' && <Search />}
            {step === 'result' && (
              <ChatErrorBoundary fallback={Error}>
                <Suspense fallback={<Loading />}>
                  <Result />
                </Suspense>
              </ChatErrorBoundary>
            )}
          </>
        )}
      </section>
    </section>
  );
}
