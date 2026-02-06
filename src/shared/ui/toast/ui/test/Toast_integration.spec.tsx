import {Toaster} from 'sonner';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from '../..';

jest.mock('../../../icons', () => ({
  LucideIcon: ({name, color}: {name: string; color: string}) => (
    <div data-testid="lucide-icon" data-name={name} data-color={color} />
  ),
}));

describe('src/shared/ui/toast', () => {
  const renderToaster = () => render(<Toaster />);

  describe('AlertToast 통합 테스트', () => {
    it('기본 토스트가 올바른 제목과 내용으로 표시된다.', async () => {
      renderToaster();

      const options = {
        title: '기본 알림',
        description: '기본 설명',
      };

      toast.show(options);

      await waitFor(() => {
        expect(screen.getByText(options.title)).toBeInTheDocument();
        expect(screen.getByText(options.description)).toBeInTheDocument();

        const toastCard = screen.getByText(options.title).closest('div.bg-white');
        expect(toastCard).toBeInTheDocument();
      });
    });

    const alertTestCases = [
      {method: 'success', expectedBg: 'bg-green-50', expectedIcon: 'CircleCheck', label: '성공'},
      {method: 'error', expectedBg: 'bg-red-50', expectedIcon: 'CircleAlert', label: '에러'},
      {method: 'info', expectedBg: 'bg-blue-50', expectedIcon: 'Sparkles', label: '정보'},
    ] as const;

    test.each(alertTestCases)(
      '$label 토스트($method) 호출 시 스타일과 아이콘이 올바르게 적용된다.',
      async ({method, expectedBg, expectedIcon}) => {
        renderToaster();

        toast[method]({title: `${method} 테스트`});

        await waitFor(() => {
          const titleElement = screen.getByText(`${method} 테스트`);

          const toastContainer = titleElement.closest('div.flex.rounded-lg');
          expect(toastContainer).toHaveClass(expectedBg);

          const icon = screen.getByTestId('lucide-icon');
          expect(icon).toHaveAttribute('data-name', expectedIcon);
        });
      },
    );

    it('버튼이 있는 경우 버튼을 렌더링하고 클릭 이벤트를 처리한다.', async () => {
      const user = userEvent.setup();
      renderToaster();

      const handleClick = jest.fn();
      const options = {
        title: '버튼 테스트',
        button: {
          label: '실행',
          onClick: handleClick,
        },
      };

      toast.show(options);

      await waitFor(() => {
        expect(screen.getByText('실행')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', {name: '실행'});
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('NotificationToast 통합 테스트', () => {
    const notificationTestCases = [
      {
        type: 'comment',
        title: '재미있는 글',
        expectedText: "'재미있는 글'에 댓글을 남겼어요!",
        expectedIcon: 'MessageCircle',
        boardId: 100,
      },
      {
        type: 'bookmark',
        title: '유용한 팁',
        expectedText: "'유용한 팁'을 저장했어요!",
        expectedIcon: 'Bookmark',
        boardId: 200,
      },
    ] as const;

    test.each(notificationTestCases)(
      '$type 알림이 발생하면 올바른 메시지와 링크가 생성된다.',
      async ({type, title, expectedText, expectedIcon, boardId}) => {
        renderToaster();

        toast.notification({
          type: type,
          title: title,
          board_id: boardId,
        });

        await waitFor(() => {
          expect(screen.getByText(expectedText)).toBeInTheDocument();

          const icon = screen.getByTestId('lucide-icon');
          expect(icon).toHaveAttribute('data-name', expectedIcon);

          const linkElement = screen.getByRole('link');
          expect(linkElement).toHaveAttribute('href', `/reviews/${boardId}`);
        });
      },
    );
  });
});
