import { Box, Container, Typography, Stack, Paper } from '@mui/material';
import React from 'react';
import GitHubLogin from '../../components/auth/GitHubLogin';

const LoginPage = () => {
  return (
    <Container maxWidth='sm' sx={{ py: { xs: 3, md: 6 }, px: { xs: 0, sm: 2 } }}>
      <Stack spacing={4}>
        <Stack spacing={{ xs: 1, md: 1.5 }} textAlign='center'>
          <Typography variant='h4' component='h1' gutterBottom>
            Welcome to GitHub Access Control
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Sign in with your GitHub account to manage access and permissions
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            py: { xs: 0, sm: 4 },
            px: { xs: 2, sm: 5 },
            boxShadow: { xs: 'none', sm: 1 },
            borderRadius: { xs: 0, sm: 2 },
          }}
        >
          <Stack spacing={3}>
            <GitHubLogin />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default LoginPage;
