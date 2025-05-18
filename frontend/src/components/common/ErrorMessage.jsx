import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const ErrorMessage = ({
  title = 'Error',
  message,
  error,
  onRetry,
  showDetails = false,
}) => {
  const [showErrorDetails, setShowErrorDetails] = React.useState(showDetails);

  const toggleErrorDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity="error"
        icon={<ErrorIcon />}
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        <Typography variant="body2">{message}</Typography>
        {error && (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={toggleErrorDetails}
              sx={{ alignSelf: 'flex-start' }}
            >
              {showErrorDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            {showErrorDetails && (
              <Box
                component="pre"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {error.stack || error.message || JSON.stringify(error, null, 2)}
              </Box>
            )}
          </Stack>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorMessage; 