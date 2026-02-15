import {LucideIcon} from '@/shared/ui/icons';

export function BotAvatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-mediumBlue flex items-center justify-center shrink-0 mt-1">
      <LucideIcon name="Bot" className="w-7 h-7 text-white" />
    </div>
  );
}
