'use client';

import {ProfileImage, ProfileImageLoading} from '@/features/users/profileImage';
import {RQProvider} from '@/shared/providers';

type Props = {
  userNickname: string;
};
export default function UserInfo({userNickname}: Props) {
  return (
    <section className="flex justify-center px-5 pt-8 pb-8 md:pb-14 md:pt-10 lg:pb-20 lg:pt-10">
      <div className="flex flex-col items-center">
        <RQProvider LoadingFallback={<ProfileImageLoading />}>
          <ProfileImage userNickname={userNickname} />
        </RQProvider>

        <p className="text-xl mt-4 lg:text-2xl font-bold mb-2">{userNickname}</p>
      </div>
    </section>
  );
}
