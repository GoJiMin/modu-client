import Link from 'next/link';
import {Button} from '@/shared/shadcnComponent/ui/button';
import {LucideIcon} from '@/shared/ui/icons';
import { LOGIN_URL } from '@/entities/auth';

type Props = {
  error: Error & {digest?: string};
};

export default function OAuth2ErrorFallback({error}: Props) {
  return (
    <section className="h-full flex flex-col justify-center items-center">
      <LucideIcon name="Frown" className="w-28 h-28 md:w-40 md:h-40 mb-6" />
      <h2 className="text-2xl md:text-3xl mb-6">로그인 실패</h2>
      <article className="flex flex-col items-center mb-6">
        <p>로그인 과정에 문제가 발생했어요.</p>
        <p className="mb-5">실패 이유: {error.message}</p>
        <p>문제가 반복된다면 아래 메일로 문의해주세요.</p>
        <p>modureviewclient@gmail.com</p>
      </article>
      <Link href={LOGIN_URL}>
        <Button>다시 로그인하기</Button>
      </Link>
    </section>
  );
}
