import {renderHook, act} from '@testing-library/react';
import useSearchValidate from '../useSearchValidate';
import {ERROR_MESSAGE} from '@/shared/lib/consts/errorMessage';

describe('src/features/reviews/search-bar/lib/useSearchValidate.ts', () => {
  describe('초기 상태', () => {
    it('에러 상태의 초기값이 널이다', () => {
      const {result} = renderHook(() => useSearchValidate());

      expect(result.current.error).toBeNull();
    });
  });

  describe('정상 케이스', () => {
    it('유효한 검색어는 검증을 통과한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('맛있는 치킨');
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('2글자 검색어는 검증을 통과한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('맛집');
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('20글자 검색어는 검증을 통과한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('이것은스무글자검색어입니다열');
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('한글, 영문, 숫자 혼합은 검증을 통과한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid1 = false;
      let isValid2 = false;
      let isValid3 = false;

      act(() => {
        isValid1 = result.current.validateSearchQuery('아이폰15');
      });

      act(() => {
        isValid2 = result.current.validateSearchQuery('Galaxy S24');
      });

      act(() => {
        isValid3 = result.current.validateSearchQuery('맛집123');
      });

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
      expect(isValid3).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('일부 특수문자가 포함된 검색어는 검증을 통과한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid1 = false;
      let isValid2 = false;

      act(() => {
        isValid1 = result.current.validateSearchQuery('맛집 추천');
      });

      act(() => {
        isValid2 = result.current.validateSearchQuery('아이폰-15');
      });

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('에러 케이스', () => {
    it('빈 문자열은 검증 실패한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_EMPTY);
    });

    it('1글자 검색어는 검증 실패한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('맛');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_TOO_SHORT);
    });

    it('21글자 이상 검색어는 검증 실패한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('일이삼사오육칠팔구십일이삼사오육칠팔구십일');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_TOO_LONG);
    });

    it('숫자만 입력하면 검증 실패한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid1 = false;
      let isValid2 = false;

      act(() => {
        isValid1 = result.current.validateSearchQuery('123');
      });

      act(() => {
        isValid2 = result.current.validateSearchQuery('456789');
      });

      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_ONLY_NUMBERS);
    });

    it('한글 자모만 입력하면 검증 실패한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid1 = false;
      let isValid2 = false;

      act(() => {
        isValid1 = result.current.validateSearchQuery('ㄱㄴㄷ');
      });

      act(() => {
        isValid2 = result.current.validateSearchQuery('ㅏㅓㅗ');
      });

      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_HANGUL_JAMO);
    });

    it('특수문자만 입력하면 검증 실패한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid1 = false;
      let isValid2 = false;

      act(() => {
        isValid1 = result.current.validateSearchQuery('!@#$');
      });

      act(() => {
        isValid2 = result.current.validateSearchQuery('***');
      });

      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_SPECIAL_CHARS_ONLY);
    });

    it('특수문자와 숫자만 입력하면 검증 실패한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid1 = false;
      let isValid2 = false;

      act(() => {
        isValid1 = result.current.validateSearchQuery('123!@#');
      });

      act(() => {
        isValid2 = result.current.validateSearchQuery('@#$456');
      });

      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_SPECIAL_AND_NUMBERS_ONLY);
    });
  });

  describe('검증 규칙 우선순위', () => {
    it('빈 문자열 검증이 길이 검증보다 우선한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_EMPTY);
    });

    it('길이 검증이 형식 검증보다 우선한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('1');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_TOO_SHORT);
    });
  });

  describe('에러 초기화', () => {
    it('에러 초기화 함수 호출 시 에러가 제거된다', () => {
      const {result} = renderHook(() => useSearchValidate());

      act(() => {
        result.current.validateSearchQuery('');
      });

      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_EMPTY);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('에러가 없을 때 초기화 함수를 호출해도 정상 동작한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      expect(result.current.error).toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('엣지 케이스', () => {
    it('공백으로만 이루어진 검색어는 검증을 통과한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      let isValid = false;
      act(() => {
        isValid = result.current.validateSearchQuery('   ');
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('여러 번 검증해도 올바르게 동작한다', () => {
      const {result} = renderHook(() => useSearchValidate());

      // 첫 번째 검증 - 실패
      let isValid1 = false;
      act(() => {
        isValid1 = result.current.validateSearchQuery('1');
      });

      expect(isValid1).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_TOO_SHORT);

      // 에러 초기화
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();

      // 두 번째 검증 - 성공
      let isValid2 = false;
      act(() => {
        isValid2 = result.current.validateSearchQuery('맛있는 치킨');
      });

      expect(isValid2).toBe(true);
      expect(result.current.error).toBeNull();

      // 세 번째 검증 - 실패
      let isValid3 = false;
      act(() => {
        isValid3 = result.current.validateSearchQuery('123');
      });

      expect(isValid3).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGE.INPUT_ONLY_NUMBERS);
    });
  });
});
