import {fireEvent, render, screen} from '@testing-library/react';
import {toast as sonnerToast} from 'sonner';
import Toast, {ToastProps} from '../Toast';

jest.mock('sonner', () => ({
  toast: {
    dismiss: jest.fn(),
  },
}));

jest.mock('../../icons', () => ({
  LucideIcon: ({name, ...props}: {name: string}) => <span data-testid={`icon-${name}`} {...props} />,
}));

const mockDismiss = sonnerToast.dismiss as jest.MockedFunction<typeof sonnerToast.dismiss>;

describe('src/shared/ui/components/Toast.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderToast = (props: Partial<ToastProps> = {}) => {
    const defaultProps: ToastProps = {
      id: 'test-toast-id',
      title: '테스트 타이틀',
      ...props,
    };
    return render(<Toast {...defaultProps} />);
  };

  describe('기본 렌더링', () => {
    it('타이틀이 렌더링된다', () => {
      renderToast({title: '알림 메시지'});

      expect(screen.getByText('알림 메시지')).toBeInTheDocument();
    });

    it('상세 설명이 있으면 렌더링된다', () => {
      renderToast({description: '상세 설명'});

      expect(screen.getByText('상세 설명')).toBeInTheDocument();
    });

    it('상세 설명이 없으면 렌더링되지 않는다', () => {
      renderToast();

      expect(screen.queryByText('상세 설명')).not.toBeInTheDocument();
    });
  });

  describe('타입별 아이콘', () => {
    it('success 타입일 때 CircleCheck 아이콘이 표시된다', () => {
      renderToast({type: 'success'});

      expect(screen.getByTestId('icon-CircleCheck')).toBeInTheDocument();
    });

    it('error 타입일 때 CircleAlert 아이콘이 표시된다', () => {
      renderToast({type: 'error'});

      expect(screen.getByTestId('icon-CircleAlert')).toBeInTheDocument();
    });

    it('info 타입일 때 Sparkles 아이콘이 표시된다', () => {
      renderToast({type: 'info'});

      expect(screen.getByTestId('icon-Sparkles')).toBeInTheDocument();
    });

    it('default 타입일 때 Info 아이콘이 표시된다', () => {
      renderToast({type: 'default'});

      expect(screen.getByTestId('icon-Info')).toBeInTheDocument();
    });

    it('type을 지정하지 않으면 default 아이콘이 표시된다', () => {
      renderToast();

      expect(screen.getByTestId('icon-Info')).toBeInTheDocument();
    });
  });

  describe('버튼 렌더링', () => {
    it('button이 있으면 버튼이 렌더링된다', () => {
      const mockOnClick = jest.fn();
      renderToast({
        button: {
          label: '확인',
          onClick: mockOnClick,
        },
      });

      expect(screen.getByText('확인')).toBeInTheDocument();
    });

    it('button이 없으면 버튼이 렌더링되지 않는다', () => {
      renderToast();

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('버튼 클릭 시 onClick 실행 후 toast.dismiss가 호출된다', () => {
      const mockOnClick = jest.fn();
      renderToast({
        id: 'test-id',
        button: {
          label: '확인',
          onClick: mockOnClick,
        },
      });

      const button = screen.getByText('확인');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockDismiss).toHaveBeenCalledWith('test-id');
    });
  });

  describe('타입별 스타일', () => {
    it('success 타입은 green 배경색이 적용된다', () => {
      const {container} = renderToast({type: 'success'});

      const toastContainer = container.firstChild;
      expect(toastContainer).toHaveClass('bg-green-50');
    });

    it('error 타입은 red 배경색이 적용된다', () => {
      const {container} = renderToast({type: 'error'});

      const toastContainer = container.firstChild;
      expect(toastContainer).toHaveClass('bg-red-50');
    });

    it('info 타입은 blue 배경색이 적용된다', () => {
      const {container} = renderToast({type: 'info'});

      const toastContainer = container.firstChild;
      expect(toastContainer).toHaveClass('bg-blue-50');
    });

    it('default 타입은 white 배경색이 적용된다', () => {
      const {container} = renderToast({type: 'default'});

      const toastContainer = container.firstChild;
      expect(toastContainer).toHaveClass('bg-white');
    });
  });
});
