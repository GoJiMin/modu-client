import {useCallback, useRef} from 'react';
import {EditorContentGetter, FormSchemaType, SubmitAction} from '../model/type';
import {ReviewContent, ReviewPayload} from '@/entities/review';
import {useUserNickname} from '@/entities/auth';
import {createClientError} from '@/shared/lib/utils/client-error';

type Props = {
  onPreview: (data: ReviewContent) => void;
  onSave: (data: ReviewPayload) => void;
};

function useSubmitReview({onPreview, onSave}: Props) {
  const editorContentGetterRef = useRef<EditorContentGetter>(() => ({html: '', json: {}}));
  const actionRef = useRef<SubmitAction>('preview');

  const userNickname = useUserNickname();

  const handleSetActionPreview = useCallback(() => {
    actionRef.current = 'preview';
  }, []);

  const handleSetActionSave = useCallback(() => {
    actionRef.current = 'save';
  }, []);

  const handleSetContentGetter = (getter: EditorContentGetter) => {
    editorContentGetterRef.current = getter;
  };

  const handleSubmit = (formValues: FormSchemaType) => {
    if (!userNickname) {
      throw createClientError('LOGIN_REQUIRED');
    }

    const {current: type} = actionRef;
    const {current: getContent} = editorContentGetterRef;

    const {html} = getContent();

    const commonPayload = {
      ...formValues,
      content: html,
    };

    switch (type) {
      case 'preview':
        onPreview({...commonPayload, author_nickname: userNickname, created_at: '0000-00-00'});
        break;
      case 'save':
        onSave({...commonPayload});
        break;
      /* c8 ignore next 3 */
      default:
        const _exhaustiveCheck: never = type;
        throw new Error(`허용되지 않은 저장 타입입니다. type: ${_exhaustiveCheck}`);
    }
  };

  return {handleSetActionPreview, handleSetActionSave, handleSetContentGetter, handleSubmit};
}

export default useSubmitReview;
