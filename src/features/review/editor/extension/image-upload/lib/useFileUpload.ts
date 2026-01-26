import {useState} from 'react';
import {FileItem, UploadOptions} from '../model/type';
import {ClientError, createClientError} from '@/shared/lib/utils/client-error';
import {RequestError} from '@/shared/apis/request-error';

export default function useFileUpload(options: UploadOptions) {
  const [fileItem, setFileItem] = useState<FileItem | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const abortController = new AbortController();

    const newFileItem: FileItem = {
      file,
      progress: 0,
      status: 'uploading',
      abortController,
    };

    setFileItem(newFileItem);

    try {
      if (file.size > options.maxSize) throw createClientError('MAX_SIZE_EXCEEDED');

      const url = await options.upload(
        file,
        (event: {progress: number}) => {
          setFileItem(prev => {
            if (!prev) return null;

            return {
              ...prev,
              progress: event.progress,
            };
          });
        },
        abortController.signal,
      );

      if (!url) throw createClientError('UPLOAD_FAILED');

      setFileItem(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'success',
          progress: 100,
        };
      });

      return url;
    } catch (error) {
      if (abortController.signal.aborted) {
        return null;
      }

      setFileItem(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'error',
          progress: 0,
        };
      });

      if (error instanceof ClientError || error instanceof RequestError) {
        options.onError?.(error);
      } else {
        options.onError?.(createClientError('UPLOAD_FAILED'));
      }

      return null;
    }
  };

  const clearFileItem = () => {
    if (!fileItem) return;

    fileItem.abortController.abort();
    setFileItem(null);
  };

  return {
    fileItem,
    uploadFile,
    clearFileItem,
  };
}
