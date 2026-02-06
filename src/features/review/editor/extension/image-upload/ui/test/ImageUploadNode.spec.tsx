import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {NodeViewProps} from '@tiptap/react';
import {ImageUploadNode} from '../ImageUploadNode';

jest.mock('@tiptap/react', () => ({
  NodeViewWrapper: ({children, className, onClick}: any) => (
    <div className={className} onClick={onClick} data-testid="node-view-wrapper">
      {children}
    </div>
  ),
}));

const createMockFile = (size: number = 1024, name: string = 'test-image.png', type: string = 'image/png'): File => {
  const blob = new Blob(['a'.repeat(size)], {type});
  return new File([blob], name, {type});
};

describe('src/features/review/editor/extension/image-upload/ui/ImageUploadNode.tsx', () => {
  // 에디터 객체 체이닝 메서드 stub
  const mockChain = {
    focus: jest.fn().mockReturnThis(),
    deleteRange: jest.fn().mockReturnThis(),
    insertContentAt: jest.fn().mockReturnThis(),
    run: jest.fn(),
  };

  const mockEditor = {
    chain: jest.fn(() => mockChain),
  };

  const mockUploadFn = jest.fn();
  const mockOnError = jest.fn();
  const mockGetPos = jest.fn().mockReturnValue(10); // 현재 노드 위치 가상 설정

  // 테스트용 props 생성 팩터리
  const createProps = (overrides = {}) =>
    ({
      node: {
        attrs: {
          accept: 'image/*',
          maxSize: 1024 * 1024 * 5,
        },
      },
      extension: {
        options: {
          upload: mockUploadFn,
          onError: mockOnError,
        },
      },
      editor: mockEditor,
      getPos: mockGetPos,
      selected: false,
      updateAttributes: jest.fn(),
      deleteNode: jest.fn(),
      ...overrides,
    }) as unknown as NodeViewProps;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('첫 렌더링 시 입력 영역이 표시된다.', () => {
      const props = createProps();
      render(<ImageUploadNode {...props} />);

      expect(screen.getByText('이미지를 드래그하거나 클릭해 업로드할 수 있어요.')).toBeInTheDocument();
      expect(screen.queryByText('0%')).not.toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    beforeEach(() => {
      mockUploadFn.mockImplementation(async (file, onProgress) => {
        onProgress({progress: 50});
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'https://example.com/image.jpg';
      });
    });

    it('이미지를 업로드하면 이미지 정보와 업로드 진행률이 표시되고, 요청 성공 시 이미지가 표시된다.', async () => {
      const user = userEvent.setup();
      const props = createProps();

      render(<ImageUploadNode {...props} />);

      const file = createMockFile(1024, 'test-image.png', 'image/png');
      const input = screen.getByLabelText(/이미지를 드래그하거나/);

      await user.upload(input, file);

      // 프리뷰 표시
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('1 KB')).toBeInTheDocument();
      expect(screen.getByText('test-image.png')).toBeInTheDocument();

      // 업로드 완료 후 이미지 삽입 검증
      await waitFor(() => {
        expect(mockEditor.chain).toHaveBeenCalledTimes(1);
        expect(mockChain.insertContentAt).toHaveBeenCalledWith(10, [
          {
            type: 'image',
            attrs: {
              src: 'https://example.com/image.jpg',
              alt: 'test-image',
              title: 'test-image',
            },
          },
        ]);
        expect(mockChain.run).toHaveBeenCalled();
      });
    });

    it('드래그 앤 드롭으로 파일을 업로드할 수 있다.', async () => {
      const props = createProps();

      render(<ImageUploadNode {...props} />);

      const file = createMockFile(0, 'test-image.png', 'image/png');
      const dropZone = screen.getByLabelText(/이미지를 드래그하거나/);

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('0 Bytes')).toBeInTheDocument();
      expect(screen.getByText('test-image.png')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockChain.run).toHaveBeenCalled();
      });
    });

    it('업로드 중 에러가 발생하면 에러 콜백이 호출되고 에러 상태를 표시한다.', async () => {
      mockUploadFn.mockImplementation(() => {
        throw new Error('Unknown Error');
      });

      const user = userEvent.setup();
      const props = createProps();

      render(<ImageUploadNode {...props} />);

      const file = createMockFile(1024, 'fail-image.png', 'image/png');
      const input = screen.getByLabelText(/이미지를 드래그하거나/);

      await user.upload(input, file);

      // 에러 발생 대기
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });

      const preview = screen.getByText('fail-image.png').closest('.relative.border');
      expect(preview).toHaveClass('bg-red-100');
    });

    it('파일 용량이 초과되면 업로드하지 않는다.', async () => {
      const props = createProps({
        node: {attrs: {maxSize: 100, accept: 'image/*'}},
      });

      render(<ImageUploadNode {...props} />);
      const user = userEvent.setup();

      const file = createMockFile(1024, 'test-image.png', 'image/png');
      const input = screen.getByLabelText(/이미지를 드래그하거나/);

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });

      expect(mockUploadFn).not.toHaveBeenCalled();
    });

    it('업로드 중 취소(X) 버튼을 누르면 업로드가 중단되고 초기 상태로 돌아간다.', async () => {
      mockUploadFn.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      const props = createProps();

      render(<ImageUploadNode {...props} />);

      const file = createMockFile(1024, 'test-image.png', 'image/png');
      const input = screen.getByLabelText(/이미지를 드래그하거나/);

      await user.upload(input, file);

      // 프리뷰 떴는지 확인
      expect(await screen.findByText('test-image.png')).toBeInTheDocument();

      const closeButton = screen.getByRole('button');
      await user.click(closeButton);

      // 다시 드롭존으로 돌아왔는지 확인
      expect(await screen.findByText('이미지를 드래그하거나 클릭해 업로드할 수 있어요.')).toBeInTheDocument();
      expect(screen.queryByText('test-image.png')).not.toBeInTheDocument();
    });
  });
});
