import { Box, Button, Container, Heading, Stack, Text, } from '@chakra-ui/react';
import React from 'react';
import { FaGithub } from 'react-icons/fa';

/**
 * GitHub Login Page Component
 * A professional login page that matches GitHub Apps style
 */
const GitHubLogin = () => {
  console.log(import.meta.env.VITE_REACT_APP_API_URL)
  const [loading, setLoading] = React.useState(false);
  const handleLogin = () => {

    setLoading(true);
    window.location.href = `${import.meta.env.VITE_REACT_APP_API_URL}/auth/github`;
  };

  return (
    <Container maxW='lg' py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack gap='8'>
        <Stack gap='6'>
          <Stack gap={{ base: '2', md: '3' }} textAlign='center'>
            <Heading size={{ base: 'xl', md: '2xl' }}>GitHub Access Control</Heading>
            <Text color='gray.800'>
              Manage and control access to your GitHub organizations and repositories
            </Text>
          </Stack>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
          borderWidth='1px'
          borderColor='gray.100'
        >
          <Stack direction="column" gap='6'>
            <Button
              onClick={handleLogin}
              loading={loading}
              spinnerPlacement='start'
              loadingText={'Sign in with GitHub'}
              colorScheme='gray'
              bg='gray.100'
              color='gray.600'
              _hover={{ bg: 'gray.200' }}
              size='lg'
              width='full'
              maxW='300px'
              fontWeight='medium'
            >
              <FaGithub /> Sign in with GitHub
            </Button>
            <Text fontSize='sm' color='gray.600' textAlign='center'>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default GitHubLogin;
