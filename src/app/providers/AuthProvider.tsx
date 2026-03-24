'use client';

import {useEffect} from 'react';
import {useGetSession, useUpdateUser} from '@/entities/auth';
import {useChatStore} from '@/entities/ai-search';

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({children}: Props) {
  const {session, isSuccess} = useGetSession();

  const updateUser = useUpdateUser();
  const setChatLimit = useChatStore(state => state.setLimit);

  useEffect(() => {
    if (session) {
      if (session.isLoggedIn) {
        updateUser({
          isLoggedIn: true,
          userNickname: decodeURIComponent(session.userNickname),
          userEmail: session.userEmail,
        });
      } else {
        updateUser({
          isLoggedIn: false,
          userNickname: null,
          userEmail: null,
        });
      }
      setChatLimit({
        usage: session.searchLimit.usage,
        maxLimit: session.searchLimit.maxLimit,
        remaining: session.searchLimit.remaining,
      });
    }
  }, [updateUser, session, isSuccess, setChatLimit]);

  return children;
}
