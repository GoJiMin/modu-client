import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import NotFound from '../NotFound';

describe('src/widgets/errors/not-found/ui/NotFound.tsx', () => {
  it('올바르지 않은 경로에 대한 대체 UI가 표시된다.', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', {level: 2, name: '해당 페이지는 찾을 수 없어요.'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '이동하기'})).toBeInTheDocument();
  });

  it('이동하기 버튼을 클릭해 메인 페이지로 이동할 수 있다.', async () => {
    const user = userEvent.setup();

    mockRouter.push('/notfound');
    render(<NotFound />, {wrapper: MemoryRouterProvider});

    await user.click(screen.getByRole('link', {name: '이동하기'}));

    expect(mockRouter.asPath).toBe('/');
  });
});
