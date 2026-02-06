import {Skeleton} from '@/shared/shadcnComponent/ui/skeleton';

export default function ProfileImageLoading() {
  return (
    <div className="rounded-full border-boldBlue border-[7px] w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48">
      <Skeleton className="w-full h-full rounded-full" />
    </div>
  );
}
