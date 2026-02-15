import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {ChatBot} from '../ChatBot';
import {useChatStore} from '@/entities/ai-search';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('framer-motion', () => ({
  AnimatePresence: ({children}: {children: React.ReactNode}) => <>{children}</>,
  motion: {
    div: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  },
}));
jest.mock('react-remove-scroll', () => ({
  RemoveScroll: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));
jest.mock('@/shared/hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}));

describe('src/features/chatbot/ui/ChatBot.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter.push('/');

    useChatStore.setState({
      isOpen: false,
      step: 'input',
      keyword: '',
      result: null,
      limitState: {usage: 0, maxLimit: 1, remaining: 1},
    });
  });

  it('트리거 버튼을 클릭해 채팅창을 열고 닫을 수 있다.', async () => {
    const user = userEvent.setup();

    render(<ChatBot />);

    await user.click(screen.getByRole('button', {name: '챗봇 열기'}));

    expect(screen.getByRole('heading', {level: 3, name: '모후봇'})).toBeInTheDocument();
    expect(screen.getByPlaceholderText('예: 아이폰 17 프로, 성심당 튀김소보로')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '챗봇 닫기'}));

    expect(screen.queryByRole('heading', {level: 3, name: '모후봇'})).not.toBeInTheDocument();
  });

  it('키워드 검색 경로(/search/pizza)에 진입하고 챗봇을 열면, "pizza"에 대한 질문(ask) 단계가 표시된다.', async () => {
    const user = userEvent.setup();

    mockRouter.push('/search/pizza');

    render(<ChatBot />);

    await user.click(screen.getByRole('button', {name: '챗봇 열기'}));

    expect(screen.getByText('pizza', {exact: false})).toBeInTheDocument();
    expect(screen.getByText('제가 대신 검색해서 요약해 드릴 수 있어요!')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '네, 찾아주세요!'})).toBeInTheDocument();
  });

  it('숨김 처리된 경로(/reviews/new)에서는 챗봇이 표시되지 않는다.', () => {
    mockRouter.push('/reviews/new');

    const {container} = render(<ChatBot />);

    expect(container).toBeEmptyDOMElement();
  });
});
