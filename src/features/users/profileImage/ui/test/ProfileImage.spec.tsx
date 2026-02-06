import {getProfileImageByUserNickname} from '@/entities/users/apis/api-service';
import {withAllContext} from '@/shared/lib/utils/withAllContext';
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react';
import {Suspense} from 'react';
import ProfileImage from '../ProfileImage';

jest.mock('@/entities/users/apis/api-service');

const mockGetProfileImageByUserNickname = getProfileImageByUserNickname as jest.MockedFunction<
  typeof getProfileImageByUserNickname
>;

describe('src/features/users/profileImage/ui/ProfileImage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('전달된 사용자 닉네임에 해당하는 프로필 이미지를 표시한다.', async () => {
    const IMAGE_URL = 'https://cdn.com/jimin.png';

    mockGetProfileImageByUserNickname.mockImplementation(userNickname => {
      if (userNickname === 'jimin') {
        return Promise.resolve({profileImage: IMAGE_URL});
      }

      return Promise.resolve({profileImage: 'https://cdn.com/default.png'});
    });

    render(
      withAllContext(
        <Suspense fallback={<div>loading</div>}>
          <ProfileImage userNickname="jimin" />
        </Suspense>,
      ),
    );

    await waitForElementToBeRemoved(screen.getByText('loading'));

    const profileImage = screen.getByRole('img', {name: 'jimin 프로필 이미지'});

    expect(profileImage).toHaveAttribute('src', IMAGE_URL);
    expect(profileImage).toHaveAttribute('loading', 'eager');
  });
});
