import {FormSchemaType} from '../../model/type';
import {Category, ReviewContent, ReviewPayload} from '@/entities/review';

// 테스트용 상수
export const TEST_USER_NICKNAME = 'testUser';
export const TEST_TITLE = '테스트 리뷰 제목';
export const TEST_CATEGORY: Category = 'food';
export const TEST_CONTENT_HTML = '<p>테스트 리뷰 내용입니다.</p>';
export const TEST_CONTENT_JSON = {};

// FormSchemaType stub
export const formSchemaStub: FormSchemaType = {
  title: TEST_TITLE,
  category: TEST_CATEGORY,
};

// ReviewContent stub (프리뷰용)
export const reviewContentStub: ReviewContent = {
  title: TEST_TITLE,
  category: TEST_CATEGORY,
  content: TEST_CONTENT_HTML,
  author_nickname: TEST_USER_NICKNAME,
  created_at: '0000-00-00',
};

// ReviewPayload stub (저장용)
export const reviewPayloadStub: ReviewPayload = {
  title: TEST_TITLE,
  category: TEST_CATEGORY,
  content: TEST_CONTENT_HTML,
};

// EditorContentGetter stub
export const mockEditorContentGetter = jest.fn(() => ({
  html: TEST_CONTENT_HTML,
  json: TEST_CONTENT_JSON,
}));
