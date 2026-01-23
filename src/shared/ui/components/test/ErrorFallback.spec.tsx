import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import ErrorFallback from '../ErrorFallback';

describe('src/shared/ui/components/ErrorFallback.tsx', () => {
  it('컴포넌트가 렌더링된다.', () => {
    const errorMessage = '테스트 에러';
    const resetErrorHandler = () => {};
    render(<ErrorFallback error={new Error(errorMessage)} resetErrorBoundary={resetErrorHandler} />);

    expect(screen.getByText('데이터를 가져오는 데 실패했어요.')).toBeInTheDocument();
    expect(screen.getByText('실패 이유: ' + errorMessage)).toBeInTheDocument();
  });

  it('전달된 아이콘을 화면에 표시한다.', () => {
    const icon = <p>아이콘</p>;
    const resetErrorhandler = () => {};

    render(<ErrorFallback error={new Error()} resetErrorBoundary={resetErrorhandler} icon={icon} />);

    expect(screen.getByText('아이콘')).toBeInTheDocument();
  });

  it('전달된 title을 화면에 표시한다.', () => {
    const title = '테스트';
    const resetErrorHandler = () => {};

    render(<ErrorFallback title={title} error={new Error()} resetErrorBoundary={resetErrorHandler} />);

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('버튼을 클릭하면 리렌더링 트리거 함수를 호출한다.', async () => {
    const user = userEvent.setup();
    const resetErrorBoundary = jest.fn();

    render(<ErrorFallback error={new Error()} resetErrorBoundary={resetErrorBoundary} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });
});
