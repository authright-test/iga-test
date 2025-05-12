import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Container,
  VStack
} from '@chakra-ui/react';
import { FiGithub } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const location = useLocation();
  const boxBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  // GitHub OAuth URL
  const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI || window.location.origin;
  const scope = 'repo admin:org admin:org_hook user';
  const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  useEffect(() => {
    // Check if there's a code in the URL (OAuth callback)
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Exchange code for token
      login(code);
      
      // Clean the URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search, login]);

  return (
    <Container maxW="100vw" h="100vh" p={0} centerContent>
      <Flex
        minH="100vh"
        width="full"
        align="center"
        justify="center"
        bg={useColorModeValue('gray.50', 'gray.800')}
      >
        <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
          <VStack align="center" spacing={6}>
            <Heading
              fontWeight={700}
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              lineHeight="110%"
              textAlign="center"
            >
              GitHub{' '}
              <Text as="span" color="brand.500">
                Access Control
              </Text>
            </Heading>
            <Text color={textColor} maxW="450px" textAlign="center">
              Enterprise Identity Governance and Administration for GitHub
            </Text>
          </VStack>
          <Box rounded="lg" bg={boxBg} boxShadow="lg" p={8}>
            <Stack spacing={4}>
              <Flex align="center" justify="center" direction="column" spacing={3}>
                <Text fontSize="lg" mb={6}>
                  Sign in with your GitHub account to continue
                </Text>
                <Button
                  as="a"
                  href={githubOAuthUrl}
                  bg="black"
                  color="white"
                  size="lg"
                  leftIcon={<FiGithub />}
                  _hover={{
                    bg: 'gray.700',
                  }}
                  width="full"
                >
                  Continue with GitHub
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </Container>
  );
};

export default LoginPage; 