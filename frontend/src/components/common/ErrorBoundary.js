import { Alert, Box, Button, } from '@chakra-ui/react';
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo }) => {

  return (
    <Box p={4}>
      <Alert.Root
        status='error'
        variant='subtle'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        height='200px'
      >
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title mt={4} mb={1} fontSize='lg'>
            Something went wrong
          </Alert.Title>
          <Alert.Description maxWidth='sm'>
            {error?.message || 'An unexpected error occurred'}
          </Alert.Description>
        </Alert.Content>
        <Button
          colorScheme='red'
          variant='outline'
          mt={4}
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </Alert.Root>
    </Box>
  );
};

export default ErrorBoundary;
