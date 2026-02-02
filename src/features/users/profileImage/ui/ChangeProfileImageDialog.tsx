'use client';

import ChangeProfileImageSelector from './ChangeProfileImageSelector';
import ChangeProfileImagePreview from './ChangeProfileImagePreview';
import {useChangeProfileImage} from '../lib/useChangeProfileImage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/shadcnComponent/ui/dialog';
import {LucideIcon} from '@/shared/ui/icons';

export default function ChangeProfileImageDialog() {
  const {profileImage, handleSetFile, handleSubmit, handleCancel} = useChangeProfileImage();

  return (
    <Dialog>
      <DialogTrigger
        aria-label="이미지 선택"
        className="w-full flex items-center justify-between hover:bg-gray-100 py-1.5 px-3 rounded-xl transition-colors"
      >
        <span>사진 선택</span>
        <LucideIcon name="Image" className="w-5 h-5" />
      </DialogTrigger>
      <DialogContent className="w-[90%] md:w-full rounded-lg">
        <DialogHeader>
          <DialogTitle>프로필 이미지 변경</DialogTitle>
          <DialogDescription>사진을 드래그하거나 클릭해 업로드할 수 있어요.</DialogDescription>
        </DialogHeader>
        {profileImage ? (
          <ChangeProfileImagePreview imageUrl={profileImage.url} onSubmit={handleSubmit} onCancel={handleCancel} />
        ) : (
          <ChangeProfileImageSelector onSelectFile={handleSetFile} />
        )}
      </DialogContent>
    </Dialog>
  );
}
