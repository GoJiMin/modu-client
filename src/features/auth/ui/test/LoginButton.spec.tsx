import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginButton from '../LoginButton';
import {useGetFullPathName} from '@/shared/hooks';
import useGoLoginPage from '../../lib/useGoLoginPage';

jest.mock('../../lib/useGoLoginPage');
jest.mock('@/shared/hooks');

const mockUseGetFullPathName = useGetFullPathName as jest.MockedFunction<typeof useGetFullPathName>;
const mockUseGoLoginPage = useGoLoginPage as jest.MockedFunction<typeof useGoLoginPage>;

describe('src/features/auth/ui/LoginButton.tsx', () => {
  const mockGoLoginPage = jest.fn();
  const mockFullPath = '/test/path?query=1';

  beforeEach(() => {
    mockUseGoLoginPage.mockReturnValue({
      goLoginPage: mockGoLoginPage,
    });
    mockUseGetFullPathName.mockReturnValue(mockFullPath);
  });

  it('버튼 클릭 시 전체 경로를 인자로 로그인 페이지 이동 훅을 호출한다.', async () => {
    const user = userEvent.setup();

    render(<LoginButton />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockGoLoginPage).toHaveBeenCalledWith(mockFullPath);
  });
});
