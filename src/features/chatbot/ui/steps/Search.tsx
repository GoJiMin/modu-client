import {useShallow} from 'zustand/react/shallow';
import ChatRestartButton from './ChatRestartButton';
import {BotResponse, ChatBubble, Step, useChatStore} from '@/entities/ai-search';
import {CATEGORY_LIST} from '@/entities/review';
import {LucideIcon} from '@/shared/ui/icons';

export default function Search() {
  const {keyword, category, setCategory, setStep} = useChatStore(
    useShallow(state => ({
      keyword: state.keyword,
      category: state.category,
      setCategory: state.setCategory,
      setStep: state.setStep,
    })),
  );

  const handleSearch = async () => {
    setStep('result');
  };

  return (
    <Step>
      <BotResponse>
        <ChatBubble>
          <strong>{`"${keyword}"`}</strong>에 대한 솔직한 후기를 모아드릴게요!
        </ChatBubble>
        <ChatBubble>
          정확한 분석을 위해
          <br />
          어떤 <strong>카테고리</strong>인지 알려주세요.
        </ChatBubble>
      </BotResponse>

      <ul className="flex flex-wrap gap-2 pl-11 mt-6">
        {CATEGORY_LIST.filter(c => c.id !== 'all').map(({id, value, label}) => (
          <li key={id}>
            <button
              className={`
                px-3 py-1.5 rounded-full text-sm border transition-all duration-200
                ${
                  category === value
                    ? 'bg-lightBlue border-mediumBlue text-mediumBlue font-bold shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }
              `}
              aria-label={`카테고리: ${label}`}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 mt-auto">
        <ChatRestartButton text="다시 입력하기" />
        <button
          onClick={handleSearch}
          disabled={category === 'all'}
          className="flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold transition-all bg-mediumBlue text-white hover:bg-boldBlue disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <LucideIcon name="Search" className="w-4 h-4" />
          분석 시작하기
        </button>
      </div>
    </Step>
  );
}
