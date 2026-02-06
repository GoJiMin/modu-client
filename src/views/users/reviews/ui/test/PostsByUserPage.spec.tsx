import {render, screen} from '@testing-library/react';
import PostsByUserPage, {generateMetadata} from '../PostsByUserPage';

/**
 * 해당 컴포넌트들은 하나의 기능들로 별도 테스트로 테스트하며,
 * 해당 페이지 컴포넌트 테스트에선 레이아웃 검증만 수행하기 위해 모킹.
 *
 * 별도로 에러 발생 시 대체 UI가 표시되는지 확인을 위해 닉네임을 통해 에러 발생 케이스 추가.
 */
jest.mock('@/features/users/profileImage/ui/ProfileImage', () => ({
  __esModule: true,
  default: ({userNickname}: {userNickname: string}) => {
    if (userNickname === 'unknown') {
      throw new Error('PROFILE_IMAGE_ERROR');
    }

    return <div>{userNickname} 프로필 이미지</div>;
  },
}));
jest.mock('@/features/users/posts', () => ({
  UserPostsList: ({userNickname}: {userNickname: string}) => {
    if (userNickname === 'unknown') {
      throw new Error('USER_POSTS_ERROR');
    }

    return <div>{userNickname} 리뷰 목록</div>;
  },
}));

describe('src/views/users/reviews/ui/PostsByUserPage.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자가 작성한 리뷰 목록을 표시하는 페이지가 렌더링된다.', async () => {
    const params = Promise.resolve({userNickname: '지민'});

    render(await PostsByUserPage({params}));

    // 사용자 정보 - UserInfo
    expect(screen.getByText('지민 프로필 이미지')).toBeInTheDocument();
    expect(screen.getByText('지민')).toBeInTheDocument();

    // 리뷰 목록 - UserPostsList
    expect(screen.getByText('지민 리뷰 목록')).toBeInTheDocument();
  });

  it('데이터 요청 중 에러 발생 시 각 영역에 대체 UI가 표시된다.', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const params = Promise.resolve({userNickname: 'unknown'});

    render(await PostsByUserPage({params}));

    // 사용자 정보 - UserInfo
    expect(screen.getByText('실패 이유: PROFILE_IMAGE_ERROR')).toBeInTheDocument();
    expect(screen.getByText('unknown')).toBeInTheDocument();

    // 리뷰 목록 - UserPostsList
    expect(screen.getByText('실패 이유: USER_POSTS_ERROR')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('인코딩된 닉네임이 정상적으로 표시된다.', async () => {
    const params = Promise.resolve({userNickname: encodeURIComponent('지민')});

    render(await PostsByUserPage({params}));

    // 사용자 정보 - UserInfo
    expect(screen.getByText('지민 프로필 이미지')).toBeInTheDocument();
    expect(screen.getByText('지민')).toBeInTheDocument();

    // 리뷰 목록 - UserPostsList
    expect(screen.getByText('지민 리뷰 목록')).toBeInTheDocument();
  });

  it('사용자 닉네임에 따라 동적으로 메타데이터를 생성할 수 있다.', async () => {
    const params = Promise.resolve({userNickname: '지민'});
    const metadata = await generateMetadata({params});

    expect(metadata.title).toBe('지민님의 후기글 모음');
    expect(metadata.description).toBe('지민님의 후기글을 모아보세요.');
    expect(metadata.openGraph.title).toBe('지민님의 후기글 모음');
  });

  it('인코딩된 닉네임도 메타데이터를 생성할 수 있다.', async () => {
    const params = Promise.resolve({userNickname: encodeURIComponent('지민')});
    const metadata = await generateMetadata({params});

    expect(metadata.title).toBe('지민님의 후기글 모음');
    expect(metadata.description).toBe('지민님의 후기글을 모아보세요.');
    expect(metadata.openGraph.title).toBe('지민님의 후기글 모음');
  });
});
