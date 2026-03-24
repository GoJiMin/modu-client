import {useShallow} from 'zustand/react/shallow';
import ChatRestartButton from './ChatRestartButton';
import {BotResponse, ChatBubble, Step, useChatStore} from '@/entities/ai-search';

export default function Ask() {
  const {keyword, setStep} = useChatStore(
    useShallow(state => ({
      keyword: state.keyword,
      setStep: state.setStep,
    })),
  );

  return (
    <Step>
      <BotResponse>
        <ChatBubble>
          혹시 <strong>{`"${keyword}"`}</strong>에 대한 후기를 못 찾으셨나요?
        </ChatBubble>
        <ChatBubble>제가 대신 검색해서 요약해 드릴 수 있어요!</ChatBubble>
      </BotResponse>
      <div className="flex flex-col gap-2">
        <ChatRestartButton text="아니요, 다른 거 검색할래요" />
        <button
          onClick={() => setStep('search')}
          className="bg-mediumBlue text-white py-2.5 w-full rounded-full font-semibold hover:bg-boldBlue transition-colors"
        >
          네, 찾아주세요!
        </button>
      </div>
    </Step>
  );
}
