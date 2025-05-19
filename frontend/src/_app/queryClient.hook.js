import { QueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useHandleError } from './error.hook';

export const useCreateQueryClient = () => {
  const { handleError } = useHandleError();

  const queryClientRef = useRef();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          onError: (error) => {
            handleError(error);
          },
          retry: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          retryOnMount: false,
        },
        mutations: {
          useErrorBoundary: false,
          retry: false,
        },
      },
    });
  }

  return { queryClientRef };
};
