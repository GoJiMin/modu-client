import {ChangeEvent, useId} from 'react';
import {NodeViewProps, NodeViewWrapper} from '@tiptap/react';
import useFileUpload from '../lib/useFileUpload';
import {UploadOptions} from '../model/type';
import ImageUploadDropZone from './ImageUploadDropZone';
import ImageUploadPreview from './ImageUploadPreview';
import {createClientError} from '@/shared/lib/utils/client-error';
import {ImageUploadDragArea} from '@/shared/ui/components';

function ImageUploadNode(props: NodeViewProps) {
  const {accept, maxSize} = props.node.attrs;
  const inputId = useId();
  const extension = props.extension;

  const uploadOptions: UploadOptions = {
    accept,
    maxSize,
    upload: extension.options.upload,
    onError: extension.options.onError,
  };

  const {fileItem, uploadFile, clearFileItem} = useFileUpload(uploadOptions);

  const handleUpload = async (file: File) => {
    const url = await uploadFile(file);

    if (!url) return;

    const pos = props.getPos();
    const fileName = file.name.replace(/\.[^/.]+$/, '') || 'unknown';

    props.editor
      .chain()
      .focus()
      .deleteRange({from: pos, to: pos + 1})
      .insertContentAt(pos, [
        {
          type: 'image',
          attrs: {
            src: url,
            alt: fileName,
            title: fileName,
          },
        },
      ])
      .insertContentAt(pos + 1, {type: 'paragraph'})
      .run();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      extension.options.onError?.(createClientError('NO_IMAGE_SELECTED'));
      return;
    }

    if (files.length > 1) {
      extension.options.onError?.(createClientError('TOO_MANY_IMAGES_SELECTED'));
      return;
    }

    handleUpload(files[0]);
  };

  return (
    <NodeViewWrapper className="image-upload-box not-prose py-0" tabIndex={0}>
      {!fileItem ? (
        <ImageUploadDragArea onFile={handleUpload} onError={uploadOptions.onError}>
          <ImageUploadDropZone maxSize={maxSize} inputId={inputId} />
          <input className="hidden" id={inputId} name="file" accept={accept} type="file" onChange={handleChange} />
        </ImageUploadDragArea>
      ) : (
        <ImageUploadPreview
          file={fileItem.file}
          progress={fileItem.progress}
          status={fileItem.status}
          onRemove={clearFileItem}
        />
      )}
    </NodeViewWrapper>
  );
}

export {ImageUploadNode};
