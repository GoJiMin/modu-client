import {act} from 'react';
import {renderHook, waitFor} from '@testing-library/react';
import mockRouter from 'next-router-mock';
import {logout} from '../../apis/api-service';
import {useLogout} from '../useLogout';
import {withAllContext} from '@/shared/lib/utils/withAllContext';

jest.mock('../../apis/api-service', () => ({
  logout: jest.fn(),
}));

jest.mock('next/navigation', () => require('next-router-mock/navigation'));

const mockLogout = logout as jest.MockedFunction<typeof logout>;

describe('src/entities/auth/model/useLogout.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('로그아웃에 성공하면 새로고침한다.', async () => {
    mockLogout.mockResolvedValue();
    const refreshSpy = jest.spyOn(mockRouter, 'reload');

    const {result} = renderHook(() => useLogout(), {
      wrapper: ({children}) => withAllContext(children),
    });

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });
  });
});
