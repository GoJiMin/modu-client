import {render, screen} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import KeywordSearchPage, {generateMetadata} from '../KeywordSearchPage';
import {useIsLoggedIn} from '@/entities/auth';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/auth');
// 해당 기능에 대한 통합 테스트가 이미 수행되었기 때문에 레이아웃 구조만 검증
jest.mock('@/features/reviews/keyword', () => ({
  KeywordReviews: () => <div>키워드 리뷰 목록</div>,
}));

const mockUseIsLoggedIn = useIsLoggedIn as jest.MockedFunction<typeof useIsLoggedIn>;

describe('src/views/search/ui/KeywordSearchPage.tsx', () => {
  beforeEach(() => {
    mockRouter.reset();
  });

  describe('렌더링 테스트', () => {
    it('키워드 검색 페이지가 렌더링된다.', async () => {
      const params = Promise.resolve({keyword: 'pizza'});

      render(await KeywordSearchPage({params}));

      // 헤더
      expect(screen.getByText('pizza 검색 결과')).toBeInTheDocument();
      expect(screen.getByRole('link', {name: '카테고리별로 확인해보세요 →'})).toBeInTheDocument();

      // 검색창
      expect(screen.getByPlaceholderText('후기를 검색하세요')).toBeInTheDocument();

      // 리뷰 목록
      expect(screen.getByText('키워드 리뷰 목록')).toBeInTheDocument();

      // 플로팅 버튼
      expect(screen.getByRole('button', {name: '위로 이동'})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: '리뷰 작성하기'})).toBeInTheDocument();
    });

    it('인코딩된 문자열이 정상적으로 표시된다.', async () => {
      const keyword = '피자&햄버거';
      const params = Promise.resolve({keyword: encodeURIComponent(keyword)});

      render(await KeywordSearchPage({params}));

      expect(screen.getByText(`${keyword} 검색 결과`)).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    const spyScrollTo = jest.fn();
    const params = Promise.resolve({keyword: 'pizza'});
    beforeEach(() => {
      Object.defineProperty(global.window, 'scrollTo', {
        value: spyScrollTo,
        writable: true,
      });
    });

    it('검색창에 검색어를 입력해 검색할 수 있다.', async () => {
      const user = userEvent.setup();

      mockRouter.push('/');

      render(await KeywordSearchPage({params}));

      await user.type(screen.getByPlaceholderText('후기를 검색하세요'), 'pizza{Enter}');

      expect(mockRouter.asPath).toBe('/search/pizza');
    });

    it('위로 이동 버튼을 클릭해 페이지 상단으로 이동할 수 있다.', async () => {
      const user = userEvent.setup();

      render(await KeywordSearchPage({params}));

      await user.click(screen.getByRole('button', {name: '위로 이동'}));

      expect(spyScrollTo).toHaveBeenCalled();
      expect(spyScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('리뷰 작성 버튼을 클릭해 작성 페이지로 이동할 수 있다.', async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(true);
      mockRouter.push('/');

      render(await KeywordSearchPage({params}));

      await user.click(screen.getByRole('button', {name: '리뷰 작성하기'}));

      expect(mockRouter.asPath).toBe('/reviews/new');
    });

    it('로그인하지 않은 사용자가 작성 버튼을 클릭하면 로그인 유도 모달을 표시한다.', async () => {
      const user = userEvent.setup();

      mockUseIsLoggedIn.mockReturnValue(false);
      mockRouter.push('/');

      render(await KeywordSearchPage({params}));

      await user.click(screen.getByRole('button', {name: '리뷰 작성하기'}));

      expect(screen.getByText('로그인 후 이용 가능한 서비스입니다.')).toBeInTheDocument();
    });
  });

  describe('메타데이터 생성 테스트', () => {
    it('검색된 키워드를 사용해 동적으로 메타데이터를 생성할 수 있다.', async () => {
      const params = Promise.resolve({keyword: 'pizza'});
      const metadata = await generateMetadata({params});

      expect(metadata.title).toBe('pizza 검색 결과');
      expect(metadata.description).toBe('pizza에 관련된 후기글을 모아보세요.');
      expect(metadata.openGraph.title).toBe('pizza 검색 결과');
    });

    it('인코딩된 키워드에 대한 메타데이터도 정상적으로 생성할 수 있다.', async () => {
      const params = Promise.resolve({keyword: encodeURIComponent('자고 싶다.')});
      const metadata = await generateMetadata({params});

      expect(metadata.title).toBe('자고 싶다. 검색 결과');
      expect(metadata.description).toBe('자고 싶다.에 관련된 후기글을 모아보세요.');
      expect(metadata.openGraph.title).toBe('자고 싶다. 검색 결과');
    });
  });
});
