import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e0f5ff',
      100: '#b8dcff',
      200: '#8fc3ff',
      300: '#65aaff',
      400: '#3c91ff',
      500: '#2378e5',
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
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'sm',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'semibold',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme; 