import {render, screen} from '@testing-library/react';
import BestReviewsGrid from '../BestReviewsGrid';
import {ReviewCard} from '@/entities/review';

const createMockReviewCard = (id: number): ReviewCard => ({
  board_id: id,
  title: `테스트 리뷰 ${id}`,
  author_nickname: 'testUser',
  category: 'food',
  preview: '테스트 미리보기',
  comments_count: 5,
  bookmarks: 10,
  image_url: 'https://example.com/image.jpg',
});

describe('src/features/reviews/best/ui/BestReviewsGrid.tsx', () => {
  it('6개의 리뷰 중 상위 3개의 리뷰 이미지는 우선 로딩된다.', () => {
    const reviews = {
      count: 6,
      reviews: Array.from({length: 6}, (_v, i) => createMockReviewCard(i + 1)),
    };

    render(<BestReviewsGrid filteredReview={reviews} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(6);

    const img1 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 1'});
    const img2 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 2'});
    const img3 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 3'});

    for (const priorityImg of [img1, img2, img3]) {
      expect(priorityImg).toHaveAttribute('loading', 'eager');
      expect(priorityImg).toHaveAttribute('fetchPriority', 'high');
    }
    const img4 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 4'});
    const img5 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 5'});
    const img6 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 6'});

    for (const lazyImg of [img4, img5, img6]) {
      expect(lazyImg).toHaveAttribute('loading', 'lazy');
      expect(lazyImg).toHaveAttribute('fetchPriority', 'low');
    }
  });

  it('리뷰가 3개 미만으로 존재해도 리뷰 이미지는 우선 로딩된다.', () => {
    const reviews = {
      count: 2,
      reviews: Array.from({length: 2}, (_v, i) => createMockReviewCard(i + 1)),
    };

    render(<BestReviewsGrid filteredReview={reviews} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    const img1 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 1'});
    const img2 = screen.getByRole('img', {name: '카드 이미지: 테스트 리뷰 2'});

    for (const priorityImg of [img1, img2]) {
      expect(priorityImg).toHaveAttribute('loading', 'eager');
      expect(priorityImg).toHaveAttribute('fetchPriority', 'high');
    }
  });
});
