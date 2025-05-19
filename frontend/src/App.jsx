import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ScrollTop from 'components/ScrollTop';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import router from 'routes';
import ThemeCustomization from 'themes';
import { createEmotionCache } from './_app/createEmotionCache';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './pages/error/ErrorBoundary';
import { ForceErrorPageProvider } from './_app/forceErrorPageContext';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retryOnMount: false,
      onError: (error) => {
        console.error('Query error:', error);
      },
    },
    mutations: {
      retry: false,
      useErrorBoundary: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const AppProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeCustomization>
        <ForceErrorPageProvider>
          <ErrorBoundary>
            <AuthProvider>
              <ScrollTop>
                {children}
              </ScrollTop>
            </AuthProvider>
          </ErrorBoundary>
        </ForceErrorPageProvider>
        <ToastContainer
          position='top-center'
          autoClose={2000}
          style={{ zIndex: 100000 }}
          hideProgressBar={true}
          pauseOnFocusLoss
          theme='light'
        />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeCustomization>
    </QueryClientProvider>
  );
};

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
