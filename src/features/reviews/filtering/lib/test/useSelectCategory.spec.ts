import {renderHook, act} from '@testing-library/react';
import {useSelectCategory} from '../useSelectCategory';

describe('features/reviews/filtering/lib/useSelectCategory', () => {
  describe('정상 케이스', () => {
    it('초기 카테고리가 올바르게 설정된다', () => {
      const {result} = renderHook(() => useSelectCategory('food'));

      expect(result.current.selectedCategory).toBe('food');
    });

    it('카테고리 선택 시 상태가 업데이트된다', () => {
      const {result} = renderHook(() => useSelectCategory('all'));

      act(() => {
        result.current.handleSelectCategory('car');
      });

      expect(result.current.selectedCategory).toBe('car');
    });

    it('여러 번 카테고리를 변경해도 정상적으로 동작한다', () => {
      const {result} = renderHook(() => useSelectCategory('all'));

      act(() => {
        result.current.handleSelectCategory('food');
      });
      expect(result.current.selectedCategory).toBe('food');

      act(() => {
        result.current.handleSelectCategory('cosmetic');
      });
      expect(result.current.selectedCategory).toBe('cosmetic');

      act(() => {
        result.current.handleSelectCategory('device');
      });
      expect(result.current.selectedCategory).toBe('device');
    });
  });

  describe('엣지/예외 케이스', () => {
    it('초기값을 전달하지 않으면 기본값으로 전체 카테고리가 설정된다', () => {
      const {result} = renderHook(() => useSelectCategory());

      expect(result.current.selectedCategory).toBe('all');
    });

    it('동일한 카테고리를 다시 선택해도 정상적으로 동작한다', () => {
      const {result} = renderHook(() => useSelectCategory('food'));

      act(() => {
        result.current.handleSelectCategory('food');
      });

      expect(result.current.selectedCategory).toBe('food');
    });
  });
});
