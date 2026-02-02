'use client';

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {login} from '../apis/api-service';
import {authQueryKeys} from './query-service';
import {REDIRECT_STORAGE_KEY} from '../consts/authConstants';
import {useRouter} from 'next/navigation';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {mutate, ...rest} = useMutation({
    mutationFn: (email: string) => login(email),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.session(),
      });

      const previousPath = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
      sessionStorage.removeItem(REDIRECT_STORAGE_KEY);

      if (previousPath) {
        router.replace(previousPath);
      } else {
        router.replace('/');
      }
    },
  });

  return {
    login: mutate,
    ...rest,
  };
}
