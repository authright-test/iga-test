import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { FaGithub } from 'react-icons/fa';

/**
 * GitHub Login Page Component
 * A professional login page that matches GitHub Apps style
 */
const GitHubLogin = () => {
  const [loading, setLoading] = React.useState(false);
  const handleLogin = () => {
    setLoading(true);
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/github`;
  };

  const bgColor = useColorModeValue('white', 'gray.400');
  const textColor = useColorModeValue('gray.600', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW='lg' py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing='8'>
        <Stack spacing='6'>
          <Stack spacing={{ base: '2', md: '3' }} textAlign='center'>
            <Heading size={{ base: 'xl', md: '2xl' }}>IGA</Heading>
            <Text color={textColor}>
              Manage and control access to your GitHub organizations and repositories
            </Text>
          </Stack>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={bgColor}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
          borderWidth='1px'
          borderColor={borderColor}
        >
          <VStack spacing='6'>
            <Button
              leftIcon={<Icon as={FaGithub} boxSize='5' />}
              onClick={handleLogin}
              isLoading={loading}
              spinnerPlacement='start'
              loadingText={'Sign in with GitHub'}
              colorScheme='gray'
              bg='gray.100'
              _hover={{ bg: 'gray.400' }}
              size='lg'
              width='full'
              maxW='300px'
              fontWeight='medium'
            >
              Sign in with GitHub
            </Button>
            <Text fontSize='sm' color={textColor} textAlign='center'>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </VStack>
        </Box>
      </Stack>
    </Container>
  );
};

export default GitHubLogin;
