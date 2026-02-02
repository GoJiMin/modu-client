import {renderHook, act} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {useSelectCategoryFromUrl} from '../useSelectCategoryFromUrl';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

describe('features/reviews/filtering/lib/useSelectCategoryFromUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.reset();
  });

  describe('정상 케이스', () => {
    it('주소창에 유효한 카테고리가 있으면 해당 카테고리를 선택한다', () => {
      mockRouter.push('/?categoryId=food');

      const {result} = renderHook(() => useSelectCategoryFromUrl());

      expect(result.current.selectedCategory).toBe('food');
    });

    it('카테고리를 선택하면 주소창이 업데이트된다', () => {
      mockRouter.push('/?categoryId=food');

      const {result} = renderHook(() => useSelectCategoryFromUrl());

      act(() => {
        result.current.handleSelectCategory('car');
      });

      expect(mockRouter.asPath).toBe('/?categoryId=car');
    });

    describe('엣지/예외 케이스', () => {
      it('주소창에 카테고리가 없으면 전체 카테고리가 선택된다', () => {
        mockRouter.push('/');

        const {result} = renderHook(() => useSelectCategoryFromUrl());

        expect(result.current.selectedCategory).toBe('all');
      });

      it('주소창에 유효하지 않은 카테고리가 있으면 전체 카테고리로 폴백된다', () => {
        mockRouter.push('/?categoryId=invalid');

        const {result} = renderHook(() => useSelectCategoryFromUrl());

        expect(result.current.selectedCategory).toBe('all');
      });

      it('빈 문자열이 전달되면 전체 카테고리로 폴백된다', () => {
        mockRouter.push('/?categoryId=');

        const {result} = renderHook(() => useSelectCategoryFromUrl());

        expect(result.current.selectedCategory).toBe('all');
      });
    });
  });
});
