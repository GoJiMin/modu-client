import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  maxSize: number;
  inputId: string;
};

export default function ImageUploadDropZone({maxSize, inputId}: Props) {
  return (
    <label
      htmlFor={inputId}
      className="w-full h-full flex flex-col py-6 items-center justify-center select-none cursor-pointer"
    >
      <LucideIcon name="FileImage" className="w-12 h-12 md:w-16 md:h-16 mb-2 text-gray-600" />
      <div className="text-center">
        <p className="text-sm md:text-base text-gray-600 mb-1">이미지를 드래그하거나 클릭해 업로드할 수 있어요.</p>
        <p className="text-xs md:text-sm text-gray-500">최대 크기: {maxSize / 1024 / 1024}MB</p>
        <p className="text-xs md:text-sm text-gray-500">지원되는 파일 형식: JPEG, PNG, GIF, WEBP</p>
      </div>
    </label>
  );
}
