'use client';

import {useEffect, useState} from 'react';
import {LucideIcon} from '@/shared/ui/icons';
import {Step, useChatStore} from '@/entities/ai-search';

export default function Loading() {
  const keyword = useChatStore(state => state.keyword);

  const [messageIdx, setMessageIdx] = useState(0);

  const loadingMessages = [
    `"${keyword}" 리뷰를 찾고 있어요..`,
    '관련 리뷰를 발견했어요!',
    '핵심 내용만 쏙쏙 요약하는 중이에요..',
    '거의 다 됐어요! 잠시만요..',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  return (
    <Step className="justify-center items-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-lightBlue rounded-full opacity-75 animate-ping"></div>
        <div className="relative z-10 w-16 h-16 bg-mediumBlue rounded-full flex items-center justify-center shadow-lg">
          <LucideIcon name="Bot" className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 text-center max-w-[80%]">
        <h3 className="font-bold text-lg md:text-xl text-gray-800 transition-all duration-500">
          {loadingMessages[messageIdx]}
        </h3>
        <p className="text-sm text-gray-500">평균 4~5초 정도 소요 돼요.</p>
      </div>

      <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4">
        <div className="w-full h-full bg-mediumBlue animate-search-loading rounded-full"></div>
      </div>
    </Step>
  );
}
