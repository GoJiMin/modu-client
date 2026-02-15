import {QueryErrorResetBoundary} from '@tanstack/react-query';
import {ComponentType} from 'react';
import {ErrorBoundary, FallbackProps} from 'react-error-boundary';

type Props = {
  children: React.ReactNode;
  fallback: ComponentType<FallbackProps>;
};

export default function ChatErrorBoundary({children, fallback}: Props) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <ErrorBoundary onReset={reset} FallbackComponent={fallback}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
