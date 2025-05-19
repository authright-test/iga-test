import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions';
import StatCard from '../../components/dashboard/StatCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import {
  FiUsers,
  FiGitBranch,
  FiShield,
  FiActivity,
} from 'react-icons/fi';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, organization } = useAuth();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (organization?.id) {
      fetchDashboardData();
    }
  }, [organization]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard?organizationId=${organization.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // if (isLoading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }
  //
  // if (error) {
  //   return (
  //     <Alert severity='error' sx={{ mb: 2 }}>
  //       {error}
  //     </Alert>
  //   );
  // }

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Total Users'
            value={dashboardData?.stats?.totalUsers || 0}
            icon={FiUsers}
            color='primary'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Repositories'
            value={dashboardData?.stats?.totalRepositories || 0}
            icon={FiGitBranch}
            color='secondary'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Active Policies'
            value={dashboardData?.stats?.activePolicies || 0}
            icon={FiShield}
            color='success'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Recent Activities'
            value={dashboardData?.stats?.recentActivities || 0}
            icon={FiActivity}
            color='info'
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Recent Activities
            </Typography>
            <ActivityFeed activities={dashboardData?.recentActivities || []} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Organization: {organization?.name}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Plan: {organization?.plan || 'Free'}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Last Updated: {new Date(dashboardData?.lastUpdated).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
