'use client';

import {FallbackProps} from 'react-error-boundary';
import {BotResponse, ChatBubble, Step} from '@/entities/ai-search';
import {useChatStore} from '@/entities/ai-search';
import {RequestGetError} from '@/shared/apis/request-error';
import {SERVER_ERROR_MESSAGE} from '@/shared/lib/consts/errorMessage';
import {LucideIcon} from '@/shared/ui/icons';

function getErrorMessage(error: Error) {
  if (error instanceof RequestGetError) {
    return SERVER_ERROR_MESSAGE[error.name];
  }

  return '알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해주세요. 😥';
}

export default function Error({error, resetErrorBoundary}: FallbackProps) {
  const goToInput = useChatStore(state => state.goToInput);

  const errorMessage = getErrorMessage(error);

  const handleRetry = () => {
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    resetErrorBoundary();
    goToInput();
  };

  return (
    <Step>
      <BotResponse>
        <ChatBubble>문제가 생겨 후기를 가져오지 못했어요. 😭</ChatBubble>
        <div className="bg-red-50 p-3 text-sm md:text-base rounded-lg rounded-tl-none shadow-sm border border-red-200 text-red-600 break-keep">
          {errorMessage}
        </div>
      </BotResponse>

      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={handleRetry}
          className="flex items-center justify-center gap-2 bg-white text-mediumBlue border border-mediumBlue py-2.5 w-full rounded-full font-semibold hover:bg-white/5 transition-colors"
        >
          <LucideIcon name="RotateCw" className="w-4 h-4" />
          다시 시도하기
        </button>
        <button
          onClick={handleGoHome}
          className="flex items-center justify-center gap-2 bg-mediumBlue text-white py-2.5 w-full rounded-full font-semibold hover:bg-boldBlue transition-colors"
        >
          <LucideIcon name="Search" className="w-4 h-4" />
          다른 검색어 입력하기
        </button>
      </div>
    </Step>
  );
}
