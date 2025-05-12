import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Extend theme for Chakra UI customization
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e0f5ff',
      100: '#b8dcff',
      200: '#8fc3ff',
      300: '#65aaff',
      400: '#3c91ff',
      500: '#2378e5', // Primary brand color
      600: '#1a5fbd',
      700: '#114794',
      800: '#082f6c',
      900: '#031845',
    },
  },
  fonts: {
    heading: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`,
    body: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 