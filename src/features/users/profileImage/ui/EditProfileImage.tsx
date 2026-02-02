import ChangeProfileImageDialog from './ChangeProfileImageDialog';
import DeleteProfileImageDialog from './DeleteProfileImageDialog';
import {useUserNickname} from '@/entities/auth';
import {Popover, PopoverContent, PopoverTrigger} from '@/shared/shadcnComponent/ui/popover';
import {LucideIcon} from '@/shared/ui/icons';

export default function EditProfileImage() {
  const userNickname = useUserNickname();

  if (!userNickname) return null;

  return (
    <Popover>
      <PopoverTrigger
        aria-label="프로필 이미지 수정"
        className="absolute bottom-2 right-3 md:right-4 lg:right-6 flex items-center justify-center rounded-full w-7 md:w-8 h-7 md:h-8 bg-gray-100 border-boldBlue border-[3px] hover:bg-boldBlue hover:text-white transition-colors"
      >
        <LucideIcon name="PencilLine" className="w-4 md:w-5 h-4 md:h-5" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col items-start w-[160px] gap-2 rounded-2xl px-3">
        <ChangeProfileImageDialog />
        <DeleteProfileImageDialog userNickname={userNickname} />
      </PopoverContent>
    </Popover>
  );
}
