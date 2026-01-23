import {createEvent, fireEvent, render, screen} from '@testing-library/react';
import ImageUploadDragArea from '../ImageUploadDragArea';
import {ClientError} from '@/shared/lib/utils/client-error';

describe('src/shared/ui/components/ImageUploadDragArea.tsx', () => {
  const mockOnFile = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (children?: React.ReactNode) => {
    return render(
      <ImageUploadDragArea onFile={mockOnFile} onError={mockOnError}>
        {children || <span>드래그 영역</span>}
      </ImageUploadDragArea>,
    );
  };

  const createDragEvent = (files: File[]) => {
    return {
      preventDefault: jest.fn(),
      dataTransfer: {
        files,
      },
    };
  };

  describe('파일 드롭', () => {
    it('단일 파일 드롭 시 파일 콜백 호출된다', () => {
      renderComponent();

      const file = new File(['test'], 'test.png', {type: 'image/png'});
      const dropArea = screen.getByText('드래그 영역').parentElement!;

      fireEvent.drop(dropArea, createDragEvent([file]));

      expect(mockOnFile).toHaveBeenCalledWith(file);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('파일 없이 드롭 시 NO_IMAGE_SELECTED 에러로 에러 콜백이 호출된다', () => {
      renderComponent();

      const dropArea = screen.getByText('드래그 영역').parentElement!;

      fireEvent.drop(dropArea, createDragEvent([]));

      expect(mockOnFile).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);

      const error = mockOnError.mock.calls[0][0] as ClientError;
      expect(error.name).toBe('NO_IMAGE_SELECTED');
    });

    it('여러 파일 드롭 시 TOO_MANY_IMAGES_SELECTED 에러로 에러 콜백이 호출된다', () => {
      renderComponent();

      const file1 = new File(['test1'], 'test1.png', {type: 'image/png'});
      const file2 = new File(['test2'], 'test2.png', {type: 'image/png'});
      const dropArea = screen.getByText('드래그 영역').parentElement!;

      fireEvent.drop(dropArea, createDragEvent([file1, file2]));

      expect(mockOnFile).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledTimes(1);

      const error = mockOnError.mock.calls[0][0] as ClientError;
      expect(error.name).toBe('TOO_MANY_IMAGES_SELECTED');
    });
  });

  describe('드래그 이벤트', () => {
    it('드래그 영역에 진입하면 드래깅 스타일이 적용된다', () => {
      renderComponent();

      const dropArea = screen.getByText('드래그 영역').parentElement!;

      fireEvent.dragEnter(dropArea, {preventDefault: jest.fn()});

      expect(dropArea).toHaveClass('border-boldBlue');
    });

    it('드래그 영역을 벗어나면 드래깅 스타일이 해제된다', () => {
      renderComponent();

      const dropArea = screen.getByText('드래그 영역').parentElement!;

      fireEvent.dragEnter(dropArea, {preventDefault: jest.fn()});
      expect(dropArea).toHaveClass('border-boldBlue');

      fireEvent.dragLeave(dropArea, {preventDefault: jest.fn()});
      expect(dropArea).toHaveClass('border-gray-400');
    });

    it('영역 내에서 드래그 중일 때 이벤트의 기본 동작을 막는다.', () => {
      renderComponent();

      const dropArea = screen.getByText('드래그 영역').parentElement!;
      const dragOverEvent = createEvent.dragOver(dropArea);

      jest.spyOn(dragOverEvent, 'preventDefault');
      fireEvent(dropArea, dragOverEvent);

      expect(dragOverEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(dragOverEvent.defaultPrevented).toBe(true);
    });
  });

  describe('중첩 드래그 이벤트', () => {
    it('드래그 영역에 중첩으로 진입해도 카운터가 올바르게 동작한다', () => {
      renderComponent();

      const dropArea = screen.getByText('드래그 영역').parentElement!;

      // 첫 번째 dragEnter
      fireEvent.dragEnter(dropArea, {preventDefault: jest.fn()});
      expect(dropArea).toHaveClass('border-boldBlue');

      // 두 번째 dragEnter (중첩된 요소)
      fireEvent.dragEnter(dropArea, {preventDefault: jest.fn()});
      expect(dropArea).toHaveClass('border-boldBlue');

      // 첫 번째 dragLeave (중첩된 요소)
      fireEvent.dragLeave(dropArea, {preventDefault: jest.fn()});
      expect(dropArea).toHaveClass('border-boldBlue'); // 아직 dragging 상태

      // 두 번째 dragLeave
      fireEvent.dragLeave(dropArea, {preventDefault: jest.fn()});
      expect(dropArea).toHaveClass('border-gray-400'); // dragging 해제
    });
  });

  describe('자식 요소 렌더링', () => {
    it('자식 요소가 올바르게 렌더링된다', () => {
      renderComponent(<div data-testid="custom-child">커스텀 콘텐츠</div>);

      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
      expect(screen.getByText('커스텀 콘텐츠')).toBeInTheDocument();
    });
  });
});
