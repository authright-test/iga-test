import { Box, Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useErrorBoundary, withErrorBoundary } from 'react-use-error-boundary';
import { DatadogLogger } from '../../_app/logging';
import { useForceErrorPageContextValue } from '../../_app/forceErrorPageContext';
import GuestWrapper from '../../layout/Guest/GuestWrapper';

const AutoRedirectComponent = () => {
  const navigate = useNavigate();

  const [counter, setCounter] = useState(10);

  useEffect(() => {
    if (counter <= 0) {
      navigate('/');
    }

    const interval = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(interval);
  }, [counter]);

  return (
    <>
      <br />
      <Typography variant='body2'>
        Try refreshing the page, or going back and attempting the action again.
      </Typography>
      <Typography variant='body2'>Please contact us if this problem persists.</Typography>
      <br />
      <Typography variant='body2'>
        We will redirect to <Link href='/'>Home</Link> page in {counter} seconds.
      </Typography>
    </>
  );
};

export const ErrorPage = () => {
  return (
    <GuestWrapper>
      <Box
        sx={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
        <Typography variant='h3'>Sorry, we are having technical difficulty.</Typography>
        <AutoRedirectComponent />
      </Box>
    </GuestWrapper>
  );
};

export const ErrorBoundary = withErrorBoundary(({ children }) => {
  const { shouldForceErrorPage } = useForceErrorPageContextValue();
  const [error] = useErrorBoundary((e) => {
    DatadogLogger.logError(JSON.stringify({ message: e.message, stack: e.stack }));
  });

  if (error || shouldForceErrorPage) {
    return <ErrorPage />;
  }

  return <>{children}</>;
});
