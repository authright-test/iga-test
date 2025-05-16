import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import reportWebVitals from './reportWebVitals';
import theme from './theme';

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <Provider theme={theme}>
          <Toaster />
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </QueryClientProvider>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
