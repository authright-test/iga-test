import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          throw new Error(errorDescription || 'Authentication failed');
        }

        if (!token) {
          throw new Error('No token received');
        }

        // Store token and update auth state
        await verifyToken(token);

        // Redirect to dashboard or home page
        navigate('/', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Authentication failed');

        // Redirect to login page after 10 seconds
        setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: { error: error.message || 'Authentication failed' }
          });
        }, 10000);
      }
    };

    handleCallback();
  }, [location, navigate, verifyToken]);

  if (error) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='60vh'>
        <Typography variant='h5' color='error' gutterBottom>
          Authentication Failed
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='60vh'>
      <CircularProgress color='primary' />
      <Typography variant='body1' mt={2} color='text.secondary'>
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default OAuthCallback;
