import {revalidateTag} from 'next/cache';
import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

export async function PATCH(req: NextRequest, {params}: {params: Promise<{reviewId: string}>}) {
  const {reviewId} = await params;

  if (!reviewId) {
    return NextResponse.json(
      {
        title: 'REVIEW_ID_MISSING',
        detail: '리뷰 ID가 제공되지 않았습니다. 다시 시도해주세요',
        status: 400,
      },
      {
        status: 400,
      },
    );
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken');
  const userNicknameToken = cookieStore.get('userNickname');

  if (!accessToken || !userNicknameToken) {
    return NextResponse.json(
      {
        title: 'UNAUTHORIZED',
        detail: '로그인이 필요한 서비스에요. 다시 로그인해주세요.',
        status: 401,
      },
      {
        status: 401,
      },
    );
  }

  const reviewData = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${accessToken.value}; userNickname=${encodeURIComponent(userNicknameToken.value)}`,
    },
    body: JSON.stringify(reviewData),
  });

  if (!res.ok) {
    const errorResponse = await res.json();
    return NextResponse.json(
      {
        title: errorResponse.title || 'INTERNAL_SERVER_ERROR',
        detail: errorResponse.detail || '예상치 못한 서버 오류가 발생했습니다.',
        status: errorResponse.status || 500,
      },
      {
        status: errorResponse.status || 500,
      },
    );
  }

  revalidateTag(`review-${reviewId}`, 'max');
  return NextResponse.json(
    {
      message: '리뷰가 성공적으로 수정되었습니다.',
    },
    {status: 200},
  );
}

export async function DELETE(_: NextRequest, {params}: {params: Promise<{reviewId: string}>}) {
  const {reviewId} = await params;

  if (!reviewId) {
    return NextResponse.json(
      {
        title: 'REVIEW_ID_MISSING',
        detail: '리뷰 ID가 제공되지 않았습니다. 다시 시도해주세요',
        status: 400,
      },
      {
        status: 400,
      },
    );
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken');
  const userNicknameToken = cookieStore.get('userNickname');

  if (!accessToken || !userNicknameToken) {
    return NextResponse.json(
      {
        title: 'UNAUTHORIZED',
        detail: '로그인이 필요한 서비스에요. 다시 로그인해주세요.',
        status: 401,
      },
      {
        status: 401,
      },
    );
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${accessToken.value}; userNickname=${encodeURIComponent(userNicknameToken.value)}`,
    },
  });

  if (!res.ok) {
    const errorResponse = await res.json();
    return NextResponse.json(
      {
        title: errorResponse.title || 'INTERNAL_SERVER_ERROR',
        detail: errorResponse.detail || '예상치 못한 서버 오류가 발생했습니다.',
        status: errorResponse.status || 500,
      },
      {
        status: errorResponse.status || 500,
      },
    );
  }

  revalidateTag(`review-${reviewId}`, 'max');
  return NextResponse.json(
    {
      message: '리뷰가 성공적으로 삭제되었습니다.',
    },
    {status: 200},
  );
}
