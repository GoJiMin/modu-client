'use client';

import {useUpdateGlobalError} from '@/entities/error';
import {RequestError, RequestGetError} from '@/shared/apis/request-error';
import {MutationCache, QueryCache, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';

type Props = {
  children: React.ReactNode;
};

const ReactQueryProvider = ({children}: Props) => {
  const updateError = useUpdateGlobalError();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,

            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 5,

            retry: 0,

            throwOnError: (error: Error) =>
              error instanceof RequestGetError && error.errorHandlingType === 'errorBoundary',
          },
        },
        queryCache: new QueryCache({
          onError(error) {
            if (error instanceof RequestGetError && error.errorHandlingType === 'errorBoundary') return;
            if (error instanceof RequestError) updateError(error);
          },
        }),
        mutationCache: new MutationCache({
          onError(error) {
            if (error instanceof RequestError) updateError(error);
          },
        }),
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryProvider;
