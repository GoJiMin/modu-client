import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

export function withAllContext(children: React.ReactNode) {
  const testQueryClient = createTestQueryClient();
  return <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
      },
    },
  });
}
