import {notFound} from 'next/navigation';
import {render, screen} from '@testing-library/react';
import EditReview from '../EditReview';
import {createReviewDetail, TEST_OTHER_USER_NICKNAME, TEST_USER_NICKNAME} from './stub';
import {getReviewDetail, ReviewDetail} from '@/entities/review';

jest.mock('@/entities/review/apis/api-service');
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next-router-mock/navigation'),
  notFound: jest.fn(),
}));
jest.mock('../EditReviewClient', () => ({
  __esModule: true,
  default: ({data}: {data: ReviewDetail}) => (
    <div>
      <p>{data.title}</p>
    </div>
  ),
}));

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;
const mockGetReviewDetail = getReviewDetail as jest.MockedFunction<typeof getReviewDetail>;

describe('src/views/review/edit/ui/EditReview.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    const reviewDetailStub = createReviewDetail({board_id: 5});

    beforeEach(() => {
      mockGetReviewDetail.mockImplementation(reviewId => {
        if (reviewId === 5) {
          return Promise.resolve(reviewDetailStub);
        }

        return Promise.resolve(null);
      });
    });

    it('작성자일 경우 게시글 수정 에디터가 렌더링된다.', async () => {
      render(await EditReview({reviewId: 5, sessionUserNickname: TEST_USER_NICKNAME}));

      expect(screen.getByText(reviewDetailStub.title)).toBeInTheDocument();
    });

    it('작성자가 아닌 경우 에러가 발생한다.', async () => {
      await expect(EditReview({reviewId: 5, sessionUserNickname: TEST_OTHER_USER_NICKNAME})) //
        .rejects.toThrow('작성자만 리뷰를 수정할 수 있습니다.');
    });

    it('리뷰가 존재하지 않을 경우 에러 페이지를 표시한다.', async () => {
      mockNotFound.mockImplementation(() => {
        throw new Error('NOT_FOUND');
      });

      await expect(EditReview({reviewId: 6, sessionUserNickname: TEST_USER_NICKNAME})) //
        .rejects.toThrow('NOT_FOUND');

      expect(mockNotFound).toHaveBeenCalled();
    });
  });
});
