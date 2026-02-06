import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {MemoryRouterProvider} from 'next-router-mock/MemoryRouterProvider';
import MyReviewCard from '../MyReviewCard';
import {createMockReviewCard} from './stub';
import {deleteReview} from '@/entities/review/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('@/entities/review/apis/api-service');

const mockDeleteReview = deleteReview as jest.MockedFunction<typeof deleteReview>;

describe('src/features/reviews/my/ui/MyReviewCard.tsx', () => {
  const cardStub = createMockReviewCard();

  describe('렌더링 테스트', () => {
    it('내가 작성한 리뷰 카드가 렌더링된다.', () => {
      render(withAllContext(<MyReviewCard card={cardStub} context="my" isAuthor priority />));

      expect(screen.getByRole('link', {name: `${cardStub.title} 리뷰 수정`})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: `${cardStub.title} 리뷰 삭제`})).toBeInTheDocument();
      expect(screen.getByRole('img', {name: `카드 이미지: ${cardStub.title}`})).toBeInTheDocument();
      expect(screen.getByText(cardStub.title)).toBeInTheDocument();
    });

    it('리뷰 카드가 렌더링된다.', () => {
      render(withAllContext(<MyReviewCard card={cardStub} context="myBookmarks" isAuthor={false} priority />));

      expect(screen.queryByRole('link', {name: `${cardStub.title} 리뷰 수정`})).not.toBeInTheDocument();
      expect(screen.queryByRole('button', {name: `${cardStub.title} 리뷰 삭제`})).not.toBeInTheDocument();
      expect(screen.getByRole('img', {name: `카드 이미지: ${cardStub.title}`})).toBeInTheDocument();
      expect(screen.getByText(cardStub.title)).toBeInTheDocument();
    });
  });

  describe('기능 테스트', () => {
    it('리뷰 수정 버튼을 클릭하면 수정 페이지로 이동한다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<MyReviewCard card={cardStub} context="my" isAuthor priority />), {
        wrapper: MemoryRouterProvider,
      });

      const editButton = screen.getByRole('link', {name: `${cardStub.title} 리뷰 수정`});
      await user.click(editButton);

      expect(mockRouter.asPath).toBe(`/reviews/${cardStub.board_id}/edit`);
    });

    it('리뷰 카드 클릭 시 해당 게시글로 이동한다.', async () => {
      const user = userEvent.setup();

      render(withAllContext(<MyReviewCard card={cardStub} context="my" isAuthor priority />), {
        wrapper: MemoryRouterProvider,
      });

      const reviewCard = screen.getByRole('link', {name: `${cardStub.title} 리뷰 이동`});
      await user.click(reviewCard);

      expect(mockRouter.asPath).toBe(`/reviews/${cardStub.board_id}`);
    });

    it('리뷰 삭제 버튼을 클릭하면 확인 모달 표시 후 확인 시 삭제한다.', async () => {
      const user = userEvent.setup();

      let resolveMockDeleteReview: any;
      mockDeleteReview.mockImplementation(() => {
        return new Promise(resolve => {
          resolveMockDeleteReview = resolve;
        });
      });

      render(withAllContext(<MyReviewCard card={cardStub} context="my" isAuthor priority />));

      const deleteButton = screen.getByRole('button', {name: `${cardStub.title} 리뷰 삭제`});
      await user.click(deleteButton);

      await screen.findByText('삭제된 항목은 복구할 수 없어요.');

      const confirmButton = screen.getByRole('button', {name: '삭제'});
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteReview).toHaveBeenCalledTimes(1);
        expect(mockDeleteReview).toHaveBeenCalledWith(cardStub.board_id);
      });

      expect(screen.getByText('리뷰를 삭제하고 있어요.'));
      resolveMockDeleteReview();
    });
  });
});
