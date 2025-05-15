import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, useColorModeValue, } from '@chakra-ui/react';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    // 可以在这里添加错误日志上报
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={4} maxW="container.md" mx="auto">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="lg"
            bg={useColorModeValue('red.50', 'red.900')}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Something went wrong
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
            <Button
              mt={4}
              colorScheme="red"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
