import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  isOpen: boolean;
  toogleChatBot: () => void;
};

export default function ChatBotTrigger({isOpen, toogleChatBot}: Props) {
  return (
    <button
      className={`w-12 md:w-14 h-12 md:h-14 rounded-full shadow-lg flex justify-center items-center transition-all duration-300 ease-in-out hover:scale-105 ${isOpen ? 'bg-gray-300' : 'bg-mediumBlue'}`}
      aria-label={isOpen ? '챗봇 닫기' : '챗봇 열기'}
      onClick={toogleChatBot}
    >
      <LucideIcon
        className={`w-7 md:w-8 h-7 md:h-8 transition-colors duration-300 ease-in-out ${isOpen ? 'text-gray-700' : 'text-white'}`}
        name={isOpen ? 'BotOff' : 'Bot'}
      />
    </button>
  );
}
