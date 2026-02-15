import {AISearchSource} from './types';
import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  source: AISearchSource;
};

export function SourceCard({source}: Props) {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'link';
    }
  };

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 w-full h-full flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-boldBlue transition-all group"
    >
      <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-boldBlue">
        {source.title}
      </h4>

      <p className="text-[12px] text-gray-500 line-clamp-3">{source.snippet}</p>

      <div className="mt-auto flex items-center gap-1 text-[12px] text-gray-400">
        <LucideIcon name="Link" className="w-3 h-3" />
        <span className="line-clamp-1">{getDomain(source.url)}</span>
      </div>
    </a>
  );
}
