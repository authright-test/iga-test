import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Box
      textAlign="center"
      py={10}
      px={6}
      minH="calc(100vh - 100px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={8}>
        <Heading
          display="inline-block"
          as="h1"
          size="4xl"
          bgGradient="linear(to-r, brand.400, brand.600)"
          backgroundClip="text"
        >
          404
        </Heading>
        <Text fontSize="xl">Page Not Found</Text>
        <Text color={useColorModeValue('gray.500', 'gray.300')}>
          The page you're looking for does not seem to exist
        </Text>
        <Button
          as={RouterLink}
          to="/"
          colorScheme="brand"
          variant="solid"
        >
          Go to Dashboard
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFoundPage; 