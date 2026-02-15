import {Session} from '../model/types';
import {requestGet} from '@/shared/apis';

export function getSession() {
  return requestGet<Session>({
    endpoint: '/api/auth',
    baseUrl: process.env.NEXT_PUBLIC_CLIENT_URL,
    errorHandlingType: 'toast',
  });
}

export async function login(email: string) {
  await requestGet({
    endpoint: '/users/login',
    queryParams: {
      email,
    },
    withResponse: false,
  });
}

export async function logout() {
  await requestGet({
    endpoint: '/users/logout',
    withResponse: false,
    errorHandlingType: 'toast',
  });
}

export async function tokenRefresh() {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/token/refresh', {
    cache: 'no-cache',
    next: {revalidate: 0},
    credentials: 'include',
  });

  return response;
}
