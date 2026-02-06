import {render, screen, waitForElementToBeRemoved, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import Editor from '../Editor';
import {useUserNickname} from '@/entities/auth';

jest.mock('@/entities/auth');
jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;

describe('src/features/review/editor/ui/Editor.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();

    mockUseUserNickname.mockReturnValue('jimin');
  });

  describe('렌더링 테스트', () => {
    it('에디터가 렌더링된다.', async () => {
      render(<Editor onSave={() => {}} isPending={false} />);

      await waitForElementToBeRemoved(screen.getByText('에디터 정보를 불러오고 있어요.'));

      expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();

      expect(screen.getByRole('button', {name: '나가기'}));
      expect(screen.getByRole('button', {name: '미리보기'}));
      expect(screen.getByRole('button', {name: '저장하기'}));
    });

    it('초기값이 정상적으로 표시된다.', async () => {
      const INITIAL_TITLE = '초기 제목';
      const INITIAL_CATEGORY = 'food' as const;

      render(
        <Editor
          onSave={() => {}}
          isPending={false}
          title={INITIAL_TITLE}
          category={INITIAL_CATEGORY}
          content="<div>초기 내용</div>"
        />,
      );

      await waitForElementToBeRemoved(screen.getByText('에디터 정보를 불러오고 있어요.'));

      expect(screen.getByDisplayValue('초기 제목')).toBeInTheDocument();
      expect(screen.getByText('음식', {selector: 'span'})).toBeInTheDocument();
      expect(screen.getByText('초기 내용')).toBeInTheDocument();
    });
  });

  describe('기능 테스트', () => {
    it('입력된 정보를 미리보기할 수 있다.', async () => {
      const user = userEvent.setup();

      render(
        <Editor onSave={() => {}} isPending={false} title="초기 제목" category="food" content="<div>초기 내용</div>" />,
      );

      await user.click(screen.getByRole('button', {name: '미리보기'}));

      const viewerModal = screen.getByRole('alertdialog');

      expect(within(viewerModal).getByText('초기 제목')).toBeInTheDocument();
      expect(within(viewerModal).getByText('음식')).toBeInTheDocument();
      expect(within(viewerModal).getByText('초기 내용')).toBeInTheDocument();

      await user.click(screen.getByRole('button', {name: '창닫기'}));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('입력된 정보를 저장할 수 있다.', async () => {
      const user = userEvent.setup();

      const mockOnSave = jest.fn();

      render(
        <Editor
          onSave={mockOnSave}
          isPending={false}
          title="초기 제목"
          category="food"
          content="<div>초기 내용</div>"
        />,
      );

      await user.click(screen.getByRole('button', {name: '저장하기'}));

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '초기 제목',
          category: 'food',
        }),
      );
    });
  });
});
