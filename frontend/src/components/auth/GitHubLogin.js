import React from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';

/**
 * GitHub Login Button Component
 * Handles GitHub OAuth login flow
 */
const GitHubLogin = () => {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/github`;
  };

  return (
    <Button
      leftIcon={<Icon as={FaGithub} />}
      onClick={handleLogin}
      colorScheme="gray"
      bg="gray.800"
      _hover={{ bg: 'gray.700' }}
      size="lg"
      width="full"
      maxW="300px"
    >
      Login with GitHub
    </Button>
  );
};

export default GitHubLogin; 