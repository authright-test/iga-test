import { QueryClientProvider } from '@tanstack/react-query';
import ScrollTop from 'components/ScrollTop';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import router from 'routes';
import ThemeCustomization from 'themes';
import { createEmotionCache } from './_app/createEmotionCache';
import { useCreateQueryClient } from './_app/queryClient.hook';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './pages/error/ErrorBoundary';
import { ForceErrorPageProvider } from './_app/forceErrorPageContext';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const AppDataProvided = (props) => {
  const { Component, pageProps } = props;
  const { queryClientRef } = useCreateQueryClient();

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
};

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <ForceErrorPageProvider>
        <ErrorBoundary>
          <AuthProvider>
            <ScrollTop>
              <RouterProvider router={router} />
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
    </ThemeCustomization>
  );
}
