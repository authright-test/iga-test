import { createSystem, defaultConfig } from '@chakra-ui/react'

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#f0f9ff' },
          100: { value: '#e0f2fe' },
          200: { value: '#bae6fd' },
          300: { value: '#7dd3fc' },
          400: { value: '#38bdf8' },
          500: { value: '#0ea5e9' },
          600: { value: '#0284c7' },
          700: { value: '#0369a1' },
          800: { value: '#075985' },
          900: { value: '#0c4a6e' },
        },
      },
      fonts: {
        heading: { value: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif` },
        body: { value: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif` },
      },
    },
    semanticTokens: {
      colors: {
        'bg-primary': {
          default: { value: 'gray.50' },
          _dark: { value: 'gray.800' },
        },
        'text-primary': {
          default: { value: 'gray.800' },
          _dark: { value: 'white' },
        },
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
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
})

export default system;
