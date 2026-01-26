import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoutButton from '../LogoutButton';

const mockUseLogout = jest.fn();
jest.mock('@/entities/auth', () => ({
  useLogout: () => ({logout: mockUseLogout}),
}));

describe('src/features/auth/ui/LogoutButton.tsx', () => {
  it('로그아웃 버튼을 클릭하면 로그아웃을 요청한다.', async () => {
    const user = userEvent.setup();

    render(<LogoutButton />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockUseLogout).toHaveBeenCalledTimes(1);
  });
});
