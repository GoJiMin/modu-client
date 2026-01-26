import {renderHook, act} from '@testing-library/react';
import usePreview from '../usePreview';
import {reviewContentStub} from './stub';

describe('src/features/review/editor/lib/usePreview.ts', () => {
  describe('초기 상태', () => {
    it('초기 프리뷰 상태는 null이다.', () => {
      const {result} = renderHook(() => usePreview());

      expect(result.current.preview).toBeNull();
    });

    it('초기 모달 열림 상태는 false이다.', () => {
      const {result} = renderHook(() => usePreview());

      expect(result.current.openModal).toBe(false);
    });
  });

  describe('프리뷰 열기', () => {
    it('프리뷰 열기를 호출하면 프리뷰 데이터가 설정되고 모달이 열린다.', () => {
      const {result} = renderHook(() => usePreview());

      act(() => {
        result.current.openPreview(reviewContentStub);
      });

      expect(result.current.preview).toEqual(reviewContentStub);
      expect(result.current.openModal).toBe(true);
    });

    it('다른 프리뷰 데이터로 프리뷰 열기를 호출하면 프리뷰가 업데이트된다.', () => {
      const {result} = renderHook(() => usePreview());

      const firstPreview = {...reviewContentStub, title: '첫 번째 프리뷰'};
      const secondPreview = {...reviewContentStub, title: '두 번째 프리뷰'};

      act(() => {
        result.current.openPreview(firstPreview);
      });

      expect(result.current.preview).toEqual(firstPreview);

      act(() => {
        result.current.openPreview(secondPreview);
      });

      expect(result.current.preview).toEqual(secondPreview);
    });
  });

  describe('모달 닫기', () => {
    it('모달 닫기 함수를 호출하면 모달이 닫히고 프리뷰가 초기화된다.', () => {
      const {result} = renderHook(() => usePreview());

      act(() => {
        result.current.openPreview(reviewContentStub);
      });

      expect(result.current.openModal).toBe(true);
      expect(result.current.preview).toEqual(reviewContentStub);

      act(() => {
        result.current.handleModalClose();
      });

      expect(result.current.openModal).toBe(false);
      expect(result.current.preview).toBeNull();
    });

    it('모달을 닫은 후 다시 프리뷰를 열 수 있다.', () => {
      const {result} = renderHook(() => usePreview());

      act(() => {
        result.current.openPreview(reviewContentStub);
      });

      act(() => {
        result.current.handleModalClose();
      });

      const newPreview = {...reviewContentStub, title: '새 프리뷰'};

      act(() => {
        result.current.openPreview(newPreview);
      });

      expect(result.current.openModal).toBe(true);
      expect(result.current.preview).toEqual(newPreview);
    });
  });
});
