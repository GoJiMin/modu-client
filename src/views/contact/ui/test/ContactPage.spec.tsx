import {sendSlackMessage} from '@/entities/contact/api/api-service';
import {render, screen, waitFor} from '@testing-library/react';
import {FormEventHandler} from 'react';
import ContactPage from '../ContactPage';
import {FORM_FIELDS} from '@/entities/contact';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import userEvent from '@testing-library/user-event';

jest.mock('@/entities/contact/api/api-service');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    form: ({children, onSubmit}: {children: React.ReactNode; onSubmit: FormEventHandler<HTMLFormElement>}) => (
      <form onSubmit={onSubmit}>{children}</form>
    ),
    h2: ({children}: {children: React.ReactNode}) => <h2>{children}</h2>,
  },
  AnimatePresence: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

const mockSendSlackMessage = sendSlackMessage as jest.MockedFunction<typeof sendSlackMessage>;

describe('src/views/contact/ui/ContactPage.tsx', () => {
  describe('렌더링 테스트', () => {
    it('문의하기 페이지가 렌더링된다.', async () => {
      render(withAllContext(<ContactPage />));

      expect(screen.getByRole('heading', {level: 2, name: '문의하기'})).toBeInTheDocument();

      FORM_FIELDS.forEach(field => {
        expect(screen.getByPlaceholderText(field.placeholder)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', {name: '전송'})).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    it('입력값이 없다면 에러 메세지를 표시하고 제출하지 않는다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<ContactPage />));

      await user.click(screen.getByRole('button', {name: '전송'}));

      expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByText('문의 내용을 입력해주세요.')).toBeInTheDocument();

      expect(mockSendSlackMessage).toHaveBeenCalledTimes(0);
    });

    it('올바르지 않은 이메일을 입력해 제출하면 에러 메시지를 표시한다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<ContactPage />));

      await user.type(screen.getByPlaceholderText('이메일을 입력해주세요.'), '이메일일까요?');
      await user.click(screen.getByRole('button', {name: '전송'}));

      expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
    });

    it('올바른 값을 입력 후 제출할 수 있다.', async () => {
      const user = userEvent.setup();

      const TYPED_NAME = '지민';
      const TYPED_EMAIL = 'jimin@email.com';
      const TYPED_MESSAGE = '안녕하세요';

      mockSendSlackMessage.mockResolvedValue();

      render(withAllContext(<ContactPage />));

      await user.type(screen.getByPlaceholderText('이름을 입력해주세요.'), TYPED_NAME);
      await user.type(screen.getByPlaceholderText('이메일을 입력해주세요.'), TYPED_EMAIL);
      await user.type(screen.getByPlaceholderText('메시지를 입력해주세요.'), TYPED_MESSAGE);

      await user.click(screen.getByRole('button', {name: '전송'}));

      expect(screen.getByText('전송을 완료하시겠습니까?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', {name: '확인'}));

      await waitFor(() => {
        // API 요청 확인
        expect(mockSendSlackMessage).toHaveBeenCalledWith({
          email: TYPED_EMAIL,
          name: TYPED_NAME,
          message: TYPED_MESSAGE,
        });

        // 폼 초기화 확인
        expect(screen.queryByDisplayValue(TYPED_NAME)).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(TYPED_EMAIL)).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(TYPED_MESSAGE)).not.toBeInTheDocument();

        // 제출 완료 애니메이션 표시
        expect(screen.getByText('문의가 성공적으로 전송되었습니다! 🎉')).toBeInTheDocument();

        // 모달 닫힘 확인
        expect(screen.queryByText('전송을 완료하시겠습니까?')).not.toBeInTheDocument();
      });
    });

    it('제출 버튼 클릭 후 모달 닫기 버튼을 클릭해 닫을 수 있다.', async () => {
      const user = userEvent.setup();

      const TYPED_NAME = '지민';
      const TYPED_EMAIL = 'jimin@email.com';
      const TYPED_MESSAGE = '안녕하세요';

      render(withAllContext(<ContactPage />));

      await user.type(screen.getByPlaceholderText('이름을 입력해주세요.'), TYPED_NAME);
      await user.type(screen.getByPlaceholderText('이메일을 입력해주세요.'), TYPED_EMAIL);
      await user.type(screen.getByPlaceholderText('메시지를 입력해주세요.'), TYPED_MESSAGE);

      await user.click(screen.getByRole('button', {name: '전송'}));

      expect(screen.getByText('전송을 완료하시겠습니까?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', {name: '취소'}));

      expect(screen.queryByText('전송을 완료하시겠습니까?')).not.toBeInTheDocument();
    });
  });
});
