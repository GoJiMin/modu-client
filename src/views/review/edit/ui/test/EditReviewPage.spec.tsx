import {render, screen} from '@testing-library/react';
import {cookies} from 'next/headers';
import ReviewEditPage from '../EditReviewPage';

jest.mock('../EditReview', () => ({
  __esModule: true,
  default: () => <div>리뷰 수정</div>,
}));
jest.mock('next/headers');

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('src/views/review/edit/ui/EditReviewPage.tsx', () => {
  it('리뷰 수정 페이지가 렌더링된다.', async () => {
    mockCookies.mockImplementation(() => {
      return Promise.resolve({
        get: (key: string) => {
          if (key === 'userNickname') {
            return {
              value: 'jimin',
            };
          }
        },
      } as any);
    });

    const params = Promise.resolve({reviewId: '5'});
    render(await ReviewEditPage({params}));

    expect(await screen.findByText('리뷰 수정')).toBeInTheDocument();
  });

  it('로그인 세션이 만료된 경우 에러가 발생한다.', async () => {
    mockCookies.mockImplementation(() => {
      return Promise.resolve({
        get: (key: string) => {
          if (key === 'userNickname') {
            return undefined;
          }
        },
      } as any);
    });

    const params = Promise.resolve({reviewId: '5'});
    await expect(ReviewEditPage({params})).rejects.toThrow('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
  });
});
