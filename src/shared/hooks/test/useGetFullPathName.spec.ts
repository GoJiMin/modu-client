import {renderHook} from '@testing-library/react';
import {usePathname, useSearchParams} from 'next/navigation';
import useGetFullPathName from '../useGetFullPathName';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('src/shared/hooks/useGetFullPathName.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('쿼리 파라미터가 없는 경우', () => {
    it('pathname만 반환한다', () => {
      mockUsePathname.mockReturnValue('/reviews');
      mockUseSearchParams.mockReturnValue({
        size: 0,
        toString: () => '',
      } as unknown as ReturnType<typeof useSearchParams>);

      const {result} = renderHook(() => useGetFullPathName());

      expect(result.current).toBe('/reviews');
    });

    it('루트 경로도 올바르게 반환한다', () => {
      mockUsePathname.mockReturnValue('/');
      mockUseSearchParams.mockReturnValue({
        size: 0,
        toString: () => '',
      } as unknown as ReturnType<typeof useSearchParams>);

      const {result} = renderHook(() => useGetFullPathName());

      expect(result.current).toBe('/');
    });
  });

  describe('쿼리 파라미터가 있는 경우', () => {
    it('pathname?querystring 형식으로 반환한다', () => {
      mockUsePathname.mockReturnValue('/search');
      mockUseSearchParams.mockReturnValue({
        size: 1,
        toString: () => 'keyword=테스트',
      } as unknown as ReturnType<typeof useSearchParams>);

      const {result} = renderHook(() => useGetFullPathName());

      expect(result.current).toBe('/search?keyword=테스트');
    });

    it('여러 쿼리 파라미터가 있어도 올바르게 조합한다', () => {
      mockUsePathname.mockReturnValue('/reviews');
      mockUseSearchParams.mockReturnValue({
        size: 2,
        toString: () => 'category=1&page=2',
      } as unknown as ReturnType<typeof useSearchParams>);

      const {result} = renderHook(() => useGetFullPathName());

      expect(result.current).toBe('/reviews?category=1&page=2');
    });
  });
});
