import {BotAvatar} from './BotAvatar';

type Props = {
  children: React.ReactNode;
};

export function BotResponse({children}: Props) {
  return (
    <article className="flex gap-2 md:gap-3 items-start animate-fade-in">
      <BotAvatar />
      <div className="flex flex-col gap-2 max-w-[85%] text-sm md:text-base">
        <span className="text-sm font-bold text-gray-700 ml-1">모후봇</span>
        {children}
      </div>
    </article>
  );
}
