import { Box, Heading, Stack, Text, } from '@chakra-ui/react';
import React from 'react';

const StatCard = ({ title, value, change }) => {

  const isPositive = change.startsWith('+');
  const changeColor = isPositive ? 'green.500' : 'red.500';

  return (
    <Box
      p={6}
      borderRadius='lg'
      borderWidth='1px'

      boxShadow='sm'
    >
      <Stack direction='column' align='start' gap={2}>
        <Text fontSize='sm' opacity={0.8}>
          {title}
        </Text>
        <Stack align='baseline' gap={2}>
          <Heading size='lg'>
            {value}
          </Heading>
          <Text fontSize='sm' color={changeColor}>
            {change}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
};

export default StatCard;
