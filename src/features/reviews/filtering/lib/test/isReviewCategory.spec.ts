import {isReviewCategory} from '../isReviewCategory';

describe('features/reviews/filtering/lib/isReviewCategory', () => {
  describe('정상 케이스', () => {
    it('유효한 카테고리가 전달되면 참을 반환한다', () => {
      expect(isReviewCategory('all')).toBe(true);
      expect(isReviewCategory('food')).toBe(true);
      expect(isReviewCategory('car')).toBe(true);
      expect(isReviewCategory('cosmetic')).toBe(true);
      expect(isReviewCategory('clothes')).toBe(true);
      expect(isReviewCategory('device')).toBe(true);
      expect(isReviewCategory('book')).toBe(true);
      expect(isReviewCategory('sports')).toBe(true);
    });
  });

  describe('엣지/예외 케이스', () => {
    it('널 값이 전달되면 거짓을 반환한다', () => {
      expect(isReviewCategory(null)).toBe(false);
    });

    it('빈 문자열이 전달되면 거짓을 반환한다', () => {
      expect(isReviewCategory('')).toBe(false);
    });

    it('존재하지 않는 카테고리가 전달되면 거짓을 반환한다', () => {
      expect(isReviewCategory('invalid')).toBe(false);
      expect(isReviewCategory('unknown')).toBe(false);
      expect(isReviewCategory('test')).toBe(false);
    });

    it('대소문자가 다른 카테고리가 전달되면 거짓을 반환한다', () => {
      expect(isReviewCategory('Food')).toBe(false);
      expect(isReviewCategory('FOOD')).toBe(false);
      expect(isReviewCategory('All')).toBe(false);
    });
  });
});
