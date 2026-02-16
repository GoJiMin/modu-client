import {useEffect, useRef, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import SourceCarousel from './SourceCarousel';
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
  onSearchAgain: () => void;
  onSave?: () => void;
  isSaved?: boolean;
};

function ResultContent({summary, sources, onSearchAgain, onSave, isSaved = false}: ResultContentProps) {
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
        <button
          onClick={onSearchAgain}
          className="bg-mediumBlue text-white py-2.5 w-full rounded-full font-semibold hover:bg-boldBlue transition-colors"
        >
          다른 검색하기
        </button>
      </div>
    </Step>
  );
}

type LiveResultProps = {
  keyword: string;
  category: Category;
  isSaved: boolean;
  onSave: (result: AISearchResult) => void;
  onSearchAgain: () => void;
  decreaseLimit: () => void;
};

function LiveResult({keyword, category, isSaved, onSave, onSearchAgain, decreaseLimit}: LiveResultProps) {
  const {data} = useGetAIReviewSummary(keyword, category);
  const {summary, sources, status} = data;
  const isSuccess = status === 'success';

  const hasDecreasedRef = useRef(false);

  useEffect(() => {
    if (!hasDecreasedRef.current && isSuccess) {
      decreaseLimit();
      hasDecreasedRef.current = true;
    }
  }, [decreaseLimit, isSuccess]);

  return (
    <ResultContent
      summary={summary}
      sources={sources}
      onSearchAgain={onSearchAgain}
      onSave={isSuccess ? () => onSave(data) : undefined}
      isSaved={isSaved}
    />
  );
}

export default function Result() {
  const {keyword, category, result, selectedHistoryId, goToInput, addHistory, decreaseLimit} = useChatStore(
    useShallow(state => ({
      keyword: state.keyword,
      category: state.category,
      result: state.result,
      selectedHistoryId: state.selectedHistoryId,
      goToInput: state.goToInput,
      addHistory: state.addHistory,
      decreaseLimit: state.decreaseLimit,
    })),
  );

  const [isSaved, setIsSaved] = useState(false);
  const isHistoryResult = Boolean(selectedHistoryId && result);

  useEffect(() => {
    setIsSaved(false);
  }, [keyword, category, selectedHistoryId]);

  const handleSave = (searchResult: AISearchResult) => {
    if (isSaved) return;

    addHistory({
      keyword,
      category,
      result: searchResult,
    });
    setIsSaved(true);
  };

  if (isHistoryResult && result) {
    return <ResultContent summary={result.summary} sources={result.sources} onSearchAgain={goToInput} />;
  }

  return (
    <LiveResult
      keyword={keyword}
      category={category}
      isSaved={isSaved}
      onSave={handleSave}
      onSearchAgain={goToInput}
      decreaseLimit={decreaseLimit}
    />
  );
}
