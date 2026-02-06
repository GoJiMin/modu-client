'use client';

import {useEffect} from 'react';
import {useSearchParams} from 'next/navigation';
import {useLogin} from '@/entities/auth';
import {createClientError} from '@/shared/lib/utils/client-error';
import {LucideIcon} from '@/shared/ui/icons';

export default function OAuth2RedirectPage() {
  const searchParams = useSearchParams();
  const {login, isSuccess} = useLogin();

  useEffect(() => {
    if (isSuccess) {
      return;
    }

    const email = searchParams.get('user_email');

    if (!email) {
      throw createClientError('EMPTY_USER_EMAIL');
    }

    login(email);
  }, [searchParams, login, isSuccess]);

  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <LucideIcon name="ScanFace" className="w-32 h-32 md:w-40 md:h-40 mb-6 animate-pulse" />
      <h2 className="text-2xl md:text-3xl mb-4">로그인 중이에요..</h2>
      <p>로그인이 완료될 때까지</p>
      <p>잠시만 기다려주세요.</p>
    </section>
  );
}
