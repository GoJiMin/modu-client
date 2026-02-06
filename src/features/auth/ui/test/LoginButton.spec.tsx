import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginButton from '../LoginButton';
import mockRouter from 'next-router-mock';
import {LOGIN_URL, REDIRECT_STORAGE_KEY} from '@/entities/auth';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

describe('src/features/auth/ui/LoginButton.tsx', () => {
  beforeEach(() => {
    mockRouter.reset();
    sessionStorage.clear();
  });

  it('버튼 클릭 시 전체 경로를 인자로 로그인 페이지 이동 훅을 호출한다.', async () => {
    const user = userEvent.setup();
    const currentPullPath = '/search/pizza?page=2&sort=recent';

    mockRouter.push(currentPullPath);

    const pushSpy = jest.spyOn(mockRouter, 'push');

    render(<LoginButton />);

    const button = screen.getByRole('button');
    await user.click(button);

    // url, as, options
    expect(pushSpy).toHaveBeenCalledWith(LOGIN_URL, undefined, undefined);
    expect(sessionStorage.getItem(REDIRECT_STORAGE_KEY)).toBe(currentPullPath);
  });
});
