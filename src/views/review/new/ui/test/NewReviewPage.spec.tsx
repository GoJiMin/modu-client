import {render, screen} from '@testing-library/react';
import {cookies} from 'next/headers';
import NewReviewPage from '../NewReviewPage';

jest.mock('next/headers');
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next-router-mock/navigation'),
  redirect: () => {
    /**
     * [이슈]
     * - next-router-mock에서 redirect 함수를 지원하지 않음.
     *
     * [해결 방안]
     * - redirect 함수의 동작은 이미 프레임워크 차원에서 검증됨.
     * - 따라서 redirect 함수를 모킹해 호출되는지만 확인 후 렌더링 블락을 위해 에러 발생.
     */
    throw new Error('REDIRECT');
  },
}));
jest.mock('../NewReviewClient', () => ({
  __esModule: true,
  default: () => <div>리뷰 작성</div>,
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('src/views/review/new/ui/NewReviewPage.tsx', () => {
  it('리뷰 작성 페이지가 렌더링된다.', async () => {
    mockCookies.mockImplementation(() => {
      return Promise.resolve({
        has: () => true,
      } as any);
    });

    render(await NewReviewPage());

    expect(await screen.findByText('리뷰 작성')).toBeInTheDocument();
  });

  it('로그인 사용자가 아닌 경우 메인 페이지로 리다이렉트한다.', async () => {
    mockCookies.mockImplementation(() => {
      return Promise.resolve({
        has: () => false,
      } as any);
    });

    await expect(NewReviewPage()).rejects.toThrow('REDIRECT');
  });
});
