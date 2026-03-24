import {useEffect, useRef, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import SourceCarousel from './SourceCarousel';
import ChatRestartButton from './ChatRestartButton';
import {
  AISearchResult,
  AISearchSource,
  BotResponse,
  ChatBubble,
  FormattedSummary,
  Step,
  useChatStore,
  useGetAIReviewSummary,
} from '@/entities/ai-search';
import {Category} from '@/entities/review';

type ResultContentProps = {
  summary: string;
  sources: AISearchSource[];
  onSave?: () => void;
  isSaved?: boolean;
};

function ResultContent({summary, sources, onSave, isSaved = false}: ResultContentProps) {
  return (
    <Step className="gap-6 h-fit min-h-full">
      <BotResponse>
        <ChatBubble>
          <FormattedSummary text={summary} />
        </ChatBubble>
      </BotResponse>

      {sources.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-gray-500 ml-1">참고한 리뷰 출처 ({sources.length})</span>
          <SourceCarousel sources={sources} />
        </div>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`
              py-2.5 w-full rounded-full font-semibold transition-colors border
              ${
                isSaved
                  ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'border-mediumBlue text-mediumBlue bg-white hover:bg-lightBlue/20'
              }
            `}
          >
            {isSaved ? '히스토리에 저장됨' : '결과 저장하기'}
          </button>
        )}
        <ChatRestartButton />
      </div>
    </Step>
  );
}

type LiveResultProps = {
  keyword: string;
  category: Category;
};

function LiveResult({keyword, category}: LiveResultProps) {
  const {setResult, decreaseLimit} = useChatStore(
    useShallow(state => ({
      setResult: state.setResult,
      decreaseLimit: state.decreaseLimit,
    })),
  );

  const {data} = useGetAIReviewSummary(keyword, category);
  const isSuccess = data.status === 'success';

  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!hasProcessedRef.current) {
      if (isSuccess) {
        decreaseLimit();
      }

      setResult(data);
      hasProcessedRef.current = true;
    }
  }, [decreaseLimit, isSuccess, data, setResult]);

  return (
    <Step className="gap-6 h-fit min-h-full">
      <BotResponse>
        <ChatBubble>열심히 요약하고 있어요! 잠시만 기다려주세요...</ChatBubble>
      </BotResponse>
    </Step>
  );
}
export default function Result() {
  const {keyword, category, result, selectedHistoryId, addHistory} = useChatStore(
    useShallow(state => ({
      keyword: state.keyword,
      category: state.category,
      result: state.result,
      selectedHistoryId: state.selectedHistoryId,
      addHistory: state.addHistory,
    })),
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (searchResult: AISearchResult) => {
    if (isSaved) return;
    addHistory({keyword, category, result: searchResult});
    setIsSaved(true);
  };

  if (result) {
    const isSuccess = result.status === 'success';
    const canSave = !selectedHistoryId && isSuccess;

    return (
      <ResultContent
        summary={result.summary}
        sources={result.sources}
        onSave={canSave ? () => handleSave(result) : undefined}
        isSaved={isSaved}
      />
    );
  }

  return <LiveResult keyword={keyword} category={category} />;
}
