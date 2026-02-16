import {Suspense} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Input from './steps/Input';
import Ask from './steps/Ask';
import Search from './steps/Search';
import Result from './steps/Result';
import History from './steps/History';
import Error from './steps/Error';
import Loading from './steps/Loading';
import LimitExceeded from './LimitExceeded';
import ChatErrorBoundary from './ChatErrorBoundary';
import ChatWindowHeader from './ChatWindowHeader';
import {useChatStore} from '@/entities/ai-search';

export default function ChatWindow() {
  const {step, limitState} = useChatStore(
    useShallow(state => ({
      step: state.step,
      limitState: state.limitState,
    })),
  );

  const isLimitReached = limitState.remaining <= 0;
  const shouldBlock = isLimitReached && step !== 'result' && step !== 'history';

  return (
    <section
      className={`
        relative flex flex-col bg-neutral-100 shadow-2xl overflow-hidden
        w-full h-full rounded-none
        md:w-[500px] md:h-[700px] md:rounded-2xl
      `}
    >
      <ChatWindowHeader />
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
            {step === 'history' && <History />}
          </>
        )}
      </section>
    </section>
  );
}
