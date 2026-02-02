import {renderHook, act} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import useSelectSortOption from '../useSelectSortOption';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

describe('features/reviews/sorting/lib/useSelectSortOption', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push('/');
  });

  describe('정상 케이스', () => {
    it('주소창에 유효한 정렬 키가 있으면 해당 정렬이 선택된다', () => {
      mockRouter.push('/?sort=hotbookmarks');

      const {result} = renderHook(() => useSelectSortOption());

      expect(result.current.sort).toBe('hotbookmarks');
    });

    it('정렬을 변경하면 주소창이 업데이트된다', () => {
      const {result} = renderHook(() => useSelectSortOption());

      act(() => {
        result.current.handleChange('hotcomments');
      });

      expect(mockRouter.asPath).toBe('/?sort=hotcomments');
    });

    it('추가 옵션과 함께 정렬 키가 URL에 포함된다', () => {
      const {result} = renderHook(() => useSelectSortOption({options: {categoryId: 'food'}}));

      act(() => {
        result.current.handleChange('hotbookmarks');
      });

      expect(mockRouter.asPath).toBe('/?categoryId=food&sort=hotbookmarks');
    });

    it('여러 번 정렬을 변경해도 정상적으로 동작한다', () => {
      const {result} = renderHook(() => useSelectSortOption());

      act(() => {
        result.current.handleChange('hotbookmarks');
      });
      expect(mockRouter.asPath).toBe('/?sort=hotbookmarks');

      act(() => {
        result.current.handleChange('hotcomments');
      });
      expect(mockRouter.asPath).toBe('/?sort=hotcomments');

      act(() => {
        result.current.handleChange('recent');
      });
      expect(mockRouter.asPath).toBe('/?sort=recent');
    });
  });

  describe('엣지/예외 케이스', () => {
    it('주소창에 정렬 키가 없으면 기본값 최신순이 선택된다', () => {
      const {result} = renderHook(() => useSelectSortOption());

      expect(result.current.sort).toBe('recent');
    });

    it('주소창에 유효하지 않은 정렬 키가 있으면 최신순으로 폴백된다', () => {
      mockRouter.push('/?sort=invalid');

      const {result} = renderHook(() => useSelectSortOption());

      expect(result.current.sort).toBe('recent');
    });

    it('빈 문자열이 전달되면 최신순으로 폴백된다', () => {
      mockRouter.push('/sort=');

      const {result} = renderHook(() => useSelectSortOption());

      expect(result.current.sort).toBe('recent');
    });

    it('동일한 정렬을 다시 선택해도 정상적으로 동작한다', () => {
      mockRouter.push('/?sort=hotbookmarks');

      const {result} = renderHook(() => useSelectSortOption());

      act(() => {
        result.current.handleChange('hotbookmarks');
      });

      expect(mockRouter.asPath).toBe('/?sort=hotbookmarks');
    });
  });
});
