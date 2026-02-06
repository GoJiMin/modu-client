import {render, screen, waitFor} from '@testing-library/react';
import AuthProvider from '../AuthProvider';
import {useIsLoggedIn, useUserEmail, useUserNickname} from '@/entities/auth';
import {getSession} from '@/entities/auth/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/auth/apis/api-service');

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('src/app/providers/AuthProvider.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function TestComponent() {
    const isLoggedIn = useIsLoggedIn();
    const userNickname = useUserNickname();
    const userEmail = useUserEmail();

    if (!isLoggedIn) return <div>비로그인</div>;

    return (
      <div>
        <p>{userNickname}</p>
        <p>{userEmail}</p>
      </div>
    );
  }

  it('어플리케이션이 로딩될 때 세션 정보를 불러와 공유한다.', async () => {
    mockGetSession.mockResolvedValue({
      isLoggedIn: true,
      userNickname: '지민',
      userEmail: 'jimin@email.com',
    });

    render(
      withAllContext(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      ),
    );

    expect(screen.getByText('비로그인')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
    });

    expect(screen.getByText('지민')).toBeInTheDocument();
    expect(screen.getByText('jimin@email.com')).toBeInTheDocument();
  });

  it('세션 정보가 유효하지 않다면 비로그인 상태로 설정된다.', async () => {
    mockGetSession.mockResolvedValue({
      isLoggedIn: false,
      userNickname: null,
      userEmail: null,
    });

    render(
      withAllContext(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      ),
    );

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
    });

    expect(screen.getByText('비로그인')).toBeInTheDocument();
  });

  it('인코딩된 닉네임이 전달되면 디코딩하여 저장한다.', async () => {
    const ENCODED_NAME = '%EC%A7%80%EB%AF%BC';

    mockGetSession.mockResolvedValue({
      isLoggedIn: true,
      userNickname: ENCODED_NAME,
      userEmail: 'jimin@email.com',
    });

    render(
      withAllContext(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      ),
    );

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
    });

    expect(screen.getByText('지민')).toBeInTheDocument();
  });
});
