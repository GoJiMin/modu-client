import {useChatStore, BotResponse, ChatBubble, Step} from '@/entities/ai-search';
import {LoginButton} from '@/features/auth';

export default function LimitExceeded() {
  const limitState = useChatStore(state => state.limitState);

  const isGuest = limitState.maxLimit === 1;

  return (
    <Step className="flex flex-col gap-4 h-full">
      <BotResponse>
        <ChatBubble>
          <strong>오늘의 무료 검색 횟수</strong>를 모두 사용했어요!
          <br />
          아직 실험 단계의 기능으로 검색 횟수가 제한적이에요.
        </ChatBubble>
        {isGuest ? (
          <ChatBubble>
            로그인하시면 매일 <strong>3번</strong> 더 검색할 수 있어요.
          </ChatBubble>
        ) : (
          <ChatBubble>내일 다시 오시면 제가 다시 열심히 찾아드릴게요!</ChatBubble>
        )}
      </BotResponse>
      {isGuest && <LoginButton className="bg-mediumBlue text-white py-2.5 rounded-full hover:bg-boldBlue" />}
    </Step>
  );
}
