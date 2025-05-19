import { GitHub as GitHubIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Stack, Typography, } from '@mui/material';
import React from 'react';
import AuthWrapper from '../../layout/Auth/AuthWrapper';

const GitHubLoginPage = () => {
  const [loading, setLoading] = React.useState(false);
  const handleGitHubLogin = () => {
    setLoading(true);
    window.location.href = `${import.meta.env.VITE_REACT_APP_API_URL}/auth/github`;
  };

  return (
    <AuthWrapper>
      <Stack spacing={4} alignItems='center' textAlign='center'>
        <Typography variant='h3' sx={{ fontWeight: 800, color: 'text.primary' }} gutterBottom>
          Welcome to IGA
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage and control access to your GitHub organizations and repositories
        </Typography>
        <Button
          variant='contained'
          size='large'
          loading={loading}
          loadingPosition='start'
          startIcon={<GitHubIcon />}
          onClick={handleGitHubLogin}
          fullWidth
        >
          Sign in with GitHub
        </Button>
        <Typography variant='body2' color='text.secondary'>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Typography>

      </Stack>
    </AuthWrapper>
  );
};

export default GitHubLoginPage;
