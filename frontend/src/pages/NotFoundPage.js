import { Button, Container, Heading, Text, } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxW='lg' py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack direction='column' gap='8' align='center' justify='center' minH='60vh'>
        <Heading size='2xl'>
          404
        </Heading>
        <Text fontSize='xl'>
          Page not found
        </Text>
        <Text>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button
          colorScheme='brand'
          onClick={() => navigate('/')}
        >
          Go back home
        </Button>
      </Stack>
    </Container>
  );
};

export default NotFoundPage;
