import { toaster } from '@/components/ui/toaster';
import { Alert, Box, Button, CloseButton, Text, } from '@chakra-ui/react';
import React from 'react';

export const ErrorAlert = ({
                             title,
                             description,
                             onClose,
                             status = 'error',
                             isClosable = true,
                             ...props
                           }) => {

  return (
    <Alert.Root
      status={status}
      variant='subtle'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      textAlign='center'
      borderRadius='lg'
      p={4}
      {...props}
    >
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title mt={4} mb={1} fontSize='lg'>
          {title}
        </Alert.Title>
        <Alert.Description maxWidth='sm'>
          {description}
        </Alert.Description>
      </Alert.Content>
      {isClosable && onClose && (
        <CloseButton
          position='absolute'
          right='8px'
          top='8px'
          onClick={onClose}
        />
      )}
    </Alert.Root>
  );
};

export const ErrorPage = ({
                            title = 'Error',
                            description,
                            error,
                            onRetry,
                            ...props
                          }) => (
  <Box
    p={8}
    maxW='container.md'
    mx='auto'
    textAlign='center'
    {...props}
  >
    <Stack direction='column' gap={6}>
      <Text fontSize='2xl' fontWeight='bold'>
        {title}
      </Text>
      <Text>
        {description || error?.message || 'An unexpected error occurred'}
      </Text>
      {onRetry && (
        <Button
          colorScheme='blue'
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Stack>
  </Box>
);

export const ErrorInline = ({
                              message,
                              onClose,
                              ...props
                            }) => (
  <Alert.Root
    status='error'
    variant='left-accent'
    borderRadius='md'
    {...props}
  >
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>
        {message}
      </Alert.Title>
    </Alert.Content>
    {onClose && (
      <CloseButton
        position='absolute'
        right='8px'
        top='8px'
        onClick={onClose}
      />
    )}
  </Alert.Root>
);

export const ErrorToast = ({
                             title,
                             description,
                             status = 'error',
                             duration = 5000,
                             isClosable = true,
                             ...props
                           }) => {

  React.useEffect(() => {
    toaster.create({
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
        title='Something went wrong'
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return children;
};
