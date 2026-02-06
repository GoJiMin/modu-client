'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useGlobalError} from '@/entities/error';
import isPredictableServerError from '@/shared/lib/utils/isPredictableServerError';
import isClientError from '@/shared/lib/utils/isClientError';
import {ERROR_MESSAGE, SERVER_ERROR_MESSAGE} from '@/shared/lib/consts/errorMessage';
import {reportError} from '@/shared/lib/utils/reportError';
import {useErrorBoundary} from 'react-error-boundary';
import toast from '@/shared/ui/toast';

type Props = {
  children: React.ReactNode;
};

export default function GlobalErrorDetector({children}: Props) {
  const globalError = useGlobalError();
  const router = useRouter();

  const {showBoundary} = useErrorBoundary();

  useEffect(() => {
    if (!globalError) return;

    reportError(globalError);

    if (isPredictableServerError(globalError)) {
      toast.error({
        title: '에러가 발생했어요.',
        description: SERVER_ERROR_MESSAGE[globalError.name],
      });

      if (globalError.name === 'TOKEN_EXPIRED' || globalError.name === 'EMPTY_USER_EMAIL') {
        router.push('/');
      }

      return;
    }

    if (isClientError(globalError)) {
      toast.error({
        title: '에러가 발생했어요.',
        description: ERROR_MESSAGE[globalError.name],
      });

      return;
    }

    showBoundary(globalError);
  }, [globalError, router, showBoundary]);

  return children;
}
