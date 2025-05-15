import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import React from 'react';

export const ErrorAlert = ({
  title,
  description,
  onClose,
  status = 'error',
  isClosable = true,
  ...props
}) => (
  <Alert
    status={status}
    variant="subtle"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    borderRadius="lg"
    p={4}
    bg={useColorModeValue(`${status}.50`, `${status}.900`)}
    {...props}
  >
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">
      {title}
    </AlertTitle>
    <AlertDescription maxWidth="sm">
      {description}
    </AlertDescription>
    {isClosable && onClose && (
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={onClose}
      />
    )}
  </Alert>
);

export const ErrorPage = ({
  title = 'Error',
  description,
  error,
  onRetry,
  ...props
}) => (
  <Box
    p={8}
    maxW="container.md"
    mx="auto"
    textAlign="center"
    {...props}
  >
    <VStack spacing={6}>
      <AlertIcon boxSize="60px" color="red.500" />
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>
        {description || error?.message || 'An unexpected error occurred'}
      </Text>
      {onRetry && (
        <Button
          colorScheme="blue"
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </VStack>
  </Box>
);

export const ErrorInline = ({
  message,
  onClose,
  ...props
}) => (
  <Alert
    status="error"
    variant="left-accent"
    borderRadius="md"
    {...props}
  >
    <AlertIcon />
    <Text>{message}</Text>
    {onClose && (
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={onClose}
      />
    )}
  </Alert>
);

export const ErrorToast = ({
  title,
  description,
  status = 'error',
  duration = 5000,
  isClosable = true,
  ...props
}) => {
  const toast = useToast();

  React.useEffect(() => {
    toast({
      title,
      description,
      status,
      duration,
      isClosable,
      position: 'top-right',
      ...props
    });
  }, [title, description, status, duration, isClosable, toast, props]);

  return null;
};

export const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <ErrorPage
        title="Something went wrong"
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return children;
};
