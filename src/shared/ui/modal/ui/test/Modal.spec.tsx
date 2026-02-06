import {fireEvent, render, screen} from '@testing-library/react';
import Modal from '../Modal';

jest.mock('../../../icons', () => ({
  LucideIcon: ({name, ...props}: {name: string}) => <span data-testid={`icon-${name}`} {...props} />,
}));

describe('src/shared/ui/modal/ui/Modal.tsx', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (children?: React.ReactNode) => {
    return render(<Modal onClose={mockOnClose}>{children || <div>모달 콘텐츠</div>}</Modal>);
  };

  describe('렌더링', () => {
    it('포털을 통해 모달이 렌더링된다', () => {
      renderModal();

      const modal = screen.getByRole('alertdialog');
      expect(modal).toBeInTheDocument();
    });

    it('자식 요소가 올바르게 렌더링된다', () => {
      renderModal(<div>테스트 콘텐츠</div>);

      expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
    });

    it('X 버튼이 렌더링된다', () => {
      renderModal();

      expect(screen.getByLabelText('창닫기')).toBeInTheDocument();
    });
  });

  describe('닫기 동작', () => {
    it('Escape 키 입력 시 onClose가 호출된다', () => {
      renderModal();

      fireEvent.keyDown(document, {key: 'Escape'});

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('X 버튼 클릭 시 모달 닫기 콜백이 호출된다', () => {
      renderModal();

      const closeButton = screen.getByLabelText('창닫기');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('오버레이 클릭 시 모달 닫기 콜백이 호출된다', () => {
      renderModal();

      // 오버레이는 bg-black/60 클래스를 가진 div
      const overlay = document.querySelector('.bg-black\\/60');
      expect(overlay).toBeInTheDocument();

      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('모달 콘텐츠 클릭 시 모달 닫기 콜백이 호출되지 않는다', () => {
      renderModal(<div>테스트 콘텐츠</div>);

      const content = screen.getByText('테스트 콘텐츠');
      fireEvent.click(content);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('이벤트 리스너 정리', () => {
    it('언마운트 시 keydown 이벤트 리스너가 제거된다', () => {
      const {unmount} = renderModal();

      unmount();

      // 이벤트 리스너가 제거되었는지 확인 (Escape 키가 동작하지 않아야 함)
      fireEvent.keyDown(document, {key: 'Escape'});

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
