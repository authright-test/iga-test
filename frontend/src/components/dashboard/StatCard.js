import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';

const StatCard = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  trendValue,
  trendLabel,
}) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            {icon && (
              <Box
                sx={{
                  color: `${color}.main`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {icon}
              </Box>
            )}
          </Stack>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {trend && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="body2"
                color={trend === 'up' ? 'success.main' : 'error.main'}
              >
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {trendLabel}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard; 