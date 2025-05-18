import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const GitHubLogin = () => {
  const { loginWithGitHub } = useAuth();

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (err) {
      console.error('Error logging in with GitHub:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent>
          <Stack spacing={4} alignItems='center' textAlign='center'>
            <Typography variant='h4' gutterBottom>
              Welcome to GitHub Access Control
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Please sign in with your GitHub account to continue
            </Typography>
            <Button
              variant='contained'
              size='large'
              startIcon={<GitHubIcon />}
              onClick={handleGitHubLogin}
              fullWidth
            >
              Sign in with GitHub
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GitHubLogin;
