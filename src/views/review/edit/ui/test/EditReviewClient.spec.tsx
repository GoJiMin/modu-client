import {patchReview} from '@/entities/review/apis/api-service';
import {createReviewDetail, TEST_USER_NICKNAME} from './stub';
import {render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import EditReviewClient from '../EditReviewClient';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import {useUserNickname} from '@/entities/auth';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/review/apis/api-service');
jest.mock('@/entities/auth');

const mockPatchReview = patchReview as jest.MockedFunction<typeof patchReview>;
const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;

describe('src/views/review/edit/ui/EditReviewClient.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('통합 렌더링 테스트', () => {
    it('에디터 내에 초기 제목, 카테고리, 내용이 입력된채로 렌더링된다.', async () => {
      const initialReviewDetail = createReviewDetail({
        board_id: 5,
        title: '초기 제목',
        category: 'book',
        content: '<p>초기 내용</p>',
      });

      render(withAllContext(<EditReviewClient data={initialReviewDetail} reviewId={5} />));

      await waitForElementToBeRemoved(screen.getByText('에디터 정보를 불러오고 있어요.'));

      expect(screen.getByDisplayValue('초기 제목')).toBeInTheDocument();
      expect(screen.getByText('책', {selector: 'span'})).toBeInTheDocument();
      expect(screen.getByText('초기 내용')).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    it('제목과 카테고리를 수정해 수정을 요청할 수 있다.', async () => {
      const user = userEvent.setup();

      const initialReviewDetail = createReviewDetail({
        board_id: 5,
        title: '초기 제목',
        category: 'book',
        content: '<p>초기 내용</p>',
      });

      let resolvePatchReview: any;
      mockPatchReview.mockImplementation(() => {
        return new Promise(resolve => {
          resolvePatchReview = resolve;
        });
      });
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);

      mockRouter.push('/');

      render(withAllContext(<EditReviewClient data={initialReviewDetail} reviewId={5} />));

      await waitForElementToBeRemoved(screen.getByText('에디터 정보를 불러오고 있어요.'));

      const categoryOptions = screen.getByRole('combobox');
      await user.click(categoryOptions);

      const foodOption = screen.getByRole('option', {name: '음식'});
      await user.click(foodOption);

      const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
      await user.type(titleInput, ' 수정');

      const saveButton = screen.getByRole('button', {name: '저장하기'});
      await user.click(saveButton);

      await screen.findByText('리뷰를 저장하고 있어요.');

      resolvePatchReview();

      await waitFor(() => {
        expect(mockPatchReview).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'food',
            title: '초기 제목 수정',
          }),
          5,
        );
        expect(mockRouter.asPath).toBe('/reviews/5');
      });
    });
  });
});
