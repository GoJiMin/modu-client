import {HTMLAttributes} from 'react';
import Image from 'next/image';
import {useGetProfileImageByUserNickname} from '@/entities/users';
import {cn} from '@/shared/lib/utils/cn';

type Props = {
  userNickname: string;
} & HTMLAttributes<HTMLDivElement>;

export default function ProfileImage({userNickname, className}: Props) {
  const {data} = useGetProfileImageByUserNickname(userNickname);

  return (
    <div
      className={cn(
        className,
        'flex justify-center items-center rounded-full border-boldBlue border-[7px] overflow-hidden w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48',
      )}
    >
      <Image
        src={data.profileImage}
        alt={`${userNickname} 프로필 이미지`}
        width={160}
        height={160}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}
