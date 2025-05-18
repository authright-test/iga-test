import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallback = () => {
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      setError('Missing OAuth parameters.');
      return;
    }

    handleOAuthCallback(code, state)
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setError(err?.message || 'OAuth authentication failed.');
      });
    // eslint-disable-next-line
  }, []);

  if (error) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='60vh'>
        <Typography variant='h5' color='error' gutterBottom>
          OAuth 登录失败
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
        正在完成 GitHub 登录，请稍候...
      </Typography>
    </Box>
  );
};

export default OAuthCallback;
