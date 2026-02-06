import mockRouter from 'next-router-mock';
import {useUserNickname} from '@/entities/auth';
import {postReview} from '@/entities/review/apis/api-service';
import {render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import NewReviewClient from '../NewReviewClient';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));
jest.mock('@/entities/review/apis/api-service');
jest.mock('@/entities/auth');

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;
const mockPostReview = postReview as jest.MockedFunction<typeof postReview>;

describe('src/views/review/new/ui/NewReviewClient.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('통합 렌더링 테스트', () => {
    it('에디터가 렌더링된다.', async () => {
      render(withAllContext(<NewReviewClient />));

      await waitForElementToBeRemoved(screen.getByText('에디터 정보를 불러오고 있어요.'));

      expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('통합 테스트', () => {
    it('제목과 카테고리를 입력해 등록을 요청할 수 있다.', async () => {
      const user = userEvent.setup();
      const TEST_USER_NICKNAME = 'jimin';

      let resolvePostReview: any;
      mockPostReview.mockImplementation(() => {
        return new Promise(resolve => {
          resolvePostReview = resolve;
        });
      });
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);

      mockRouter.push('/');

      render(withAllContext(<NewReviewClient />));

      await waitForElementToBeRemoved(screen.getByText('에디터 정보를 불러오고 있어요.'));

      const categoryOptions = screen.getByRole('combobox');
      await user.click(categoryOptions);

      const foodOption = screen.getByRole('option', {name: '음식'});
      await user.click(foodOption);

      const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
      await user.type(titleInput, '테스트 제목');

      const saveButton = screen.getByRole('button', {name: '저장하기'});
      await user.click(saveButton);

      await screen.findByText('리뷰를 저장하고 있어요.');

      resolvePostReview();

      await waitFor(() => {
        expect(mockPostReview).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'food',
            title: '테스트 제목',
          }),
        );
        expect(mockRouter.asPath).toBe('/search');
      });
    });
  });
});
