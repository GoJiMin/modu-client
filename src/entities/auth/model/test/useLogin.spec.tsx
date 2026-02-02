import {act} from 'react';
import {renderHook, waitFor} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {login} from '../../apis/api-service';
import {useLogin} from '../useLogin';
import {REDIRECT_STORAGE_KEY} from '../../consts/authConstants';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('../../apis/api-service', () => ({
  login: jest.fn(),
}));

jest.mock('next/navigation', () => require('next-router-mock/navigation'));

const mockLogin = login as jest.MockedFunction<typeof login>;

describe('src/entities/auth/model/useLogin.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
    sessionStorage.clear();
  });

  it('로그인 성공 시 저장된 경로로 이동한다.', async () => {
    mockLogin.mockResolvedValue();
    sessionStorage.setItem(REDIRECT_STORAGE_KEY, '/test');

    const {result} = renderHook(() => useLogin(), {
      wrapper: ({children}) => withAllContext(children),
    });

    act(() => {
      mockRouter.setCurrentUrl('/login_redirect');
      result.current.login('test@email.com');
    });

    await waitFor(() => {
      expect(mockRouter.asPath).toBe('/test');
    });
  });

  it('저장된 경로가 없다면 메인 페이지로 이동한다.', async () => {
    mockLogin.mockResolvedValue();

    const {result} = renderHook(() => useLogin(), {
      wrapper: ({children}) => withAllContext(children),
    });

    act(() => {
      mockRouter.setCurrentUrl('/login_redirect');
      result.current.login('test@email.com');
    });

    await waitFor(() => {
      expect(mockRouter.asPath).toBe('/');
    });
  });
});
