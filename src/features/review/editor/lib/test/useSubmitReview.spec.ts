import {renderHook, act} from '@testing-library/react';
import useSubmitReview from '../useSubmitReview';
import {useUserNickname} from '@/entities/auth';
import {
  formSchemaStub,
  reviewContentStub,
  reviewPayloadStub,
  mockEditorContentGetter,
  TEST_USER_NICKNAME,
} from './stub';

jest.mock('@/entities/auth');

const mockUseUserNickname = useUserNickname as jest.MockedFunction<typeof useUserNickname>;

describe('src/features/review/editor/lib/useSubmitReview.ts', () => {
  const mockOnPreview = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockEditorContentGetter.mockReturnValue({
      html: '<p>테스트 리뷰 내용입니다.</p>',
      json: {},
    });
  });

  describe('액션 설정', () => {
    it('액션 상태를 프리뷰로 바꾸는 함수를 호출하면 액션이 프리뷰로 설정된다.', () => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionPreview();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockOnPreview).toHaveBeenCalledTimes(1);
      expect(mockOnPreview).toHaveBeenCalledWith(reviewContentStub);
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('액션 상태를 저장으로 바꾸는 함수를 호출하면 액션이 저장으로 설정된다.', () => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionSave();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(reviewPayloadStub);
      expect(mockOnPreview).not.toHaveBeenCalled();
    });
  });

  describe('콘텐츠 getter 설정', () => {
    it('컨텐츠 설정 함수를 호출하면 에디터 콘텐츠를 생성하는 함수가 설정된다.', () => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionPreview();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockEditorContentGetter).toHaveBeenCalledTimes(1);
    });
  });

  describe('프리뷰 제출', () => {
    beforeEach(() => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
    });

    it('프리뷰 액션으로 제출하면 프리뷰 콜백이 호출된다.', () => {
      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionPreview();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockOnPreview).toHaveBeenCalledTimes(1);
      expect(mockOnPreview).toHaveBeenCalledWith({
        ...formSchemaStub,
        content: '<p>테스트 리뷰 내용입니다.</p>',
        author_nickname: TEST_USER_NICKNAME,
        created_at: '0000-00-00',
      });
    });

    it('프리뷰 제출 시 에디터 콘텐츠의 HTML이 포함된다.', () => {
      const customHtml = '<h1>커스텀 HTML</h1>';
      mockEditorContentGetter.mockReturnValue({
        html: customHtml,
        json: {},
      });

      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionPreview();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockOnPreview).toHaveBeenCalledWith(
        expect.objectContaining({
          content: customHtml,
        }),
      );
    });
  });

  describe('저장 제출', () => {
    beforeEach(() => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);
    });

    it('저장 액션으로 제출하면 저장 콜백이 호출된다.', () => {
      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionSave();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith({
        ...formSchemaStub,
        content: '<p>테스트 리뷰 내용입니다.</p>',
      });
    });

    it('저장 제출 시 작성자 닉네임이 포함되지 않는다.', () => {
      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionSave();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.not.objectContaining({
          author_nickname: expect.anything(),
        }),
      );
    });
  });

  describe('에러 케이스', () => {
    it('로그인하지 않은 경우 로그인 필요 에러를 던진다.', () => {
      mockUseUserNickname.mockReturnValue(null);

      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetActionPreview();
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      try {
        act(() => {
          result.current.handleSubmit(formSchemaStub);
        });
        fail('에러가 발생해야 합니다.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('LOGIN_REQUIRED');
      }

      expect(mockOnPreview).not.toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('초기 상태', () => {
    it('기본 액션은 프리뷰다.', () => {
      mockUseUserNickname.mockReturnValue(TEST_USER_NICKNAME);

      const {result} = renderHook(() =>
        useSubmitReview({
          onPreview: mockOnPreview,
          onSave: mockOnSave,
        }),
      );

      act(() => {
        result.current.handleSetContentGetter(mockEditorContentGetter);
      });

      act(() => {
        result.current.handleSubmit(formSchemaStub);
      });

      expect(mockOnPreview).toHaveBeenCalledTimes(1);
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
