import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {getSearchLimitStatus} from '@/features/chatbot';

export async function GET() {
  const cookieStore = await cookies();

  const isLoggedIn = cookieStore.has('refreshToken');

  const MAX_LIMIT = isLoggedIn ? 3 : 1;

  const limitCookie = cookieStore.get('search_limit');
  const {currentUsage, remaining} = getSearchLimitStatus(MAX_LIMIT, limitCookie);

  const searchLimit = {
    usage: currentUsage,
    maxLimit: MAX_LIMIT,
    remaining: remaining,
  };

  if (!isLoggedIn) {
    return NextResponse.json({
      isLoggedIn: false,
      userNickname: null,
      userEmail: null,
      searchLimit,
    });
  }

  const userNicknameCookie = cookieStore.get('userNickname');
  const userEmailCookie = cookieStore.get('userEmail');

  if (!userNicknameCookie) {
    return NextResponse.json({errorCode: 'EMPTY_USER_NICKNAME'}, {status: 400});
  }

  if (!userEmailCookie) {
    return NextResponse.json({errorCode: 'EMPTY_USER_EMAIL'}, {status: 400});
  }

  const userNickname = userNicknameCookie.value;
  const userEmail = userEmailCookie.value;

  return NextResponse.json(
    {
      isLoggedIn: true,
      userNickname,
      userEmail,
      searchLimit,
    },
    {status: 200},
  );
}
