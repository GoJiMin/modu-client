import {LOGIN_URL, REDIRECT_STORAGE_KEY} from '@/entities/auth';
import {login} from '@/entities/auth/apis/api-service';
import {render, screen, waitFor} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import OAuth2RedirectPage from '../OAuth2RedirectPage';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import {ErrorBoundary} from 'react-error-boundary';
import OAuth2ErrorFallback from '../OAuth2ErrorFallback';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/auth/apis/api-service', () => ({
  login: jest.fn(),
}));

const mockLogin = login as jest.MockedFunction<typeof login>;

describe('src/views/oauth2/ui/OAuth2RedirectPage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter.reset();
    sessionStorage.clear();
  });

  it('로그인 완료 후 이전 경로가 있을 경우 기존 경로로 이동한다.', async () => {
    let resolveLogin: any;
    mockLogin.mockImplementation(() => {
      return new Promise(resolve => {
        resolveLogin = resolve;
      });
    });

    sessionStorage.setItem(REDIRECT_STORAGE_KEY, '/search');

    const TEST_EMAIL = 'jimin@email.com';
    mockRouter.push(`/oauth2/redirect?user_email=${TEST_EMAIL}`);

    render(withAllContext(<OAuth2RedirectPage />));

    expect(screen.getByText('로그인 중이에요..')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith(TEST_EMAIL);
    });

    resolveLogin('success');

    await waitFor(async () => {
      expect(mockRouter.asPath).toBe('/search');
      expect(sessionStorage.getItem(REDIRECT_STORAGE_KEY)).toBeNull();
    });
  });

  it('로그인 완료 후 이전 경로가 없다면 메인 페이지로 이동한다.', async () => {
    let resolveLogin: any;
    mockLogin.mockImplementation(() => {
      return new Promise(resolve => {
        resolveLogin = resolve;
      });
    });

    const TEST_EMAIL = 'jimin@email.com';
    mockRouter.push(`/oauth2/redirect?user_email=${TEST_EMAIL}`);

    render(withAllContext(<OAuth2RedirectPage />));

    expect(screen.getByText('로그인 중이에요..')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith(TEST_EMAIL);
    });

    resolveLogin('success');

    await waitFor(() => {
      expect(mockRouter.asPath).toBe('/');
    });
  });

  it('이메일 정보가 없다면 에러가 발생하며, 대체 UI가 표시된다.', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRouter.push(`/oauth2/redirect?user_email=`);

    render(
      withAllContext(
        <ErrorBoundary fallbackRender={({error}) => <OAuth2ErrorFallback error={error} />}>
          <OAuth2RedirectPage />
        </ErrorBoundary>,
      ),
    );

    expect(screen.getByText('로그인 실패')).toBeInTheDocument();
    expect(screen.getByText('실패 이유: 이메일 정보가 존재하지 않아요.')).toBeInTheDocument();

    const loginButton = screen.getByRole('link', {name: '다시 로그인하기'});
    expect(loginButton).toHaveAttribute('href', LOGIN_URL);

    consoleErrorSpy.mockRestore();
  });
});
