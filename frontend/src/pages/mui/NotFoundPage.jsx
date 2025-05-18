import { Box, Container, Typography, Stack, Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 6 }, px: { xs: 0, sm: 2 } }}>
      <Stack spacing={4} alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography variant="h1" component="h1">
          404
        </Typography>
        <Typography variant="h5">
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          size="large"
        >
          Go back home
        </Button>
      </Stack>
    </Container>
  );
};

export default NotFoundPage; 