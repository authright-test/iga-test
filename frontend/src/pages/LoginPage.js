import { Box, Container, Heading, Stack, Text, } from '@chakra-ui/react';
import React from 'react';
import GitHubLogin from '../components/auth/GitHubLogin';

const LoginPage = () => {

  return (
    <Container maxW='lg' py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack gap='8'>
        <Stack gap='6'>
          <Stack gap={{ base: '2', md: '3' }} textAlign='center'>
            <Heading size={{ base: 'xs', md: 'sm' }}>
              Welcome to GitHub Access Control
            </Heading>
            <Text>
              Sign in with your GitHub account to manage access and permissions
            </Text>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Stack direction='column' gap='6'>
            <GitHubLogin />
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default LoginPage;
