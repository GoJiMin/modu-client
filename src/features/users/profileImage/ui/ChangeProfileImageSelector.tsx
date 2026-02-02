import {ChangeEvent} from 'react';
import {useUpdateGlobalError} from '@/entities/error';
import {createClientError} from '@/shared/lib/utils/client-error';
import {ImageUploadDragArea} from '@/shared/ui/components';
import {LucideIcon} from '@/shared/ui/icons';

type Props = {
  onSelectFile: (file: File) => void;
};

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_EXCEEDED = 5 * 1024 * 1024;

export default function ChangeProfileImageSelector({onSelectFile}: Props) {
  const updateGlobalError = useUpdateGlobalError();

  const validateFile = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      updateGlobalError(createClientError('NOT_SUPPORTED_FILE'));

      return false;
    }

    if (file.size > MAX_SIZE_EXCEEDED) {
      updateGlobalError(createClientError('FILE_SIZE_EXCEEDED'));

      return false;
    }

    return true;
  };

  const handleDropImage = (file: File) => {
    if (validateFile(file)) {
      onSelectFile(file);
    }
  };

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const files = event.target.files;
    if (files && files[0] && validateFile(files[0])) {
      onSelectFile(files[0]);
    }
  };

  return (
    <ImageUploadDragArea onFile={handleDropImage} onError={updateGlobalError}>
      <input
        className="hidden"
        id="profile-image"
        type="file"
        size={MAX_SIZE_EXCEEDED}
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={handleChangeImage}
      />
      <label
        htmlFor="profile-image"
        aria-label="이미지 업로드"
        className="w-full h-full flex flex-col items-center justify-center select-none cursor-pointer py-6"
      >
        <LucideIcon name="FileImage" className="w-12 h-12 md:w-14 md:h-14 mb-2 text-gray-600" />
        <div className="text-center">
          <p className="text-sm md:text-base text-gray-600 mb-1">사진을 드래그하거나 클릭해 업로드할 수 있어요.</p>
          <p className="text-xs md:text-sm text-gray-500">최대 크기: {MAX_SIZE_EXCEEDED / 1024 / 1024}MB</p>
          <p className="text-xs md:text-sm text-gray-500">지원되는 파일 형식: JPEG, JPG, PNG</p>
        </div>
      </label>
    </ImageUploadDragArea>
  );
}
