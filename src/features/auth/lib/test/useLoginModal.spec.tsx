import {render, screen} from '@testing-library/react';
import useLoginModal from '../useLoginModal';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {LOGIN_URL} from '@/entities/auth';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

describe('src/features/auth/lib/useLoginModal.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  function TestComponent() {
    const {isOpenLoginModal, openLoginModal, renderLoginModal} = useLoginModal();

    return (
      <div>
        <button onClick={openLoginModal}>로그인이 필요한 서비스</button>
        {isOpenLoginModal && renderLoginModal()}
      </div>
    );
  }

  it('초기에는 모달이 화면에 보이지 않는다.', () => {
    render(<TestComponent />);

    expect(screen.queryByText('로그인 후 이용 가능한 서비스입니다.')).not.toBeInTheDocument();
  });

  it('로그인이 필요한 서비스를 클릭하면 로그인 모달이 표시된다.', async () => {
    const user = userEvent.setup();

    render(<TestComponent />);

    await user.click(screen.getByRole('button', {name: '로그인이 필요한 서비스'}));

    expect(screen.getByText('로그인 후 이용 가능한 서비스입니다.')).toBeInTheDocument();
  });

  it('닫기 버튼을 클릭하면 모달이 닫힌다.', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', {name: '로그인이 필요한 서비스'}));
    expect(screen.getByText('로그인 후 이용 가능한 서비스입니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    expect(screen.queryByText('로그인 후 이용 가능한 서비스입니다.')).not.toBeInTheDocument();
  });

  it('모달 내부의 로그인 버튼 클릭 시 로그인 페이지로 이동한다.', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    const pushSpy = jest.spyOn(mockRouter, 'push');

    await user.click(screen.getByRole('button', {name: '로그인이 필요한 서비스'}));
    await user.click(screen.getByRole('button', {name: '로그인'}));

    // url, as, options
    expect(pushSpy).toHaveBeenCalledWith(LOGIN_URL, undefined, undefined);
  });
});
