import {act, renderHook} from '@testing-library/react';
import {useModal} from '../useModal';

describe('src/shared/ui/modal/lib/useModal.ts', () => {
  describe('초기 상태', () => {
    it('모달 상태의 초기값은 false이다', () => {
      const {result} = renderHook(() => useModal());

      expect(result.current.openModal).toBe(false);
    });
  });

  describe('모달 열기', () => {
    it('모달 열기 함수 호출 시 모달 상태가 true가 된다', () => {
      const {result} = renderHook(() => useModal());

      act(() => {
        result.current.handleModalOpen();
      });

      expect(result.current.openModal).toBe(true);
    });
  });

  describe('모달 닫기', () => {
    it('모달 닫기 함수 호출 시 모달 상태가 false가 된다', () => {
      const {result} = renderHook(() => useModal());

      act(() => {
        result.current.handleModalOpen();
      });

      expect(result.current.openModal).toBe(true);

      act(() => {
        result.current.handleModalClose();
      });

      expect(result.current.openModal).toBe(false);
    });

    it('모달 닫기 함수 호출 시 콜백이 실행된다', () => {
      const mockCallback = jest.fn();
      const {result} = renderHook(() => useModal(mockCallback));

      act(() => {
        result.current.handleModalOpen();
      });

      act(() => {
        result.current.handleModalClose();
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('콜백이 없어도 모달 닫기 함수는 정상 동작한다', () => {
      const {result} = renderHook(() => useModal());

      act(() => {
        result.current.handleModalOpen();
      });

      act(() => {
        result.current.handleModalClose();
      });

      expect(result.current.openModal).toBe(false);
    });
  });

  describe('여러 번 열고 닫기', () => {
    it('여러 번 열고 닫아도 상태가 올바르게 변경된다', () => {
      const mockCallback = jest.fn();
      const {result} = renderHook(() => useModal(mockCallback));

      // 첫 번째 열기/닫기
      act(() => {
        result.current.handleModalOpen();
      });
      expect(result.current.openModal).toBe(true);

      act(() => {
        result.current.handleModalClose();
      });
      expect(result.current.openModal).toBe(false);

      // 두 번째 열기/닫기
      act(() => {
        result.current.handleModalOpen();
      });
      expect(result.current.openModal).toBe(true);

      act(() => {
        result.current.handleModalClose();
      });
      expect(result.current.openModal).toBe(false);

      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });
});
