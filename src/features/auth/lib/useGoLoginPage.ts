import {LOGIN_URL, REDIRECT_STORAGE_KEY} from '@/entities/auth';
import {useRouter} from 'next/navigation';

export default function useGoLoginPage() {
  const router = useRouter();

  const goLoginPage = (previousPath?: string) => {
    if (previousPath) {
      sessionStorage.setItem(REDIRECT_STORAGE_KEY, previousPath);
    }

    router.push(LOGIN_URL);
  };

  return {goLoginPage};
}
