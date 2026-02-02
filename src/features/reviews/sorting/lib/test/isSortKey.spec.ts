import isSortKey from '../isSortKey';

describe('features/reviews/sorting/lib/isSortKey', () => {
  describe('정상 케이스', () => {
    it('유효한 정렬 키가 전달되면 참을 반환한다', () => {
      expect(isSortKey('recent')).toBe(true);
      expect(isSortKey('hotbookmarks')).toBe(true);
      expect(isSortKey('hotcomments')).toBe(true);
    });
  });

  describe('엣지/예외 케이스', () => {
    it('널 값이 전달되면 거짓을 반환한다', () => {
      expect(isSortKey(null)).toBe(false);
    });

    it('빈 문자열이 전달되면 거짓을 반환한다', () => {
      expect(isSortKey('')).toBe(false);
    });

    it('존재하지 않는 정렬 키가 전달되면 거짓을 반환한다', () => {
      expect(isSortKey('invalid')).toBe(false);
      expect(isSortKey('unknown')).toBe(false);
      expect(isSortKey('test')).toBe(false);
    });

    it('대소문자가 다른 정렬 키가 전달되면 거짓을 반환한다', () => {
      expect(isSortKey('Recent')).toBe(false);
      expect(isSortKey('RECENT')).toBe(false);
      expect(isSortKey('HotBookmarks')).toBe(false);
    });
  });
});
